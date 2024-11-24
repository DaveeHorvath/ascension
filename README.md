# Ascension

Our journey to transend at Hive

## Install

1. Clone the repo
1. `docker compose up`

## How to run

https://localhost/ - this is the lobby view, where most of the interactions, login and user dashboards will happen. its equivalent to https://localhost/index.html

### Game

https://localhost/game.html - game with 2 ai with Threejs, will expand a bit this week

## Backend endpoints

When we refer to `id`, it is always id of the built-in Django User model.

### User Management

#### Get All Players Information

- **Endpoint**: `GET /api/players/`

- **Description**: Fetch the details of all players. At least one login session required.

- **Example Response**:

```
{
	"ok": true,
	"message": "Players successfully listed!",
	"data": {
		"players": [
			{
				"id": 2,
				"username": "tony",
				"displayName": null,
				"avatarUrl": "/media/avatars/avatar1.png",
				"status": "Offline",
				"createdAt": "2024-10-17T16:33:31.517579+00:00"
			},
			{
				"id": 3,
				"username": "mary",
				"displayName": "Mary G",
				"avatarUrl": "/media/avatars/avatar2.png",
				"status": "Online",
				"createdAt": "2024-10-17T16:33:38.597270+00:00"
			}
		]
	},
	"statusCode": 200
}
```

#### Get the Player's Information

- **Endpoint**: `GET /api/players/{id}/`

- **Description**: Fetch the details of the player. At least one login session required.

- **URL Parameters**:

  - `id` (integer): The ID of the user.

- **Example Response**:

```
{
	"ok": true,
	"message": "Player information sucessfully served!",
	"data": {
		"id": 3,
		"username": "tony",
		"displayName": null,
		"avatarUrl": "/media/avatars/avatar.png",
		"status": "Online",
		"createdAt": "2024-10-17T16:33:38.597270+00:00"

	},
	"statusCode": 200
}
```

#### Create a New User

- **Endpoint**: `POST /api/players/`

- **Description**: Register a new user.

- **Request Body**:

  - `username` (string, required)
  - `password` (string, required)
  - `displayName` (string, optional)

- **Example Response**:

```
{
	"ok": true,
	"message": "Player successfully created!",
	"data": { "id": 2, "username": "tony", "displayName": null },
	"statusCode": 201
}
```

#### Update the User

- **Endpoint**: `PATCH /api/players/{id}/`

- **Description**: Update player information. At least one field in the request body required. Logged in user can only update his own information. Corresponding user login session is required.

- **URL Parameters**:

  - `id` (integer): The ID of the user.

- **Request Body**:

  - `username` (string, optional)
  - `password` (string, optional)
  - `displayName` (string, optional)

- **Example Response**:

```
{
	"ok": true,
	"message": "New data was set: username: johnny, displayName: Tony G",
	"statusCode": 200
}
```

#### Upload the Users's Avatar

- **Endpoint**: `PATCH /api/players/{id}/avatar/`

- **Description**: Upload avatar for the user. Avatars are stored at `backend/media/avatars/`. Logged in user can only update his own avatar. Corresponding user login session is required.

- **URL Parameters**:

  - `id` (integer): The ID of the user.

- **Request Body**:

  - Binary file

- **Example Response**:

```
{
	"ok": true,
	"message": "Avatar uploaded successfully!",
	"data": {"avatar_url": "/media/avatars/2_avatar.png"},
	"statusCode": 200
}
```

#### Get the Player's Stats

- **Endpoint**: `GET /api/players/{id}/stats/`

- **Description**: Fetch the player's stats such as wins and losses. At least one login session required.

- **URL Parameters**:

  - `id` (integer): The ID of the user.

- **Example Response**:

```
{
	"ok": true,
	"message": "Player results successfully retrieved!",
	"data": { "wins": 2, "losses": 2 },
	"statusCode": 200
}
```

### Authentication

Several users can be logged in at the same time. Each session is stored in cookies as `session_{id}`. `id` is index of the corresponding user entry from db.

#### Login

- **Endpoint**: `POST /auth/login/`

- **Description**: Login a user. When a new user is logged in a corresponding session `session_{id}` in cookies is created.

- **Request Body**:

  - `username` (string, required)
  - `password` (string, required)

- **Example Response**:

