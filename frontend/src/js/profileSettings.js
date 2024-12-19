/****************************************************
 * Render update
 ****************************************************/

const renderAvatar = (url) => {
  document.getElementById("person-avatar").src =
    url || "./assets/default_avatar.png";
};

const renderMatches = async (userId, elementId) => {
  const matches = document.getElementById(elementId);
  matches.innerHTML = "";
  console.log("here:", matches);
  try {
    const response = await fetch(`/api/players/${userId}/matches?last=5`, {
      method: "GET",
    });

    if (!response.ok) {
      goToLobby();
      throw new Error("Failed to get user matches");
    }
    const json = await response.json();
    if (json.data.matches?.length == 0) matches.innerText = "No Matches yet";
    else {
      json.data.matches?.forEach((match) => {
        const newDiv = document.createElement("ul");
        newDiv.classList.add("match-results");
        let isWinner1 = undefined;
        if (match.score !== null) {
          isWinner1 = Number(match.score[0]) > Number(match.score[1]);
        }
        const matchScore = match.score
          ? match.score[0] + ":" + match.score[1]
          : "0:0";

        let team1Div = `<div class=${isWinner1 === true ? "winner-name" : ""}>
								${match.players[0]?.displayName ?? match.players[0]?.username}
								</div>`;
        let team2Div = `<div class=${isWinner1 === false ? "winner-name" : ""}>
									${match.players[1]?.displayName ?? match.players[1]?.username}
								</div>`;
        if (match.players.length == 4) {
          team1Div = `<div class=${isWinner1 === true ? "winner-name" : ""}>
									<div class="player-small-text">
									${match.players[0]?.displayName ?? match.players[0]?.username}
									</div>
									<div class="player-small-text">
									${match.players[1]?.displayName ?? match.players[1]?.username}
									</div>
								</div>`;
          team2Div = `<div class=${isWinner1 === false ? "winner-name" : ""}>
									<div class="player-small-text">
									${match.players[2]?.displayName ?? match.players[2]?.username}
									</div>
									<div class="player-small-text">
									${match.players[3]?.displayName ?? match.players[3]?.username}
									</div>
								</div>`;
        }

        const matchScoreDiv = `<div>
					  ${match.score ? "[" + matchScore + "]" : "[0:0]"}
				  </div>`;

        newDiv.innerHTML = `
								<li class="match-result">
									<div class="match-link no-cursor no-hover">
										${team1Div}
										<div class="versus-text">vs</div>
										${team2Div}
										${matchScoreDiv}
										<div>${isoDateToShortDate(match.createdAt)}</div>
									</div>
								</li>`;
        matches.append(newDiv);
      });
    }
  } catch (error) {
    console.error(error.message);
  }
};

