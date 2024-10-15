from django.urls import path
from . import views

urlpatterns = [
    path('create-player/', views.create_player, name='create_player'),
    path('api/player/', views.get_player_meta_info, name='get_player_meta_info'),
]
