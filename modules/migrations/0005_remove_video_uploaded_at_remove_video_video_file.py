# Generated by Django 5.0.7 on 2024-08-11 18:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("modules", "0004_alter_satisfactionquestion_level_of_satisfaction"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="video",
            name="uploaded_at",
        ),
        migrations.RemoveField(
            model_name="video",
            name="video_file",
        ),
    ]
