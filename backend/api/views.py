import os
import json
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import Player, Match, Friendship, Tournament, TournamentParticipant
from django.db.models import Count, Q
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth import authenticate
from .decorators import session_authenticated_logged_in, session_authenticated_id

from .sessions import create_encrypted_session_value, decrypt_session_value
from django.contrib.auth.hashers import make_password
from django.core.files.base import ContentFile
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse

import requests
from django.utils.crypto import get_random_string
from urllib.parse import urlencode

from django.core.exceptions import BadRequest

from django.utils import timezone
from datetime import timedelta

from .constants import AI_ID, PLAYER_KEYS, WINNER_LOSER_KEYS

import re


##################################
# CSRF
##################################


@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"message": "CSRF token set"})


##################################
# Manage players
##################################


@csrf_exempt
def manage_players(request):
    if request.method == "GET":
        try:
            return get_players(request)
        except Exception as e:
            return JsonResponse(
                {"ok": False, "error": str(e), "statusCode": 500}, status=500
            )

    if request.method == "POST":
        try:
            return create_player(request)
        except IntegrityError:
            return JsonResponse(
                {"ok": False, "error": "User already exists", "statusCode": 400},
                status=400,
            )
        except Exception as e:
            return JsonResponse(
                {"ok": False, "error": str(e), "statusCode": 500}, status=500
            )

    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


def check_status(player):
    five_minutes_ago = timezone.now() - timedelta(minutes=5)
    if not player.last_active_at or player.last_active_at < five_minutes_ago:
        return "Offline"
    return "Online"


@session_authenticated_logged_in
def get_players(request):
    players = Player.objects.all()
    players_data = [form_player_json(player) for player in players]
    return JsonResponse(
        {
            "ok": True,
            "message": "Players successfully listed!",
            "data": {"players": players_data},
            "statusCode": 200,
        },
        status=200,
    )


def create_player(request):
    if not request.body:
        raise BadRequest("No data provided")
    data = json.loads(request.body)
    # Extract required fields from the request body
    username = data.get("username")
    password = data.get("password")
    display_name = data.get("displayName")

    if not username:
        return JsonResponse(
            {"ok": False, "error": "User name is required", "statusCode": 400},
            status=400,
        )
    if not password:
        return JsonResponse(
            {"ok": False, "error": "Password is required", "statusCode": 400},
            status=400,
        )
    # Create the user
    user = User.objects.create_user(username=username, password=password)
    # Create the player with the associated user
    player = Player.objects.create(user=user, display_name=display_name)

    # Return success response
    return JsonResponse(
        {
            "ok": True,
            "message": "Player successfully created!",
            "data": {
                "id": player.user.id,
                "username": user.username,
                "displayName": player.display_name,
            },
            "statusCode": 201,
        },
        status=201,
    )


##################################
# Login / Logout
##################################


@csrf_exempt
def custom_login(request):
    try:
        if not request.body:
            raise BadRequest("No data provided")
        if request.method == "POST":
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            # Authenticate the user
            user = authenticate(request, username=username, password=password)
            if user is not None:
                # Create a unique session key
                session_key = f"session_{user.id}"

                # Encrypt user session data
                session_value = create_encrypted_session_value(
                    {
                        "id": user.id,
                        "username": user.username,
                        "is_authenticated": True,
                    }
                )

                # Set the session in the cookies
                response = JsonResponse(
                    {
                        "ok": True,
                        "message": f"Login successful for {username}",
                        "data": {"id": user.id, "username": username},
                        "statusCode": 200,
                    },
                    status=200,
                )
                # response.set_cookie(session_key, session_value, httponly=True, secure=True) // secure will work with HTTPS only
                response.set_cookie(session_key, session_value, httponly=True)

                return response
            else:
                return JsonResponse(
                    {"ok": False, "error": "Invalid credentials", "statusCode": 401},
                    status=401,
                )
    except Exception as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 500}, status=500
        )
    return JsonResponse(
        {"ok": False, "error": "Method not allowed", "statusCode": 405}, status=405
    )