```
{
	"ok": true,
	"message": "Login successful for tony",
	"data": { "id": 2, "username": "tony" },
	"statusCode": 200
}
```

#### Logout

- **Endpoint**: `POST /auth/logout/{id}/`

- **Description**: Login a user. Corresponding login session for `id` required to logout.

- **URL Parameters**:

  - `id` (integer): The ID of the user.

- **Example Response**:

```
{
	"ok": true,
	"message": "Logged out id:2",
	"statusCode": 200
}
```

### Tournaments Management

#### Create a Tournament

- **Endpoint**: `POST /api/tournaments/`

- **Description**: Create a tournament with 2 blank matches. These 2 first matches will have the players assigned in the order from `userIds`. The first match will have two first players with user ids from `userIds`, The second match will have players with the next ids from `userIds`. Tournament can only be created for 4 user ids. All users in ids array must be logged in.

- **Request Body**:

  - `name` (string, required)
  - `userIds` (string array, required)

- **Example Response**:

```
{
	"ok": true,
	"message": "Tournament successfully created!",
	"data": { "id": 3, "name": "New tournament" },
	"statusCode": 201
}
```

#### Get 5 Last Tournaments

- **Endpoint**: `GET /api/tournaments/`

- **Description**: Respond with array of 5 last tournaments which have `id`, `name`, `winner` object (which represents a tournament winner with its tournament `id`, `username`, `displayName`, `avatarUrl`, `status`), `createdAt`, `matches` array of objects with a match `id`, `score`, `duration`, `createdAt` and `players` array of objects (which have the same structure as `winner` in `tournament` object). No authentication required.

- **Example Response**:

```
{
	"ok": true,
	"message": "Tournaments successfully listed!",
	"data": {
		"tournaments": [
			{
				"id": 3,
				"name": "Tournament 2024",
				"winner": {
					"id": 3,
					"username": "tony",
					"displayName": null,
					"avatarUrl": "/media/avatars/fallback.png",
					"status": "Online",
					"createdAt": "2024-10-17T16:33:38.597270+00:00"
				},
				"createdAt": "2024-11-24T02:00:13.753960+00:00",
				"matches": [
					{
						"id": 7,
						"players": [
							{
								"id": 3,
								"username": "tony",
								"displayName": null,
								"avatarUrl": "/media/avatars/fallback.png",
								"status": "Online",
								"createdAt": "2024-10-17T16:33:38.597270+00:00"
							},
							{
								"id": 4,
								"username": "mary",
								"displayName": "Mary",
								"avatarUrl": "/media/avatars/fallback.png",
								"status": "Online",
								"createdAt": "2024-10-17T16:33:38.597270+00:00"
							}
						],
						"score": "2:11",
						"duration": 6541,
						"createdAt": "2024-11-24T02:00:33.653346+00:00"
					},
					{
						"id": 5,
						"players": [
							{
								"id": 1,
								"username": "ai_player",
								"displayName": "AI Player",
								"avatarUrl": "/media/avatars/fallback.png",
								"status": "Online",
								"createdAt": "2024-10-17T16:33:38.597270+00:00"
							},
							{
								"id": 3,
								"username": "tony",
								"displayName": null,
								"avatarUrl": "/media/avatars/fallback.png",
								"status": "Online",
								"createdAt": "2024-10-17T16:33:38.597270+00:00"
							}
						],
						"score": "7:11",
						"duration": 12003,
						"createdAt": "2024-11-24T02:00:13.770529+00:00"
					},
					{
						"id": 6,
						"players": [
							{
								"id": 4,
								"username": "mary",
								"displayName": "Mary",
								"avatarUrl": "/media/avatars/fallback.png",
								"status": "Online",
								"createdAt": "2024-10-17T16:33:38.597270+00:00"
							},
							{
								"id": 5,
								"username": "paul",
								"displayName": "Paul",
								"avatarUrl": "/media/avatars/fallback.png",
								"status": "Online",
								"createdAt": "2024-10-17T16:33:38.597270+00:00"
							}
						],
						"score": "11:0",
						"duration": 5000,
						"createdAt": "2024-11-24T02:00:13.774048+00:00"
					}
				]
			},
			...
		]
	},
	"statusCode": 200
}
```

