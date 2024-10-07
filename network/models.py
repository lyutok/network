from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="post_owner", blank=False)
    post = models.TextField(blank=False, max_length=500)
    likes = models.IntegerField(default=0)
    dislikes = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.id}: {self.id}, {self.user}: {self.post}, {self.likes}, {self.dislikes}, {self.created}"


class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following_u", blank=False)
    follows_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers_u", blank=False)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} follows {self.follows_user.username}, - active - {self.active}"


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_id", blank=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="post_id", blank=False)
    like = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} follows {self.post.id}, - like - {self.like}"