@csrf_exempt
@session_authenticated_id
def custom_logout(request, id):
    if request.method == "POST":
        session_key = f"session_{id}"

        # Check if the session exists for the given user
        if session_key in request.COOKIES:
            # Create a response object
            response = JsonResponse(
                {"ok": True, "message": f"Logged out id:{id}", "statusCode": 200}
            )
            # Delete the session cookie by setting it to an empty value and an expired date
            response.delete_cookie(session_key)
            return response
        else:
            return JsonResponse(
                {
                    "ok": False,
                    "error": f"No active session for id:{id}",
                    "statusCode": 404,
                },
                status=404,
            )
    return JsonResponse(
        {"ok": False, "error": "Method not allowed", "statusCode": 405}, status=405
    )


##################################
# Manage player
##################################


@csrf_exempt
def manage_player(request, id):
    try:
        if request.method == "GET":
            return get_player(request, id=id)
        if request.method == "PATCH":
            return update_player(request, id=id)
    except Exception as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 500}, status=500
        )

    return JsonResponse({"ok": False, "error": "Invalid request method"}, status=405)


@session_authenticated_logged_in
def get_player(request, id):
    try:
        user = User.objects.get(id=id)
        player = user.player
        player_data = form_player_json(player)
        return JsonResponse(
            {
                "ok": True,
                "message": "Player information sucessfully served!",
                "data": player_data,
                "statusCode": 200,
            },
            status=200,
        )
    except ObjectDoesNotExist:
        return JsonResponse(
            {"ok": False, "error": "Player not found", "statusCode": 404},
            status=404,
        )


@session_authenticated_id
def update_player(request, id):
    try:
        message = "New data was set: "
        if not request.body:
            raise BadRequest("No data provided")
        data = json.loads(request.body)
        new_username = data.get("username")
        new_password = data.get("password")
        new_display_name = data.get("displayName")
        if not new_username and not new_password and not new_display_name:
            return JsonResponse(
                {
                    "ok": False,
                    "error": "You need to provide at least one field",
                    "statusCode": 400,
                },
                status=400,
            )

        user = User.objects.get(id=id)
        player = Player.objects.get(user=user)
        if new_username:
            user.username = new_username
        if new_password:
            user.password = make_password(new_password)
        if new_display_name:
            player.display_name = new_display_name
        message += ", ".join(
            [
                f"{key}: {value}"
                for key, value in data.items()
                if value and key != "password"
            ]
        )
        player.save()
        user.save()
        return JsonResponse(
            {
                "ok": True,
                "message": message,
                "statusCode": 200,
            }
        )
    except User.DoesNotExist:
        return JsonResponse(
            {"ok": False, "error": "User not found", "statusCode": 404}, status=404
        )
    except Player.DoesNotExist:
        return JsonResponse(
            {"ok": False, "error": "Player not found", "statusCode": 404},
            status=404,
        )
    except IntegrityError as e:
        return JsonResponse(
            {
                "ok": False,
                "error": "Integrity error occurred: " + str(e),
                "statusCode": 400,
            },
            status=400,
        )


@csrf_exempt
@session_authenticated_id
def upload_avatar(request, id):
    if request.method == "POST":
        # Access the raw binary data
        avatar = request.body  # This will contain the binary data of the file

        if not avatar:
            return JsonResponse(
                {"ok": False, "error": "No file uploaded", "statusCode": 400},
                status=400,
            )

        try:
            user = User.objects.get(id=id)
            player = user.player
            player.avatar.save(f"{id}_avatar.png", ContentFile(avatar), save=True)

            return JsonResponse(
                {
                    "ok": True,
                    "message": "Avatar uploaded successfully!",
                    "data": {
                        "avatarUrl": player.avatar.url,
                    },
                    "statusCode": 200,
                },
                status=200,
            )
        except ObjectDoesNotExist:
            return JsonResponse(
                {"ok": False, "error": "Player not found", "statusCode": 404},
                status=404,
            )
        except Exception as e:
            return JsonResponse(
                {"ok": False, "error": str(e), "statusCode": 500}, status=500
            )

    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


