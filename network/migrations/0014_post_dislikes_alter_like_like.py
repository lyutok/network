# Generated by Django 5.0.7 on 2024-07-28 15:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("network", "0013_like"),
    ]

    operations = [
        migrations.AddField(
            model_name="post",
            name="dislikes",
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name="like",
            name="like",
            field=models.BooleanField(default=True),
        ),
    ]
