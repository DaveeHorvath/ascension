from django.urls import path
from . import views

urlpatterns = [
    path("players/", views.manage_players, name="manage_players"),
    path("players/<int:id>/", views.manage_player, name="manage_player"),
    path('players/<int:id>/avatar/', views.upload_avatar, name='upload_avatar'),
    path("players/<int:id>/friends/", views.manage_friends, name="manage_friends"),
    path("players/<int:id>/friends/manage/", views.manage_friend_request, name="manage_friend"),
    # path("players/<int:id>/friends/reject/", views.reject_friend, name="reject_friend"),
    path('auth/login/', views.custom_login, name='login'),
    path('auth/logout/<int:id>/', views.custom_logout, name='logout'),
    path('oauth/redirect/', views.oauth_redirect, name='oauth_redirect'),
    path('oauth/callback/', views.oauth_callback, name='oauth_callback')
]
