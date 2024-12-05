window.state = {
    // max size 4
    loggedInUsers: [
        {"displayname": "", "avatar": "", "id": "", "gamesPlayed": 0, "winrate": 0.0},
        {"displayname": "", "avatar": "", "id": "", "gamesPlayed": 0, "winrate": 0.0},
        {"displayname": "", "avatar": "", "id": "", "gamesPlayed": 0, "winrate": 0.0}
    ],
    // max 5
    recentMatches: [
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"}
    ],
    // max 5
    tournaments: [ 
        {"name": "", "status": "", "winner": "", "runnerUp": "", "created": "", "ended": ""},
        {"name": "", "status": "", "winner": "", "runnerUp": "", "created": "", "ended": ""},
        {"name": "", "status": "", "winner": "", "runnerUp": "", "created": "", "ended": ""},
        {"name": "", "status": "", "winner": "", "runnerUp": "", "created": "", "ended": ""}
    ]
}
window.gameStoped = true;
window.tournamentState = {
    "name": "",
    "userIds": [],
    //"data": null,  //data to be added and taken from backend . 
    // players: [
    //     {"name": "", "winrate": 0.0, status: "online", "id": "3"},
    //     {"name": "", "winrate": 0.0, status: "online", "id": "4"},
    //     {"name": "", "winrate": 0.0, status: "online", "id": "5"},
    //     {"name": "", "winrate": 0.0, status: "online", "id": "6"}
    // ],
    matches: [
        {"player1": 3, "player2": 4,  "status": 0}, // "score": "" , "id": 1
        {"player1": 5, "player2": 6,  "status": 0}, //"score": "" , "id": 2
         {"player1": "playerID", "player2": 2, "status": 0, "score": ""},
    ]
}

window.ai_id = 1
window.singleGameState = {}  //for tournament

// window.singleGameState = {   // for 4 player game  // this is working example
//     "userIds": [3, 4, 5, 6],     //  [left, left, right, right]
//     player1: 3, 
//     player2: 4,
//     player3: 5,
//     player4: 6
//    // score: "0:0",
//    // duration: 0
// }


// window.singleGameState = {   //for single 1x1 game
//     "userIds": [3, 4],     //  [left, right]  but AI will play right side in both cases: [playerID,AI_ID] and [AI_ID, playerID]. 
// }

// window.singleGameState = {   //for single game with ai
//     player1: "id1",
//     player2: 2,  // aiId is the id of the AI . It is 2 as Vladimir said
//     score: "0:0",
//     duration: 0
//     //"status": "0",
// }

//  window.singleGameState = {   // for 4 player game  // this is working example
//     player1: "3", 
//     player2: "4",
//     player3: "5",
//     player4: "6",
//     score: "0:0",
//     duration: 0
//     //"status": "0",
// }

let userinfo = {
    allMatches: [
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"},
        {"winner": "", "loser": "", "score": "11:2"}
    ],
    winrate: 0.0
}

window.updateRecentGames = () => {
    let res = fetch("localhost:8000/recentMatches")
    if (res.ok)
    {
        window.state.recentMatches = res.json();
    }
    updateRecentMatchesView();
}

window.updateRecentMatchView = () => {
    let i = 0
    let recentMatchesBoxes = document.getElementsByClassName("recentMatchesBoxes")
    recentMatchesBoxes.forEach(element => {
        let match = window.state.recentMatches[i++]
        element.innerText = match.winner + " " + match.loser + " " + match.score
    });
}