#### Get Tournament Information by ID

- **Endpoint**: `GET /api/tournaments/{id}/`

- **Description**: Fetch the details of a tournament by `id`. No authentication required.

- **URL Parameters**:

  - `id` (integer): The ID of the tournament.

- **Example Response**:

```
{
	"ok": true,
	"message": "Tournament successfully retrieved!",
	"data": {
		"tournament": {
			"id": 2,
			"name": "New tournament",
			"winner": null,
			"createdAt": "2024-11-24T01:59:07.108103+00:00",
			"matches": [
				{
					"id": 3,
					"players": [
						{
							"id": 1,
							"username": "ai_player",
							"displayName": "AI Player",
							"avatarUrl": "/media/avatars/fallback.png",
							"status": "Online",
							"createdAt": "2024-10-17T16:33:38.597270+00:00"
						},
						{
							"id": 3,
							"username": "tony",
							"displayName": null,
							"avatarUrl": "/media/avatars/fallback.png",
							"status": "Online",
							"createdAt": "2024-10-17T16:33:38.597270+00:00"
						}
					],
					"score": null,
					"duration": null,
					"createdAt": "2024-11-24T01:59:07.130409+00:00"
				},
				{
					"id": 4,
					"players": [
						{
							"id": 4,
							"username": "mary",
							"displayName": "Mary",
							"avatarUrl": "/media/avatars/fallback.png",
							"status": "Online",
							"createdAt": "2024-10-17T16:33:38.597270+00:00"
						},
						{
							"id": 5,
							"username": "paul",
							"displayName": "Paul",
							"avatarUrl": "/media/avatars/fallback.png",
							"status": "Online",
							"createdAt": "2024-10-17T16:33:38.597270+00:00"
						}
					],
					"score": null,
					"duration": null,
					"createdAt": "2024-11-24T01:59:07.134213+00:00"
				}
			]
		}
	},
	"statusCode": 200
}
```

#### Get Current Tournament for Logged in Users

- **Endpoint**: `GET /api/tournaments/current/`

- **Description**: Fetch the details of the last tournament for current users. 4 users must be logged in.

- **Example Response**:

```
{
	"ok": true,
	"message": "Tournament successfully retrieved!",
	"data": {
		"tournament": {
			"id": 1,
			"name": "New tournament",
			"winner": null,
			"createdAt": "2024-11-24T01:36:24.237332+00:00",
			"matches": [
				{
					"id": 2,
					"players": [
						{
							"id": 4,
							"username": "mary",
							"displayName": "Mary",
							"avatarUrl": "/media/avatars/fallback.png",
							"status": "Online",
							"createdAt": "2024-10-17T16:33:38.597270+00:00"
						},
						{
							"id": 5,
							"username": "paul",
							"displayName": "Paul",
							"avatarUrl": "/media/avatars/fallback.png",
							"status": "Online",
							"createdAt": "2024-10-17T16:33:38.597270+00:00"
						}
					],
					"score": null,
					"duration": null,
					"createdAt": "2024-11-24T01:36:24.252771+00:00"
				},
				{
					"id": 1,
					"players": [
						{
							"id": 1,
							"username": "ai_player",
							"displayName": "AI Player",
							"avatarUrl": "/media/avatars/fallback.png",
							"status": "Online",
							"createdAt": "2024-10-17T16:33:38.597270+00:00"
						},
						{
							"id": 3,
							"username": "tony",
							"displayName": null,
							"avatarUrl": "/media/avatars/fallback.png",
							"status": "Online",
							"createdAt": "2024-10-17T16:33:38.597270+00:00"
						}
					],
					"score": "2:11",
					"duration": null,
					"createdAt": "2024-11-24T01:36:24.249875+00:00"
				}
			]
		}
	},
	"statusCode": 200
}

```

### Matches Management

#### Get 20 Last Matches

- **Endpoint**: `GET /api/matches/`

- **Description**: Responds with array of 20 last `matches` in array of objects with a match `id`, `score`, `duration`, `createdAt` and `players` array of objects (which have the same structure as `winner` in `tournament` object). No authentication required.

- **Example Response**:

