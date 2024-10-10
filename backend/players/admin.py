from django.contrib import admin
from .models import Player, Tournament, TournamentParticipant, Match, Friend

admin.site.register(Player)
admin.site.register(Tournament)
admin.site.register(TournamentParticipant)
admin.site.register(Match)
admin.site.register(Friend)