def get_player_stats(request, id):
    try:
        if request.method == "GET":
            player = get_player_by_user_id(id)
            wins = Match.objects.filter(Q(winner1=player) | Q(winner2=player)).count()
            losses = Match.objects.filter(Q(winner1=player) | Q(winner2=player)).count()
            return JsonResponse(
                {
                    "ok": True,
                    "message": "Player results successfully retrieved!",
                    "data": {
                        "wins": wins,
                        "losses": losses,
                    },
                    "statusCode": 200,
                }
            )
    except ObjectDoesNotExist:
        return JsonResponse(
            {"ok": False, "error": "Player not found", "statusCode": 404},
            status=404,
        )
    except Exception as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 500}, status=500
        )
    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


##################################
# Tournaments
##################################


@csrf_exempt
def manage_tournaments(request):
    try:
        if request.method == "GET":
            return get_tournaments(request)
        if request.method == "POST":
            return create_tournament(request)
    except Exception as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 500}, status=500
        )

    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


# Get last 5 tournaments
def get_tournaments(request):
    tournaments = (
        Tournament.objects.all()
        .order_by("-id")[:5]
        .select_related("winner")  # Fetch the winner Player object with the Tournament
        .prefetch_related(
            "participants__player",  # Prefetch Player objects from TournamentParticipant
            "matches__player1",  # Prefetch Player objects for match's player1
            "matches__player2",  # Prefetch Player objects for match's player2
            "matches__player3",  # Prefetch Player objects for match's player3
            "matches__player4",  # Prefetch Player objects for match's player4
            "matches__winner1",  # Prefetch Player objects for match's winner1
            "matches__winner2",  # Prefetch Player objects for match's winner2
            "matches__loser1",  # Prefetch Player objects for match's loser1
            "matches__loser2",  # Prefetch Player objects for match's loser2
        )
    )

    tournaments_data = [form_tournament_json(tournament) for tournament in tournaments]
    return JsonResponse(
        {
            "ok": True,
            "message": "Tournaments successfully listed!",
            "data": {"tournaments": tournaments_data},
            "statusCode": 200,
        },
        status=200,
    )


def form_tournament_json(tournament):
    return {
        "id": tournament.id,
        "name": tournament.name,
        "winner": form_player_json(tournament.winner),
        # "status": tournament.status,
        "createdAt": tournament.created_at.isoformat(),
        "matches": [form_match_json(match) for match in tournament.matches.all()],
    }


def form_match_json(match):
    if not match:
        return None
    return {
        "id": match.id,
        "players": [
            form_player_json(player)
            for key in PLAYER_KEYS
            if (player := getattr(match, key, None))
        ],
        "score": match.score,
        "duration": int(match.duration.total_seconds()) if match.duration else None,
        "createdAt": match.created_at.isoformat(),
    }


def form_player_json(player):
    if not player:
        return None
    return {
        "id": getattr(player, "user").id,
        "username": getattr(player, "user").username,
        "displayName": getattr(player, "display_name", None),
        "avatarUrl": player.avatar.url if player.avatar else None,
        "status": check_status(player),
        "createdAt": player.created_at.isoformat(),  # Format datetime if needed
    }


@csrf_exempt
def get_tournament(request, id):
    try:
        if request.method == "GET":
            tournament = Tournament.objects.get(id=id)
            return JsonResponse(
                {
                    "ok": True,
                    "message": "Tournament successfully retrieved!",
                    "data": {"tournament": form_tournament_json(tournament)},
                    "statusCode": 200,
                },
                status=200,
            )
    except Tournament.DoesNotExist:
        return JsonResponse(
            {"ok": False, "error": "Tournament not found", "statusCode": 404},
            status=404,
        )
    except Exception as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 500}, status=500
        )
    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