```
{
	"ok": true,
	"message": "Matches requested sucessfully!",
	"data": {
		"matches": [
			{
				"id": 7,
				"players": [
					{
						"id": 3,
						"username": "tony",
						"displayName": null,
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Online",
						"createdAt": "2024-10-17T16:33:38.597270+00:00"
					},
					{
						"id": 4,
						"username": "mary",
						"displayName": "Mary",
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Online",
						"createdAt": "2024-10-17T16:33:38.597270+00:00"
					}
				],
				"score": "2:11",
				"duration": null,
				"createdAt": "2024-11-24T02:00:33.653346+00:00"
			},
			{
				"id": 6,
				"players": [
					{
						"id": 4,
						"username": "mary",
						"displayName": "Mary",
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Online",
						"createdAt": "2024-10-17T16:33:38.597270+00:00"
					},
					{
						"id": 5,
						"username": "paul",
						"displayName": "Paul",
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Online",
						"createdAt": "2024-10-17T16:33:38.597270+00:00"
					}
				],
				"score": "11:0",
				"duration": 5000,
				"createdAt": "2024-11-24T02:00:13.774048+00:00"
			},
			{
				"id": 5,
				"players": [
					{
						"id": 1,
						"username": "ai_player",
						"displayName": "AI Player",
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Online",
						"createdAt": "2024-10-17T16:33:38.597270+00:00"
					},
					{
						"id": 3,
						"username": "tony",
						"displayName": null,
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Online",
						"createdAt": "2024-10-17T16:33:38.597270+00:00"
					}
				],
				"score": "7:11",
				"duration": null,
				"createdAt": "2024-11-24T02:00:13.770529+00:00"
			}
			...
		]
	},
	"statusCode": 200
}
```

#### Get Macthes for the Player

- **Endpoint**: `GET /api/players/{id}/matches/`

- **Description**: Respond with array of all the player's `matches` in array of objects with a match `id`, `score`, `duration`, `createdAt` and `players` array of objects (which have the same structure as `winner` in `tournament` object). At least one login session required.

- **URL Parameters**:

  - `id` (integer): The ID of the user.

- **Example Response**:

```
{
	"ok": true,
	"message": "Player matches successfully retrieved!",
	"data": {
		"matches": [
			{
				"id": 7,
				"players": [
					{
						"id": 3,
						"username": "tony",
						"displayName": null,
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Offline",
						"createdAt": "2024-11-24T01:36:08.718477+00:00"
					},
					{
						"id": 4,
						"username": "mary",
						"displayName": "Mary",
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Offline",
						"createdAt": "2024-11-24T01:36:14.914430+00:00"
					}
				],
				"score": "2:11",
				"duration": null,
				"createdAt": "2024-11-24T02:00:33.653346+00:00"
			},
			{
				"id": 5,
				"players": [
					{
						"id": 1,
						"username": "ai_player",
						"displayName": "AI Player",
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Offline",
						"createdAt": "2024-11-24T01:35:56.052291+00:00"
					},
					{
						"id": 3,
						"username": "tony",
						"displayName": null,
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Offline",
						"createdAt": "2024-11-24T01:36:08.718477+00:00"
					}
				],
				"score": "7:11",
				"duration": null,
				"createdAt": "2024-11-24T02:00:13.770529+00:00"
			},
			{
				"id": 3,
				"players": [
					{
						"id": 1,
						"username": "ai_player",
						"displayName": "AI Player",
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Offline",
						"createdAt": "2024-11-24T01:35:56.052291+00:00"
					},
					{
						"id": 3,
						"username": "tony",
						"displayName": null,
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Offline",
						"createdAt": "2024-11-24T01:36:08.718477+00:00"
					}
				],
				"score": null,
				"duration": null,
				"createdAt": "2024-11-24T01:59:07.130409+00:00"
			},
			{
				"id": 1,
				"players": [
					{
						"id": 1,
						"username": "ai_player",
						"displayName": "AI Player",
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Offline",
						"createdAt": "2024-11-24T01:35:56.052291+00:00"
					},
					{
						"id": 3,
						"username": "tony",
						"displayName": null,
						"avatarUrl": "/media/avatars/fallback.png",
						"status": "Offline",
						"createdAt": "2024-11-24T01:36:08.718477+00:00"
					}
				],
				"score": "2:11",
				"duration": null,
				"createdAt": "2024-11-24T01:36:24.249875+00:00"
			}
		]
	},
	"statusCode": 200
}
```

