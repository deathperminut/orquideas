# Generated by Django 5.0.7 on 2024-08-11 17:18

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("modules", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="usermodule",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="usersurveymodule",
            name="survey",
            field=models.ManyToManyField(
                blank=True, related_name="survey_modules", to="modules.activity"
            ),
        ),
        migrations.AddField(
            model_name="usermodule",
            name="survey_module_editable",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="user_survey_modules",
                to="modules.usersurveymodule",
            ),
        ),
        migrations.AddField(
            model_name="activity",
            name="video",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="modules.video",
            ),
        ),
    ]