@csrf_exempt
def get_current_sessions_tournament(request):
    try:
        if request.method == "GET":
            found_session_ids = [
                int(decrypt_session_value(value)["id"])
                for key, value in request.COOKIES.items()
                if key.startswith("session_")
            ]
            if len(found_session_ids) == 3:
                found_session_ids.append(1)
            if len(found_session_ids) != 4:
                return JsonResponse(
                    {
                        "ok": False,
                        "error": f"Expected 4 or 3 if tournament played with AI, got {len(found_session_ids)} sessions",
                        "statusCode": 400,
                    },
                    status=400,
                )
            players = Player.objects.filter(user__id__in=found_session_ids)
            # print("players")
            # print(players)
            tournaments = (
                Tournament.objects.annotate(
                    player_count=Count(
                        "participants", distinct=True
                    )  # Count all participants
                ).filter(
                    player_count=len(players),  # Ensure the number of players matches
                    participants__player__in=players,  # Ensure all the players are in
                )
                # .distinct()  # Avoid duplicates
            )
            # print("tournaments")
            # print(tournaments)

            if tournaments.exists():
                # Return the first matching tournament (or adjust logic for multiple)
                tournament = tournaments.first()
                return JsonResponse(
                    {
                        "ok": True,
                        "message": "Tournament successfully retrieved!",
                        "data": {"tournament": form_tournament_json(tournament)},
                        "statusCode": 200,
                    },
                    status=200,
                )
            else:
                return JsonResponse(
                    {
                        "ok": False,
                        "error": "No tournament found for the present sessions",
                        "statusCode": 404,
                    },
                    status=404,
                )
    except Exception as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 500}, status=500
        )
    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


def create_tournament(request):
    if not request.body:
        raise BadRequest("No data provided")
    data = json.loads(request.body)
    name = data.get("name")
    if not name:
        return JsonResponse(
            {"ok": False, "error": "Tournament must have a name", "statusCode": 400},
            status=400,
        )
    user_ids = data.get("userIds")
    if not user_ids or len(user_ids) != 4:
        return JsonResponse(
            {"ok": False, "error": "Tournament requires 4 players", "statusCode": 400},
            status=400,
        )
    if not isinstance(user_ids, list):
        return JsonResponse({"error": "Expected a JSON array."}, status=400)

    if not check_sessions(request, user_ids):
        return JsonResponse(
            {"ok": False, "error": "Sessions not verified", "statusCode": 400},
            status=400,
        )

    # Create a new tournament
    tournament = Tournament.objects.create(name=name)
    for index, user_id in enumerate(user_ids):
        if not user_id:
            return JsonResponse(
                {"ok": False, "error": "Player ID is required", "statusCode": 400},
                status=400,
            )
        # print("user_id", user_id)
        player = get_player_by_user_id(user_id)
        # print("player", player)
        TournamentParticipant.objects.create(
            tournament=tournament, player=player, order=index
        )

    for i in range(0, len(user_ids), 2):
        player1 = get_player_by_user_id(user_ids[i])
        player2 = get_player_by_user_id(user_ids[i + 1])
        Match.objects.create(tournament=tournament, player1=player1, player2=player2)

    return JsonResponse(
        {
            "ok": True,
            "message": "Tournament successfully created!",
            "data": {"id": tournament.id, "name": tournament.name},
            "statusCode": 201,
        },
        status=201,
    )


##################################
# Matches
##################################