#### Create a New Match (1x1, 2x2 and finals for the tournament)

- **Endpoint**: `POST /api/matches/`

- **Description**: Create a new match. A match can be created only for 2 or 4 players. If the AI is in the match, the id of `ai_user` must be passed in `userIds` array. For 2 x 2 match, players with first two ids will be in the team 1 and players with the last 2 ids in array will be in the team 2. Example of `score`: "11:4", `duration`: "3000". `duration` is passed in seconds as a string. If `tournamentId` is passed, the match will be created as the finals for the tournament. The First and second matches for tournaments are always created with the tournament creation. For the AI Player, id must be passed in `userIds`. For all other users, logged in session is required.

- **Request Body**:

  - `userIds` (string array, required)
  - `tournamentId` (string, optional)
  - `score` (string, optional)
  - `duration` (string, optional)

- **Example Response**:

```
{
	"ok": true,
	"message": "Match successfully created!",
	"data": { "id": 7 },
	"statusCode": 201
}
```

#### Update the Match by ID

- **Endpoint**: `PATCH /api/matches/{id}/`

- **Description**: Update the match. Example of `score`: "11:4", `duration`: "3000". If the id would be found as the finals match in the tournament and the score is changed, winner of the tournament will be update accordingly. Users participating in the match must be logged in.

- **URL Parameters**:

  - `id` (integer): The ID of the match.

- **Request Body**:

  - `score` (string, optional)
  - `duration` (string, optional)

- **Example Response**:

```
{
	"ok": true,
	"message": "Match successfully updated!",
	"data": { "id": 6 },
	"statusCode": 201
}
```

### Friends Management

#### Get All Friends Information for the User

- **Endpoint**: `GET /api/players/{id}/friends/`

- **Description**: Fetch the details of all players for a certain user. At least one login session required.

- **URL Parameters**:

  - `id` (integer): The ID of the user.

- **Example Response**:

```
{
	"ok": true,
	"message":  "Friends successfully listed!",
	"data": {
		"friends": [
			{
				"id": 3,
				"username": "mary",
				"displayName": "Mary G",
				"status": "Online",
				"createdAt": "2024-10-17T16:33:38.597270+00:00"
			}
		]
	},
	"statusCode": 200
}
```

#### Request Friendship for the User from a Potential Friend

- **Endpoint**: `POST /api/players/{id}/friends/`

- **Description**: Send a friend request from the certain user (`id`) to a potential friend (`friendUserId`). Corresponding login session for `id` required.

- **URL Parameters**:

  - `id` (integer): The ID of the user requesting friendship.

- **Request Body**:

  - `friendUserId` (string, required): The ID of the requested friend.

- **Example Response**:

```
{
	"ok": true,
	"message": "Friend request sent successfully!",
	"data": { "status": "pending_second_first", "friend_display_name": "Mary G" },
	"statusCode": 201
}
```

#### Manage Friendship Request

- **Endpoint**: `POST /api/players/{id}/friends/manage/`

- **Description**: User (`id`) approves/rejects friendship from another user (`friendUserId`) which sent the request to be friends. Corresponding login session for `id` required. This endpoint can be also used to unfriend someone: rejection means removing requested or existing friendship. Both users involved in friendship can reject (delete) friendship. But only one of them can approve the request.

- **URL Parameters**:

  - `id` (integer): The ID of the user approving or rejecting friendship.

- **Request Body**:

  - `friendUserId` (string, required): The ID of the friend which sent the request.
  - `action` (string, required): The action to take, either "approve" or "reject".

- **Example Response**:

```
{
	"ok": true,
	"message": "Friendship approved!",
	"data": { "status": "approve" },
	"statusCode": 200
}

```

```
{
	"ok": true,
	"message": "Friendship rejected!",
	"data": { "status": "reject" },
	"statusCode": 200
}
```

### Error Responses

All error responses will inlcude the following structure.

```
{
	"ok": false,
	"error": "Unauthorized or invalid session",
	"statusCode": 401
}
```

## PLEASE EXPAND THESE WITH YOUR MODULES

### Modules done

graphics, browsers, frontend toolkit

### Modules in work

language support, multiple players, fixing the ai, game customisation with colors and speeds
