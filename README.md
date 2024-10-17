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
				"status": "Offline",
				"createdAt": "2024-10-17T16:33:31.517579+00:00"
			},
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
	"data": { "username": "tony", "displayName": null, "status": "Online" },
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

### Friends Management

#### Get All Friends Information for the User

- **Endpoint**: `GET /api/players/{id}/friends/`

- **Description**: Fetch the details of all players for a certain user. At least one login session required.

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