@csrf_exempt
def manage_matches(request):
    try:
        if request.method == "GET":
            matches = get_matches()
            return JsonResponse(
                {
                    "ok": True,
                    "message": "Matches requested sucessfully!",
                    "data": {
                        "matches": matches,
                    },
                    "statusCode": 200,
                },
                status=200,
            )
        if request.method == "POST":
            return create_match(request)
    except BadRequest as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 400}, status=400
        )
    except Exception as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 500}, status=500
        )
    return JsonResponse({"ok": False, "error": "Invalid request method"}, status=405)


def get_matches():
    matches = Match.objects.all().order_by("-id")[:20]
    return [form_match_json(match) for match in matches]


@session_authenticated_logged_in
def get_player_matches(request, id):
    try:
        if request.method == "GET":
            player = get_player_by_user_id(id)
            matches = Match.objects.filter(
                Q(player1=player)
                | Q(player2=player)
                | Q(player3=player)
                | Q(player4=player)
            ).order_by("-id")
            return JsonResponse(
                {
                    "ok": True,
                    "message": "Player matches successfully retrieved!",
                    "data": {
                        "matches": [form_match_json(match) for match in matches],
                    },
                    "statusCode": 200,
                },
                status=200,
            )
    except ObjectDoesNotExist:
        return JsonResponse(
            {"ok": False, "error": "Player not found", "statusCode": 404},
            status=404,
        )
    except Exception as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 500}, status=500
        )
    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


# Checks if all ids have valid session
# If AI_ID is present, it will be added to the list of ids
# No session checked for AI_ID
# Still the AI_ID should be provided in ids argument
def check_sessions(request, ids):
    # Filter out None values
    ids = [str(id) for id in ids if id is not None]

    # print("ids")
    # for id in ids:
    #     print(id)
    if len(ids) != 2 and len(ids) != 4:
        raise Exception(f"Expected at least 2 or 4 ids and got {len(ids)}")
    found_sessions_keys = ["session_" + id for id in ids if id != AI_ID]
    # Get corresponding values from cookies
    sessions_values_ids = [
        str(decrypt_session_value(value)["id"])
        for key, value in request.COOKIES.items()
        if key in found_sessions_keys
    ]
    if AI_ID in ids:
        sessions_values_ids.append(AI_ID)

    # print("found_sessions_keys")
    # for found_sessions_key in found_sessions_keys:
    #     print(found_sessions_key)
    # print("sessions_values_ids")
    # for sessions_values_id in sessions_values_ids:
    #     print(sessions_values_id)

    # print("key, value")
    # for key, value in request.COOKIES.items():
    #     print(key, value)

    if all(id in sessions_values_ids for id in ids):
        return True
    return False


def check_score_format(score):
    pattern = r"^\d+:\d+$"
    if re.match(pattern, score):
        return True
    return False


