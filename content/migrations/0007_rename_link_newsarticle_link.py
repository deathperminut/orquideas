# Generated by Django 5.0.7 on 2024-08-07 23:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0006_alter_newsarticle_image_alter_newsarticle_link'),
    ]

    operations = [
        migrations.RenameField(
            model_name='newsarticle',
            old_name='link',
            new_name='Link',
        ),
    ]
