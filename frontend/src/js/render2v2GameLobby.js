function render2v2GameStart() {
  console.log("here");
  const players = window.state["loggedInUsers"];

  if (players.length < 4) {
    console.error("Error: 4 people needed for this mode");
    alert("Error: 4 people needed for this mode");
    goToLobby();
    updateHistory('lobby');
    return;
  }

  const gameStartSection = document.getElementById("gameStart2v2");
  const leftGrid = gameStartSection.querySelector("#double-game-grid-left");
  const rightGrid = gameStartSection.querySelector("#double-game-grid-right");

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
                  src="${
                    player.avatar || "./assets/default_avatar.png"
                  }"
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
  updateHistory('gamestart2v2');
}