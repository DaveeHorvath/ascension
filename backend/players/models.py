from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) # Registration information
    display_name = models.CharField(max_length=30, unique=True) # Name that would be displayed to other players
    avatar = models.ImageField(upload_to='avatars/', default='fallback.png', blank=True) # Profile picture
    created_at = models.DateTimeField(default=timezone.now) # Date of account creation
    updated_at = models.DateTimeField(auto_now=True) # Date of last account update

    def __str__(self):
        return f"Player: {self.display_name}"

# Use signal to remove corresponding user on player deletion
@receiver(post_delete, sender=Player)
def delete_user_with_player(sender, instance, **kwargs):
    # Delete the associated user when the player is deleted
    if instance.user:
        instance.user.delete()


class Tournament(models.Model):
    name = models.CharField(max_length=100) # Name of the tournament
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed')
    ], default='scheduled') # Status of the tournament
    winner = models.ForeignKey(Player,
                               on_delete=models.SET('Unknown'),
                               null=True,
                               blank=True,
                               related_name='won_tournaments') # Winner of the tournament
    created_at = models.DateTimeField(auto_now_add=True) # Date of tournament creation

    def __str__(self):
        return f"Tournament: {self.name} - Status: {self.status}"

# Association table for players and tournaments
class TournamentParticipant(models.Model):
    tournament = models.ForeignKey(Tournament,
                                   on_delete=models.CASCADE,
                                   related_name='participants') # Tournament the player is participating in
    player = models.ForeignKey(Player, on_delete=models.CASCADE) # Player participating in the tournament
    order = models.IntegerField() # Order of the player in the tournament (For seeding purposes)

    class Meta:
        unique_together = ('tournament', 'player')

    def __str__(self):
        return f"{self.player.display_name} in {self.tournament.name}"


class Match(models.Model):
    tournament = models.ForeignKey(Tournament,
                                   on_delete=models.CASCADE,
                                   related_name='matches',
                                   null=True,
                                   blank=True) # Tournament the match is part of
    player1 = models.ForeignKey(Player,
                                on_delete=models.CASCADE,
                                related_name='player1_matches') # First player in the match
    player2 = models.ForeignKey(Player,
                                on_delete=models.CASCADE,
                                related_name='player2_matches') # Second player in the match
    round_of = models.IntegerField(null=True, blank=True) # Tournament round (round of 16 (1/8), 8 (1/4), 4 (1/2), 2 (final))
    player1_score = models.IntegerField(null=True, blank=True) # Score of player 1
    player2_score = models.IntegerField(null=True, blank=True) # Score of player 2
    winner = models.ForeignKey(Player,
                               on_delete=models.SET('Unknown'),
                               null=True,
                               blank=True,
                               related_name='won_matches') # Winner of the match
    loser = models.ForeignKey(Player,
                              on_delete=models.SET('Unknown'),
                              null=True,
                              blank=True,
                              related_name='lost_matches') # Loser of the match
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed')
    ], default='scheduled') # Status of the match
    created_at = models.DateTimeField(auto_now_add=True) # Date of match creation

    def __str__(self):
        return f"Match: {self.player1} vs {self.player2} - Status: {self.status}"


class Friend(models.Model):
    player = models.ForeignKey(Player,
                               on_delete=models.CASCADE,
                               related_name='friends') # Player who has the friend
    friend = models.ForeignKey(Player,
                               on_delete=models.CASCADE,
                               related_name='friend_of') # Player who is the friend
    created_at = models.DateTimeField(auto_now_add=True) # Date of friendship creation
    status = models.CharField(max_length=20, choices=[
        ('online', 'Online'),
        ('offline', 'Offline'),
    ], default='offline') # Status of the friend

    class Meta:
        unique_together = ('player', 'friend')

    def __str__(self):
        return f"{self.player.display_name} is friends with {self.friend.display_name}"