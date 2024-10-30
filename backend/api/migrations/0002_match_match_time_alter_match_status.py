# Generated by Django 5.1.1 on 2024-10-28 10:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='match_time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='match',
            name='status',
            field=models.CharField(choices=[('scheduled', 'Scheduled'), ('completed', 'Completed')], default='scheduled', max_length=20),
        ),
    ]