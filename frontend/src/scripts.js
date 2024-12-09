// --- Authorization part ---
document.addEventListener("DOMContentLoaded", async () => {
	try {
		const response = await fetch("/api/players/current/",
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json"
			}}
		);
		if (!response.ok) {
			throw new Error("Failed to get logged in user");
		}
		const {data} = await response.json();
		window.state.loggedInUsers = data?.players;
		console.log("state: ",window.state.loggedInUsers);
		renderPlayerPanels();
	} catch (error) {
		console.error(error.message);
	}
});


const requestSignUp = async () => {
	const username = document.getElementById("signUpUsername").value;
	const password = document.getElementById("signUpPassword").value;
	try {
	  const response = await fetch("/api/players/", {
		method: "POST",
		body: JSON.stringify({
		  username,
		  password,
		  displayName: document.getElementById("displayName").value,
		}),
	  });
	  if (!response.ok) {
		throw new Error("Failed to sign up");
	  }
	  const json = await response
		.json()
		.then(requestLogin(username, password));
	} catch (error) {
	  console.error(error.message);
	}
  };

  const printLoggedinUsers = () => {
	console.log(window.state.loggedInUsers);
  };

const requestLoginButton = async () => {
  await requestLogin(
    document.getElementById("signInUsername").value,
    document.getElementById("signInPassword").value
  );
};

const clearAuthInputs = () => {
  document.getElementById('signInUsername').value = '';
  document.getElementById('signInPassword').value = '';
  document.getElementById('displayName').value = '';
  document.getElementById('signUpUsername').value = '';
  document.getElementById('signUpPassword').value = '';
};

const requestLogin = async (_username, _password) => {
	try {
	  const response = await fetch("/api/auth/login/", {
		method: "POST",
		body: JSON.stringify({
		  username: _username,
		  password: _password,
		}),
	  });
	  if (!response.ok) {
		throw new Error("Failed to sign in");
	  }

	  const json = await response.json();
	  window.state.loggedInUsers.push(json.data);
	  clearAuthInputs(); 
	  printLoggedinUsers();
	  goToLobby();
	  renderPlayerPanels();
	} catch (error) {
	  console.error(error.message);
	  clearAuthInputs();
	}
  };

const logoutPlayer = async (index) => {
	const userId = window.state.loggedInUsers[index].id;
	try {
	  const response = await fetch(`/api/auth/logout/${userId}/`, {
		method: "POST"
	  });
	  
	  if (!response.ok) {
		throw new Error("Failed to log out");
	  }

	  window.state.loggedInUsers.splice(index, 1);
	  renderPlayerPanels();
	} catch (error) {
	  console.error(error.message);
	}
}

// --- Rendering player mini profile blocks for home page lobby ---

function renderPlayerPanels() {
	const container = document.getElementById("player-panels-container");
	container.innerHTML = "";
	console.log(window.state.loggedInUsers);
	const users = window.state.loggedInUsers.map((user, index) => {
		let panelContent = `
			<div class="player-brief-info-panel">
				<div class="profile-avatar">
				<img
				  loading="lazy"
				  src="${user.avatarUrl || "./assets/default_avatar.png"}"
				  alt="User profile avatar"
				/>
				</div>
				<h2 class="username">${
				  user.displayName || user.username
				}</h2>
				<button class="profile-button" tabindex="0">Profile</button>
				<button class="logout-button" tabindex="0" onclick="logoutPlayer(${index})">Log out</button>
			</div>
		`;
	  container.innerHTML += panelContent;
	});

	for (let i = users.length; i < 4; i++) {
	  const addPlayerPanel = `
		<div class="player-brief-info-panel">
			<h1 class="auth-title">Add player</h1>
			<button onclick="goToSignup()" class="auth-button" type="button">
				Sign up
			</button>
			<button onclick="goToSignin()" class="auth-button" type="button">
				Sign in
			</button>
		</div>
	`;
	  container.innerHTML += addPlayerPanel;
	}
}

// --- Rendering single game lobby ---

function renderGameStart() {
  const players = window.state.loggedInUsers;

  if (players.length < 1) {
    console.error(
      "Error: At least one user must be logged in to start the game."
    );
    alert("At least one user must be logged in to start the game.");
    goToLobby();
    return;
  }

  if (players.length < 4) {
    players.push({
      username: "AI",
      avatar: "./assets/ai_profile.png",
      gamesPlayed: 999,
      winRate: 75,
    });
  }

  const gameStartSection = document.getElementById("gameStart");
  const leftGrid = gameStartSection.querySelector(".single-game-grid-left");
  const rightGrid = gameStartSection.querySelector(".single-game-grid-right");

  leftGrid.innerHTML = "";
  rightGrid.innerHTML = "";

  function createPlayerCard(player, playerIndex) {
    return `
            <div class="game-player-card">
                <article class="game-player-card-inner-single">
                    <h2 class="game-player-number">Player ${
                      playerIndex + 1
                    }</h2>
                    <img
                        loading="lazy"
                        src="${player.avatar || "./assets/default_avatar.png"}"
                        alt="Player avatar"
                        class="game-player-avatar"
                    />
                    <h3 class="game-player-name">${player.username}</h3>
                    <div class="game-player-stats-container">
                        <p class="game-player-statistics-param">Games played</p>
                        <p class="game-player-statistics-param-number">${
                          player.gamesPlayed ?? 0
                        }</p>
                    </div>
                    <div class="game-player-win-rate-container">
                        <p class="game-player-statistics-param">Win rate</p>
                        <p class="game-player-statistics-param-number last">${
                          player.winRate ?? 0
                        }%</p>
                    </div>
                </article>
            </div>
        `;
  }

  players.forEach((player, index) => {
    const cardHTML = createPlayerCard(player, index);
    leftGrid.innerHTML += cardHTML;
    rightGrid.innerHTML += cardHTML;
  });

  gameStartSection.style.display = "block";
}

