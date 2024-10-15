from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from .models import Player
import json


@csrf_exempt
def create_player(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        # Extract required fields from the request body
        username = data.get('username')
        password = data.get('password')
        display_name = data.get('displayName')
        
        if not username:
            return JsonResponse({'error': 'User name is required'}, status=400)
        if not password:
            return JsonResponse({'error': 'Password is required'}, status=400)
        if not display_name:
            return JsonResponse({'error': 'Display name is required'}, status=400)

        try:
            # Create the user
            user = User.objects.create_user(username=username, password=password)
            # Create the player with the associated user
            player = Player.objects.create(user=user, display_name=display_name)

            # Return success response
            return JsonResponse({
                'id': player.id,
                'username': user.username,
                'displayName': player.display_name,
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

def get_player_meta_info(request):
    if request.method == 'GET':
        players = Player.objects.all()
        
        # Convert the QuerySet to a list of dictionaries for serialization
        players_list = [{
            'display_name': player.display_name,
            'createdAt': player.created_at,
            'updatedAt': player.updated_at,
        } for player in players]

        return JsonResponse(players_list, safe=False, status=200)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)

# def upload_avatar(request, player_id):
#     if request.method == 'POST':
#         avatar = request.FILES.get('avatar')

#         if not avatar:
#             return JsonResponse({'error': 'No file uploaded'}, status=400)

#         try:
#             player = Player.objects.get(pk=player_id)
#         except ObjectDoesNotExist:
#             return JsonResponse({'error': 'Player not found'}, status=404)

#         player.avatar = avatar
#         player.save()

#         return JsonResponse({
#             'message': 'Avatar uploaded successfully!',
#             'avatar_url': player.avatar.url
#         }, status=200)

#     return JsonResponse({'error': 'Invalid request method'}, status=405)