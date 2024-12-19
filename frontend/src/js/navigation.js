history.replaceState({ view: "lobby" }, "");

/* Collection of all the buttons that transition the views */
/* adding history, that is stored in the urlparameters */

const views = {
  signup: goToSignup,
  signin: goToSignin,
  lobby: goToLobby,
  matchView: goToMatchView,
  gamestart: goToGameStart,
  gamestart2v2: goTo2v2GameStart,
  tournament: goToTournament,
  profile: goToProfile,
  homenavigation: goToHomeNavigation,
  loadedtournament: goToLoadedTournament,
};

window.addEventListener("popstate", (e) => {
  e.preventDefault();
  if (e.state) 
  {
    if (e.state['index'])
      views[e.state["view"]](e.state['index']);
    else
      views[e.state["view"]]();
  }
  window.gameStoped = true;
});

const updateHistory = (f) => {
  Object.entries(views).forEach((key) => {
    if (key[0] == f) {
      history.pushState({ view: key[0] }, null, "");
      console.log(key[0]);
    }
  });
};

/* home screen transitions */

const homeLeft = document.getElementsByClassName("homeLeft")[0];
const homeRight = document.getElementsByClassName("homeRight")[0];

const signup = document.getElementsByClassName("signup")[0];
const signin = document.getElementsByClassName("signin")[0];

const matchView = document.getElementsByClassName("matchView")[0];

/* section transitions */

const lobby = document.getElementById("lobby");
const gameStart = document.getElementById("gameStart");

const tournament = document.getElementById("tournament");
const profile = document.getElementById("profile");
const tournamentSetup = document.getElementById("tournamentSetup");
const otherGameStart = document.getElementById("gameStart2v2");

const header = document.getElementById("header");

/* overlay to protect background buttons from being accidentally clicked */
const overlay = document.getElementById("overlay");

/* tournament transitions */
const firstSemifinal = document.getElementById("firstSemifinal");
const secondSemifinal = document.getElementById("secondSemifinal");
const firstSemifinalContent = document.getElementById("firstSemifinalContent");
const secondSemifinalContent = document.getElementById(
  "secondSemifinalContent"
);
const finalContent = document.getElementById("finalContent");
const final = document.getElementById("final");
const startFirstSemifinalButton = document.getElementById("startFirstSF");
const startSecondSemifinalButton = document.getElementById("startSecondSF");
const startFinalButton = document.getElementById("startFinal");
const tournamentResults = document.getElementById("tournamentResults");
const tournamentStatistics = document.getElementById("tournamentStatistics");

function goToSignup() {
  goToHomeNoHistory();
  homeLeft.style.display = "none";
  signin.style.display = "none";
  signup.style.display = "block";
  matchView.style.display = "none";
  homeRight.style.display = "grid";
}

function goToSignin() {
  goToHomeNoHistory();
  homeLeft.style.display = "none";
  signin.style.display = "block";
  signup.style.display = "none";
  matchView.style.display = "none";
  homeRight.style.display = "grid";
}

async function goToLobby() {
  goToHomeNoHistory();
  homeLeft.style.display = "grid";
  signin.style.display = "none";
  signup.style.display = "none";
  matchView.style.display = "none";
  homeRight.style.display = "grid";
  gameStart.style.display = "none";
  otherGameStart.style.display = "none";
  await renderRecentMatches();
	await renderRecentTournaments();
}

async function goToMatchView(matchId) {
  goToHomeNoHistory();
  homeLeft.style.display = "grid";
  signin.style.display = "none";
  signup.style.display = "none";
  matchView.style.display = "block";
  homeRight.style.display = "none";
  updateHistory(goToMatchView);
  await renderDetailedMatchStats(matchId);
}

function goToHomeRight() {
  goToHomeNoHistory();
  homeLeft.style.display = "grid";
  signin.style.display = "none";
  signup.style.display = "none";
  matchView.style.display = "none";
  homeRight.style.display = "grid";
}

function goToHomeNoHistory() {
  lobby.style.display = "block";
  gameStart.style.display = "none";
  otherGameStart.style.display = "none";
  tournament.style.display = "none";
  profile.style.display = "none";
  tournamentSetup.style.display = "none";
  overlay.style.display = "none";
}

function runGame() {
  lobby.style.display = "none";
  gameStart.style.display = "none";
  otherGameStart.style.display = "none";
  tournament.style.display = "none";
  profile.style.display = "none";
  tournamentSetup.style.display = "none";
  overlay.style.display = "none";
  updateHistory(runGame);
}

function goToGameStart() {
  lobby.style.display = "none";
  gameStart.style.display = "block";
  tournament.style.display = "none";
  profile.style.display = "none";
  overlay.style.display = "none";
  otherGameStart.style.display = "none";
  renderGameStart();
}

async function goToTournament() {
  lobby.style.display = "none";
  gameStart.style.display = "none";
  overlay.style.display = "none";
  profile.style.display = "none";
  tournamentSetup.style.display = "none";
  tournament.style.display = "block";
  firstSemifinalContent.style.display = "flex";
  secondSemifinalContent.style.display = "flex";
  finalContent.style.display = "none";
  startFirstSemifinalButton.style.display = "block";
  startSecondSemifinalButton.style.display = "none";
  startFinalButton.style.display = "none";
  tournamentResults.style.display = "none";
  tournamentStatistics.style.display = "none";

  await createTournament();
}

async function goToLoadedTournament(id) {
  lobby.style.display = "none";
  gameStart.style.display = "none";
  overlay.style.display = "none";
  profile.style.display = "none";
  tournamentSetup.style.display = "none";
  tournament.style.display = "block";
  firstSemifinalContent.style.display = "flex";
  secondSemifinalContent.style.display = "flex";
  finalContent.style.display = "none";
  startFirstSemifinalButton.style.display = "none";
  startSecondSemifinalButton.style.display = "none";
  startFinalButton.style.display = "none";
  tournamentResults.style.display = "none";
  tournamentStatistics.style.display = "none";

  await loadTournament(id);
  updateHistory(goToLoadedTournament);
}

function goToTournamentStatistics() {
  overlay.style.display = "block";
  tournamentStatistics.style.display = "block";
}

function goToTournamentFromStats() {
  overlay.style.display = "none";
  tournamentStatistics.style.display = "none";
}

function goToProfile() {
  lobby.style.display = "none";
  gameStart.style.display = "none";
  tournament.style.display = "none";
  profile.style.display = "block";
}

function goTo2v2GameStart() {
  lobby.style.display = "none";
  gameStart.style.display = "none";
  tournament.style.display = "none";
  profile.style.display = "none";
  otherGameStart.style.display = "block";
  render2v2GameStart();
}

function goToHomeNavigation() {
  homeLeft.style.display = "grid";
  homeRight.style.display = "grid";
  signin.style.display = "none";
  signup.style.display = "none";
  matchView.style.display = "none";
  updateHistory(goToHomeNavigation);
}

function openTournamentSetupBox() {
  tournamentSetup.style.display = "block";
  overlay.style.display = "block";
  overlay.style.pointerEvents = "auto";
}

function closeTournamentSetupBox() {
  tournamentSetup.style.display = "none";
  overlay.style.display = "none";
  overlay.style.pointerEvents = "none";
}

window.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".navigation-header-item");
  navItems[0].classList.add("active");
});