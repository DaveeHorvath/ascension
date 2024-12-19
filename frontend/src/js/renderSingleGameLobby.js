// --- Rendering single game lobby ---

// Function that renders the game lobby section with player cards
async function renderGameStart() {
  const players = window.state.loggedInUsers;

  const filledPlayers = [...players];

  if (filledPlayers.length < 1) {
    console.error(
      "Error: At least one user must be logged in to start the game."
    );
    alert("At least one user must be logged in to start the game.");
    goToLobby();
    updateHistory('lobby');
    return;
  }

  if (filledPlayers.length < 4) {
    filledPlayers.push({
      username: "AI",
      displayName: "AI Player",
      avatar: "./assets/ai_profile.png",
      gamesPlayed: 999,
      winRate: 99,
    });
  }

  const gameStartSection = document.getElementById("gameStart");
  const leftGrid = gameStartSection.querySelector(".single-game-grid-left");
  const rightGrid = gameStartSection.querySelector(".single-game-grid-right");

  leftGrid.innerHTML = "";
  rightGrid.innerHTML = "";

  function createPlayerCard(player, playerIndex, gamesPlayed, winRate) {
    return `
              <div class="game-player-card">
                  <article class="game-player-card-inner-single">
                      <h2 class="game-player-number">Player ${
                        playerIndex + 1
                      }</h2>
                      <img
                          loading="lazy"
                          src="${
                            player.avatar || "./assets/default_avatar.png"
                          }"
                          alt="Player avatar"
                          class="game-player-avatar"
                      />
                      <h3 class="game-player-name">${player.displayName}</h3>
                      <div class="game-player-stats-container">
                          <p class="game-player-statistics-param">Games played</p>
                          <p class="game-player-statistics-param-number">${
                            gamesPlayed ?? 0
                          }</p>
                      </div>
                      <div class="game-player-win-rate-container">
                          <p class="game-player-statistics-param">Win rate</p>
                          <p class="game-player-statistics-param-number last">${
                            winRate ?? 0
                          }%</p>
                      </div>
                  </article>
              </div>
          `;
  }

  const playerCards = await Promise.all(
    filledPlayers.map(async (player, index) => {
      const playerStats =
        player.username === "AI"
          ? { gamesPlayed: player.gamesPlayed, winRate: player.winRate }
          : await getPlayersStatsSingleGame(player.id);

      const { gamesPlayed, winRate } = playerStats;

      return createPlayerCard(player, index, gamesPlayed, winRate);
    })
  );

  playerCards.forEach((cardHTML) => {
    leftGrid.innerHTML += cardHTML;
    rightGrid.innerHTML += cardHTML;
  });

  gameStartSection.style.display = "block";
}

async function getPlayersStatsSingleGame(id) {
  try {
    const response = await fetch(`/api/players/${id}/matches/?last=1000`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch matches");
    }
    const json = await response.json();
    console.log(json.data.matches);
    return calculateStats(json.data.matches, id);
  } catch (error) {
    console.error(error.message);
    return { gamesPlayed: 0, winRate: 0 };
  }
}

function calculateStats(data, playerId) {
  const gamesPlayed = data.length;
  const wins = data.filter(
    (match) =>
      (Number(match.score?.[0]) > Number(match.score?.[1]) &&
        match.players[0].id === playerId) ||
      (Number(match.score?.[1]) > Number(match.score?.[0]) &&
        match.players[1].id === playerId)
  ).length;
  const winRate = gamesPlayed === 0 ? 0 : ((wins / gamesPlayed) * 100).toFixed(0);
  return { gamesPlayed, winRate };
}