// --- Creating tournament lobby ---

function createTournament() {
  const tournamentGrid = document.querySelector(".tournament-grid");
  const firstSemifinalContent = document.getElementById("firstSemifinalContent");
  const secondSemifinalContent = document.getElementById("secondSemifinalContent");
  const tournamentTitle = document.getElementById("tournamentTitle");

  function getPlayers() {
    const players = window.state.loggedinUsers;
    if (players.length < 3) {
      console.error(
        "Error: At least three users must be logged in to start the tournament."
      );
      alert(
        "Error: At least three users must be logged in to start the tournament."
      );
      goToLobby();
      return [];
    }
    return players;
  }

  function getTournamentName() {
    const tournamentNameInput = document.getElementById("tournamentName");
    return tournamentNameInput.value.trim();
  }

  function generatePlayerCards(players) {
    tournamentGrid.innerHTML = "";

    const filledPlayers = [...players];
    if (filledPlayers.length < 4) {
      filledPlayers.push({
        id: 1,
        username: `AI`,
        winRate: "75%",
        avatar: "./assets/ai_profile.png",
      });
    }

    filledPlayers.forEach((player, index) => {
      const playerCard = document.createElement("div");
      playerCard.className = "game-player-card";
      playerCard.innerHTML = `
        <article class="tournament-game-player-card-inner">
          <h2 class="game-player-number">Player ${index + 1}</h2>
          <img
            loading="lazy"
            src="${player.avatar || "./assets/default_avatar.png"}"
            alt="Player avatar"
            class="game-player-avatar"
          />
          <h3 class="game-player-name">${player.username}</h3>
          <div class="game-player-win-rate-container">
            <p class="game-player-statistics-param">Win rate</p>
            <p class="game-player-statistics-param-number last">${
              player.winRate ?? 0
            }</p>
          </div>
        </article>
      `;
      tournamentGrid.appendChild(playerCard);
    });
    return filledPlayers;
  }

  function addLabelsToPlayers(players) {
    players.forEach((player, index) => {
      player.label = `Player ${index + 1}`;
    });
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
  }

  function generateMatchContent(player1, player2) {
    return `
      <div class="tournament-match-players">
        <div class="tournament-match-player-info-left">
          <img loading="lazy" src="${
            player1.avatar || "./assets/default_avatar.png"
          }" alt="Player avatar" class="tournament-match-avatar" />
          <h3 class="game-player-name tournament">${player1.label}</h3>
        </div>
        <h2 class="tournament-match-left-score">-</h2>
        <img class="tournament-match-vs-logo" src="./assets/vs_logo.png" alt="Versus logo" />
        <h2 class="tournament-match-right-score">-</h2>
        <div class="tournament-match-player-info-right">
          <img loading="lazy" src="${
            player2.avatar || "./assets/default_avatar.png"
          }" alt="Player avatar" class="tournament-match-avatar" />
          <h3 class="game-player-name tournament">${player2.label}</h3>
        </div>
      </div>
    `;
  }

  function generateTitle(title) {
    return `<h1 class="tournament-name-text">${title}</h1>`;
  }

  function generateSemifinals(filledPlayers) {
    shuffle(filledPlayers);
    const [player1, player2, player3, player4] = filledPlayers;

    window.tournamentState.userIds = [];
    window.tournamentState.userIds.push(
      player1.id,
      player2.id,
      player3.id,
      player4.id
    );

    firstSemifinalContent.innerHTML = "";
    secondSemifinalContent.innerHTML = "";

    firstSemifinalContent.innerHTML = `
      <h1 class="tournament-match-title">Semifinal 1</h1>
      ${generateMatchContent(player1, player2)}
    `;

    secondSemifinalContent.innerHTML = `
      <h1 class="tournament-match-title">Semifinal 2</h1>
      ${generateMatchContent(player3, player4)}
    `;
  }

  const players = getPlayers();
  const generateSFButton = document.getElementById("generateSF");

  if (players.length > 0) {
    const filledPlayers = generatePlayerCards(players);
    addLabelsToPlayers(filledPlayers);

    const tournamentName = getTournamentName();

    window.tournamentState.name = tournamentName;
    tournamentTitle.innerHTML = generateTitle(window.tournamentState.name);

    // Bind the click event of the "Generate bracket" button
    generateSFButton.addEventListener("click", function () {
      generateSemifinals(filledPlayers);
      console.log(window.tournamentState);
    });
  }

  // Reset tournament state on "Back to menu"
  function resetTournament() {
    window.tournamentState.name = "";

    firstSemifinalContent.innerHTML = '<h2 class="tournament-round h2" id="firstSemifinal">Semifinal 1</h2>';
    secondSemifinalContent.innerHTML = '<h2 class="tournament-round h2" id="secondSemifinal">Semifinal 2</h2>';
  }

  const backToMenuButton = document.getElementById("backToMenu");
  backToMenuButton.addEventListener("click", function () {
    resetTournament();
    goToLobby();
  });
}