# Constants used in models.py

TOURNAMENT_STATUS_CHOICES = [
    ('scheduled', 'Scheduled'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed')
]

ROUND_CHOICES = [
    ('SF', 'Semifinals'),
    ('F', 'Final')
]

MATCH_STATUS_CHOICES = [
    ('scheduled', 'Scheduled'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed')
]

ACTIVITY_STATUS_CHOICES = [
    ('online', 'Online'),
    ('offline', 'Offline')
]

FRIENDSHIP_STATUS_CHOICES = [
    ('pending_first_second', 'Pending (first -> second)'),
    ('pending_second_first', 'Pending (second -> first)'),
    ('friends', 'Friends')
]
# Other constants to specify