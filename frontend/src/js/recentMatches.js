console.log("Fetch recent matches script loaded");
document.addEventListener("DOMContentLoaded", async () => {
	window.state.recentMatches = await fetchRecentMatches();
	renderRecentMatches();
});

function renderRecentMatches() {
	const data = window.state.recentMatches
	console.log(data);
	const matchList = document.querySelector(".match-results");
	matchList.innerHTML = "";

	if (!data || !matchList) {
		return;
	}
	data?.matches?.map((match) => {
		const newDiv = document.createElement("div");
		let isWinner1 = undefined;
		if (match.score !== null) {
			isWinner1 = match.score[0] > match.score[1];
		}
		const matchScore = match.score ? match.score[0] + ":" + match.score[1] : "0:0";
		newDiv.innerHTML = `
			<li class="match-result">
			<p onclick="goToMatchView()" class="match-link">
				<span class=${isWinner1 === true ? "winner-name" : ""}>
					${match.players[0]?.displayName ?? match.players[0]?.username}
				</span> vs <span class=${isWinner1 === false ? "winner-name" : ""}>
					${match.players[1]?.displayName ?? match.players[1]?.username}
				</span> ${match.score ? "[" + matchScore + "]" : "[0:0]"}
			</p>
			</li>`;
		matchList.appendChild(newDiv);
	});
}

async function fetchRecentMatches() {
	try {
		const response = await fetch("/api/matches/", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const { data } = await response.json();
		if (!data) {
			throw new Error("No data");
		}
		return data;

	} catch (error) {
		console.error(error);
		return null;
	}
}