const updateToProfile = async (index) => {
  console.log("updateToProfile called");
  const userId = window.state["loggedInUsers"][index].id;
  window.currentUserID = index;
  try {
    const response = await fetch(`/api/players/${userId}/`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }
    const json = await response.json();
    renderAvatar(json.data.avatarUrl);
    document.getElementById("person-name").innerText = json.data.displayName;
    nameUpdate(userId);
  } catch (error) {
    console.error(error.message);
  }

  document.getElementById("usernameUpdButton").onclick = () => {
    updateUsername(userId);
  };

  document.getElementById("passwordUpdButton").onclick = () => {
    updatePassword(userId);
  };

  // Stats
  try {
    const response = await fetch(`/api/players/${userId}/stats`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }
    const { data } = await response.json();
    const winsLosses = `
							<div>Wins: </div><div>${data.wins || 0}</div>
							<div>Losses: </div><div>${data.losses || 0}</div>
							`;
    const element = document.querySelector(".player-wins-loses");
    element.innerHTML = winsLosses;
  } catch (error) {
    console.error(error.message);
  }

  // Matches
  await renderMatches(userId, "person-stats");

  // Friends
  const players = document.getElementById("friends");
  players.innerHTML = "";
  try {
    const response = await fetch(`/api/players/`, {
      method: "GET",
    });

    if (!response.ok) {
      goToLobby();
      throw new Error("Failed to get potential friends");
    }

    const friendsRequest = await fetch(`/api/players/${userId}/friends/`, {
      method: "GET",
    });

    if (!friendsRequest.ok) {
      goToLobby();
      throw new Error("Failed to get actual friends");
    }

    const friends = await friendsRequest.json();

    const json = await response.json();
    if (json.data.players.length == 0) matches.innerText = "No one else exists";
    else {
      let requestPlayers = "";
      let friendPlayers = "";
      let otherPlayers = "";
      const playersArr = json.data.players.filter(
        (player) => (player.username !== "ai_player" && player.id !== userId)
      );
      for (const player of playersArr) {
        let friendMarker = friends.data.friends.find(
          (friend) => friend.id == player.id
        );
        let status = "";

        const friendStatsId = `friend-stats-${player.id}`;

        if (friendMarker) {
          if (friendMarker.complete) status = friendMarker.status;
          else if (friendMarker.forMe)
            status = `
								<button onclick='approveFriendship(${player.id})'>Approve</button>
								<button onclick='denyFriendship(${player.id})'>Deny</button>
						`;
          else if (friendMarker.forOther)
            status = "Waiting on approval of friendship";
        } else {
          status =
            "<button onclick='requestFriendship(" +
            player.id +
            ")'>Request Friendship</button>";
        }

        let content = `
				<div class="carousel-item">
					<img class="friend-avatar" src="${
            player.avatarUrl || "./assets/default_avatar.png"
          }">
					<h1 class="friend-name">${player.displayName || player.username}</h1>
					<div style="display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 0.5vw;">
						${
              friendMarker && friendMarker.complete
                ? `<img class="friend-login-status" src="./assets/${
                    friendMarker.status === "Online"
                      ? "online.png"
                      : "offline.png"
                  }">`
                : ""
            }
						<div class="friend-status">
						${status}
						</div>
						</div>
			  				<h1>Recent matches</h1>
			  				<div id="${friendStatsId}"></div>
						</div>
					</div>
				</div>
				`;
        if (friendMarker?.forMe) requestPlayers += content;
        else if (friendMarker?.complete || friendMarker?.forOther)
          friendPlayers += content;
        else otherPlayers += content;
      }

      players.innerHTML = (
        requestPlayers +
        friendPlayers +
        otherPlayers
      ).replace("carousel-item", "carousel-item active");

      for (const player of playersArr) {
        const friendStatsId = `friend-stats-${player.id}`;
        await renderMatches(player.id, friendStatsId);
      }
    }
  } catch (error) {
    console.error(error.message);
  }
};

// Avatar change

document.getElementById("newAvatar").onchange = async (e) => {
  try {
    const response = await fetch(
      `/api/players/${
        window.state["loggedInUsers"][window.currentUserID].id
      }/avatar/`,
      {
        method: "POST",
        body: e.target.files[0],
      }
    );
    if (!response.ok) throw new Error("Failed to upload");
    // Render new avatar
    const json = await response.json();
    console.log("ava json: ", json);
    renderAvatar(json.data.avatarUrl);
  } catch (error) {
    alert(error);
    return;
  }
  // Update the mini lobby
  try {
    await miniLobbyPlayersRender();
  } catch (error) {
    console.error(error.message);
  }
};

/****************************************************
 * Name update
 ****************************************************/

// Declare in global scope to remove event listeners
let handleInput;
let handleEnter;
let saveName;
let handleClick;

function nameUpdate(userId) {
  const nameElement = document.getElementById("person-name");

  let prevName = nameElement.innerText;
  const buttonElement = document.querySelector(".person-name-edit-button");

  nameElement.removeEventListener("input", handleInput);
  nameElement.removeEventListener("blur", saveName);
  nameElement.removeEventListener("keypress", handleEnter);
  buttonElement.removeEventListener("click", handleClick);

  handleInput = () => {
    nameElement.textContent = nameElement.textContent.replace(
      /[^a-zA-Z0-9\s]/g,
      ""
    );
    // Ensure the name element has a text node
    if (!nameElement.childNodes[0]) {
      nameElement.appendChild(document.createTextNode(""));
    }
    // Move the cursor to the end after filtering
    const updatedRange = document.createRange();
    const selection = window.getSelection();

    updatedRange.setStart(
      nameElement.childNodes[0],
      nameElement.textContent.length || 0
    );
    updatedRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(updatedRange);
  };

  handleEnter = async (event) => {
    if (event.key === "Enter") {
      nameElement.blur();
    }
  };

  saveName = async () => {
    console.log("prevName: ", prevName);
    if (nameElement.innerText === prevName) {
      nameElement.setAttribute("contenteditable", false);
      return;
    }
    try {
      const response = await fetch(`/api/players/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: nameElement.textContent }),
      });
      if (!response.ok) {
        console.log("prevName: ", prevName);
        throw new Error("Failed to update name");
      }
    } catch (error) {
      console.error(error.message);
      nameElement.textContent = prevName;
    } finally {
      nameElement.setAttribute("contenteditable", false);
      prevName = nameElement.innerText;
    }
    try {
      await miniLobbyPlayersRender();
    } catch (error) {
      console.error(error.message);
    }
    nameElement.setAttribute("contenteditable", false);
    await renderMatches(userId, "person-stats");
    const playersArr = await fetchPotentialFriends(userId);
    for (const player of playersArr) {
      const friendStatsId = `friend-stats-${player.id}`;
      await renderMatches(player.id, friendStatsId);
    }
  };

  handleClick = () => {
    if (!nameElement.childNodes[0]) {
      nameElement.appendChild(document.createTextNode(""));
    }
    const range = document.createRange();
    const selection = window.getSelection();
    // Place the cursor at the end of the content
    range.setStart(
      nameElement.childNodes[0],
      nameElement.textContent.length || 0
    );
    range.collapse(true);

    // Clear any existing selections and set the new range
    selection.removeAllRanges();
    selection.addRange(range);

    nameElement.setAttribute("contenteditable", true);
    nameElement.focus();

    nameElement.addEventListener("input", handleInput);
    nameElement.addEventListener("blur", saveName);
    nameElement.addEventListener("keypress", handleEnter);
  };

  buttonElement.addEventListener("click", handleClick);
}

async function updateUsername(userId) {
  const newUsername = document.getElementById("newUsername").value;
  try {
    const response = await fetch(`/api/players/${userId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: newUsername }),
    });
    if (!response.ok) {
      throw new Error("Failed to update username");
    }
    alert("Username successfully updated!");
  } catch (error) {
    console.error(error.message);
    alert("Failed to update username");
    document.getElementById("newUsername").value = "";
  }
}

async function updatePassword(userId) {
  const newPassword = document.getElementById("newPassword").value;
  try {
    const response = await fetch(`/api/players/${userId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: newPassword }),
    });
    if (!response.ok) {
      throw new Error("Failed to update password");
    }
    alert("Password successfully updated!");
  } catch (error) {
    console.error(error.message);
    alert("Failed to update password");
    document.getElementById("newPassword").value = "";
  }
}

async function fetchPotentialFriends(userId) {
  const response = await fetch(`/api/players/`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to get potential friends");
  }

  const json = await response.json();
  if (json.data.players.length == 0) return [];
  else {
    const playersArr = json.data.players.filter(
      (player) => (player.username !== "ai_player" && player.id !== userId)
    );
    return playersArr;
  }
}