def create_match(request):
    WINNER_LOSER_KEYS = ["winner1", "winner2", "loser1", "loser2"]
    if not request.body:
        raise BadRequest("No data provided")
    data = json.loads(request.body)
    user_ids = data.get("userIds")

    if not check_sessions(request, user_ids):
        return JsonResponse(
            {"ok": False, "error": "Sessions not verified", "statusCode": 400},
            status=400,
        )
    user_ids_count = len(user_ids)
    if user_ids_count != 4 and user_ids_count != 2:
        raise BadRequest("Match can be created only for 2 or 4 players")

    # if (response := check_required_fields(data, ["score"])) is not None:
    #     return response

    score = data.get("score")

    step = 2 if user_ids_count == 2 else 1
    offset = 0
    if score:
        if not check_score_format(score):
            raise BadRequest("Invalid score format. Example format: '11:2'")
        score_arr = score.split(":")
        is_winners_first = True if score_arr[0] > score_arr[1] else False
        offset = 0 if is_winners_first else 2
        MODULO_DIV = 4

    match = Match()
    duration_seconds = data.get("duration")
    if duration_seconds:
        match.duration = timedelta(seconds=duration_seconds)
    tournament_id = data.get("tournamentId")
    tournament = Tournament.objects.get(id=tournament_id)
    if tournament_id:
        if user_ids_count != 2:
            raise BadRequest("Match must have 2 players if it is part of a tournament")
        # Check if the tournament does not have 3 matches already
        tournament_matches = Match.objects.all().filter(tournament=tournament)
        if tournament_matches.count() == 3:
            raise BadRequest("Tournament already has 3 matches")
        # Check if players are in different semifinals matches
        for tournament_match in tournament_matches:
            # print("user_ids")
            # print(user_ids)
            # print("tournament_match.player1.user.id")
            # print(tournament_match.player1.user.id)
            # print("tournament_match.player2.user.id")
            # print(tournament_match.player2.user.id)
            if not (
                str(tournament_match.player1.user.id) in user_ids
                or str(tournament_match.player2.user.id) in user_ids
            ):
                raise BadRequest("Players from semifinals must be in finals")
        match.tournament = Tournament.objects.get(id=tournament_id)

    for index, user_id in enumerate(user_ids):
        # Set player1, player2, player3, player4 (leaving player 3 and player3 empty if 2 players)
        match.__setattr__(PLAYER_KEYS[index], get_player_by_user_id(user_id))
        # Set winner1, winner2, loser1, loser2 (leaving winner2 and loser2 empty if 2 players)
        if score:
            match.__setattr__(
                WINNER_LOSER_KEYS[(index * step + offset) % MODULO_DIV],
                get_player_by_user_id(user_id),
            )

    if tournament_id and score:
        tournament.winner = match.winner1
        tournament.save()
    match.save()

    return JsonResponse(
        {
            "ok": True,
            "message": "Match successfully created!",
            "data": {
                "id": match.id,
            },
            "statusCode": 201,
        },
        status=201,
    )


@csrf_exempt
def manage_match_update(request, id):
    try:
        if request.method == "PATCH":
            return update_match(request, id)
    except Exception as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 500}, status=500
        )
    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


def update_match(request, id):
    match = Match.objects.get(id=id)

    if not request.body:
        raise BadRequest("No data provided")
    data = json.loads(request.body)

    user_ids = []
    for key in PLAYER_KEYS:
        player = getattr(match, key, None)  # Safely get the attribute
        if player and player.user:  # Check that the player and user exist
            user_ids.append(player.user.id)

    user_ids_count = len(user_ids)
    if user_ids_count != 2 and user_ids_count != 4:
        return JsonResponse(
            {
                "ok": False,
                "error": f"The match has {user_ids_count} player ids but it should have 2 or 4",
                "statusCode": 400,
            },
            status=400,
        )

    if not check_sessions(request, user_ids):
        return JsonResponse(
            {"ok": False, "error": "Sessions not verified", "statusCode": 400},
            status=400,
        )

    # if (response := check_required_fields(data, ["score"])) is not None:
    #     return response

    duration_seconds = data.get("duration")
    if duration_seconds:
        match.duration = timedelta(seconds=duration_seconds)

    score = data.get("score")
    step = 2 if user_ids_count == 2 else 1
    offset = 0
    if score:
        if not check_score_format(score):
            raise BadRequest("Invalid score format. Example format: '11:2'")
        score_arr = score.split(":")
        is_winners_first = True if score_arr[0] > score_arr[1] else False
        offset = 0 if is_winners_first else 2
        MODULO_DIV = 4
        match.score = score
        for index, user_id in enumerate(user_ids):
            # Set winner1, winner2, loser1, loser2 (leaving winner2 and loser2 empty if 2 players)
            match.__setattr__(
                WINNER_LOSER_KEYS[(index * step + offset) % MODULO_DIV],
                get_player_by_user_id(user_id),
            )
    tournament_id = match.tournament.id if match.tournament else None
    if tournament_id:
        # Check if it is the final of the tournament and set the winner accordingly
        tournament = Tournament.objects.get(id=tournament_id)
        tournament_matches = Match.objects.all().filter(tournament=tournament)
        if tournament_matches.count() == 3 and tournament_matches.last().id == match.id:
            tournament.winner = match.winner1
            tournament.save()
    match.save()
    return JsonResponse(
        {
            "ok": True,
            "message": "Match successfully updated!",
            "data": {
                "id": match.id,
            },
            "statusCode": 201,
        },
        status=201,
    )


