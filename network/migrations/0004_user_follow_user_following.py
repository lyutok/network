# Generated by Django 5.0.6 on 2024-07-08 14:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("network", "0003_post_delete_comment"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="follow",
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name="user",
            name="following",
            field=models.IntegerField(default=0),
        ),
    ]