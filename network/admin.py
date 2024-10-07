from django.contrib import admin
from .models import User, Post, Follower, Like


class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username")


class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "likes", "created")


class FollowerAdmin(admin.ModelAdmin):
    list_display = ("user", "follows_user", "active")


class LikeAdmin(admin.ModelAdmin):
    list_display = ("user", "post_id", "like")

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Follower, FollowerAdmin)
admin.site.register(Like, LikeAdmin)