def get_player_by_user_id(id):
    if id is None:
        return None
    try:
        user = User.objects.get(id=id)
        print(f"User found: {user}")
        player = Player.objects.get(user=user)
        print(f"User found: {player}")
        return player
    except ObjectDoesNotExist:
        return None


##################################
# Friendship
##################################


@csrf_exempt
def manage_friends(request, id):
    try:
        if request.method == "GET":
            return get_friends(request, id=id)
        if request.method == "POST":
            return request_friend(request, id=id)
        # if request.method == "DELETE":
    except Exception as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 500}, status=500
        )

    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


@session_authenticated_logged_in
def get_friends(request, id):
    user = User.objects.get(id=id)
    player = user.player
    friends = Friendship.objects.filter(Q(player1=player) | Q(player2=player))

    friends_list = []

    for friendship in friends:
        if friendship.player1 == player:
            friend = friendship.player2  # The other player is player2
        else:
            friend = friendship.player1  # The other player is player1
        friends_list.append(
            {
                "id": friend.user.id,
                "username": friend.user.username,
                "displayName": friend.display_name,
                "status": check_status(friend),
                "createdAt": friend.created_at.isoformat(),
            }
        )
    return JsonResponse(
        {
            "ok": True,
            "message": "Friends successfully listed!",
            "data": {"friends": friends_list},
            "statusCode": 200,
        },
        status=200,
    )


@session_authenticated_id
def request_friend(request, id):
    try:
        if not request.body:
            raise BadRequest("No data provided")
        data = json.loads(request.body)
        friend_id = int(data.get("friendUserId"))

        if not friend_id:
            return JsonResponse(
                {"ok": False, "error": "No friend id provided", "statusCode": 400},
                status=400,
            )
        user = User.objects.get(id=id)
        player = user.player
        friend_user = User.objects.get(id=friend_id)  # Find the friend by ID

        player1 = player
        player2 = friend_user.player
        status = "pending_first_second"
        if id > friend_id:
            player1, player2 = player2, player1
            status = "pending_second_first"

        # Check if the friendship already exists
        if Friendship.objects.filter(player1=player1, player2=player2).exists():
            return JsonResponse(
                {
                    "ok": False,
                    "error": "Friendship exists or request already sent",
                    "statusCode": 400,
                },
                status=400,
            )
        # Create new friendship
        new_friendship = Friendship.objects.create(
            player1=player1, player2=player2, status=status
        )
        return JsonResponse(
            {
                "ok": True,
                "message": "Friendship request sent successfully!",
                "data": {
                    "status": new_friendship.status,
                    "friend_display_name": friend_user.player.display_name,
                },
                "statusCode": 201,
            },
            status=201,
        )
    except ObjectDoesNotExist:
        return JsonResponse(
            {"ok": False, "error": "Player or Friendship not found", "statusCode": 404},
            status=404,
        )


@csrf_exempt
@session_authenticated_id
def manage_friend_request(request, id):
    try:
        if request.method == "POST":
            if not request.body:
                raise BadRequest("No data provided")
            data = json.loads(request.body)
            friend_id = int(data.get("friendUserId"))
            print("friend_id: ", friend_id)
            action = data.get("action")
            print("action: ", action)
            if not friend_id:
                return JsonResponse(
                    {"ok": False, "error": "No friend id provided", "statusCode": 400},
                    status=400,
                )
            player1 = User.objects.get(id=id).player
            player2 = User.objects.get(id=friend_id).player

            if id > friend_id:
                player1, player2 = player2, player1

            # Check if the friendship already exists
            friendship = Friendship.objects.filter(
                player1=player1, player2=player2
            ).get()
            if not friendship:
                return JsonResponse(
                    {
                        "ok": False,
                        "error": "Friendship does not exist",
                        "statusCode": 400,
                    },
                    status=400,
                )

            # Check if the user is allowed to approve the friendship request
            is_pending_second_first = (
                id < friend_id and friendship.status == "pending_second_first"
            )
            is_pending_first_second = (
                id > friend_id and friendship.status == "pending_first_second"
            )
            # print("id: ", id, "friend_id: ", friend_id, "friendship.status: ", friendship.status )
            # print (is_pending_second_first, is_pending_first_second)
            # print (action == "approve" and (is_pending_second_first or is_pending_first_second))
            message = ""
            if action == "approve" and (
                is_pending_second_first or is_pending_first_second
            ):
                message = "Friendship approved!"
                friendship.status = "friends"
                friendship.save()
            elif action == "reject":
                message = "Friendship rejected!"
                friendship.delete()
            else:
                return JsonResponse(
                    {
                        "ok": False,
                        "error": "This frindship action is not allowed",
                        "statusCode": 400,
                    },
                    status=400,
                )

            return JsonResponse(
                {
                    "ok": True,
                    "message": message,
                    "data": {
                        "status": action,
                    },
                    "statusCode": 200,
                },
                status=200,
            )
    except Friendship.DoesNotExist:
        return JsonResponse(
            {"ok": False, "error": "Friendship does not exist.", "statusCode": 404},
            status=404,
        )
    except User.DoesNotExist:
        return JsonResponse(
            {"ok": False, "error": "User not found", "statusCode": 404}, status=404
        )
    except Exception as e:
        return JsonResponse(
            {"ok": False, "error": str(e), "statusCode": 500}, status=500
        )

    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


##################################
# 42 Auth
##################################


def oauth_redirect(request):
    # Get OAuth parameters from environment variables
    client_id = os.environ.get("OAUTH_CLIENT_ID")
    redirect_uri = os.environ.get("OAUTH_REDIRECT")
    state = get_random_string(32)
    request.session["oauth_state"] = state
    base_url = os.environ.get("OAUTH_AUTHORIZE_URL")
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "state": state,
    }
    auth_url = f"{base_url}?{urlencode(params)}"
    return HttpResponseRedirect(auth_url)


def oauth_callback(request):

    if request.method == "GET":
        # state = request.GET.get('state')
        code = request.GET.get("code")
        if not code:
            return JsonResponse({"error": "No code provided"}, status=400)
        token_response = exchange_code_for_token(code)
        if "error" in token_response:
            return JsonResponse(token_response, status=400)
        user_data = fetch_42_user_data(token_response["access_token"])
        if "error" in user_data:
            return JsonResponse(user_data, status=400)
        try:
            # Create the user
            user = User.objects.create_user(username=user_data["login"])
            # Create the player with the associated user
            player = Player.objects.create(
                user=user, display_name=user_data["displayname"]
            )

            # Return success response
            file_path = os.path.join(os.path.dirname(__file__), "callback.html")
            file = open(file_path, "r")
            html_content = file.read()
            return HttpResponse(html_content)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


def fetch_42_user_data(access_token):
    api_url = os.environ.get("OAUTH_API_URL")
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to fetch user data: {str(e)}"}


def exchange_code_for_token(code):
    token_url = os.environ.get("OAUTH_TOKEN_URL")
    data = {
        "grant_type": "authorization_code",
        "client_id": os.environ.get("OAUTH_CLIENT_ID"),
        "client_secret": os.environ.get("OAUTH_CLIENT_SECRET"),
        "code": code,
        "redirect_uri": os.environ.get("OAUTH_REDIRECT"),
    }
    try:
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Token exchange failed: {str(e)}"}
