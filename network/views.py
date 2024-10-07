from django.contrib.auth import authenticate, login, logout
import json
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, HttpRequest
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django import forms
from django.core.validators import MaxLengthValidator
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Follower, Like
from django.http import JsonResponse

from django.core.paginator import Paginator


def index(request, username=None):
    context = {'username': request.user.username}

    if request.method == "POST":
        post_text = request.POST.get('newPostTextArea')
        user = request.user

        post = Post(post=post_text, user=user)
        post.save()

        print("posted")
        # prevent from resubmition of Post
        return HttpResponseRedirect(reverse("index"))

    # paginator
    # objects = Post.objects.all().order_by("-created").values('id', 'user__id', 'user__username', 'post', 'likes', 'created')
    # p = Paginator(objects, 2)
    # print(f"Paginator: pages: {p.num_pages}, records {p.count}")
    # page2 = p.page(2)
    # print(page2)
    # print(page2.object_list)

    return render(request, "network/index.html")


def allposts(request):

    filter_username = request.GET.get('username')
    filter_id_param = request.GET.get('id')
    print(f"Update post with id = {filter_id_param}.")

    # limit = int(request.GET.get('limit', 10))
    # offset = int(request.GET.get('offset', 0))

    if request.method == "PUT":
        print("PUT")
        data = json.loads(request.body)
        print(data)

        post = Post.objects.get(id=filter_id_param)

        # update post text or likes
        if data.get('post') is None:
            post.likes = data.get('likes')
        else:
            post.post = data.get('post')

        print(post)
        post.save()

        return JsonResponse({'message': 'Post updated successfully.'},status=200)

    else:
        # GET
        if filter_username:
            posts = Post.objects.filter(user__username=filter_username).order_by("-created").values('id', 'user__id', 'user__username', 'post', 'likes', 'created')
        elif filter_id_param:
            posts = Post.objects.filter(id=filter_id_param).values('id', 'user__id', 'user__username', 'post', 'likes', 'created')
        # elif limit is not None and offset is not None:
        #     posts = Post.objects.all().order_by("-created")[offset:offset+limit].values('id', 'user__id', 'user__username', 'post', 'likes', 'created')
        else:
            posts = Post.objects.all().order_by("-created").values('id', 'user__id', 'user__username', 'post', 'likes', 'created')

        return JsonResponse(list(posts), safe=False)



@csrf_exempt
def followers(request):
    print("POST data")
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)

        try:
            user = User.objects.get(username=data.get('user'))
            print(user)
            follows_user = User.objects.get(username=data.get('follows_user'))
            follower = Follower(user=user, follows_user=follows_user)
            follower.save()

            return JsonResponse({'message': 'Follower added successfully.'},status=201)
        except User.DoesNotExist:
            return HttpResponse('A user with the given username does not exist.', status=400)

    elif request.method == "PUT":
        print("PUT")
        data = json.loads(request.body)
        # print(data)

        try:
            user = User.objects.get(username=data.get('user'))
            # print(user.id)
        except User.DoesNotExist:
            return HttpResponse(f'A user ${user.id} with the given username does not exist.', status=400)

        try:
            follows_user = User.objects.get(username=data.get('follows_user'))
            print(follows_user.id)
        except User.DoesNotExist:
            return HttpResponse('A follows_user with the given username does not exist.', status=400)
        else:
            follower = Follower.objects.get(user=user.id, follows_user=follows_user.id)
            print(follower)
            follower.active = data.get('active', False)
            print(follower)
            follower.save()

            return JsonResponse({'message': 'Follower updated successfully.'},status=200)

    else:
        print("GET data")
        user = request.GET.get('current_user')
        follows_user = request.GET.get('user')
        print(user, follows_user)


        if user is not None and follows_user is not None:
            print("User and follows_user are not none - filter response")
            user = User.objects.get(username=user)
            follows_user = User.objects.get(username=follows_user)
            print(f"User id: {user.id}, Follows_user id: {follows_user.id}")

            followers = Follower.objects.filter(user=user.id, follows_user=follows_user.id).values('user__username', 'follows_user__username', 'active')
            print(f"Followers Queryset with parameters: {followers}")

        else:
            # no filter parameters
            followers = Follower.objects.all().values('user__username', 'follows_user__username', 'active')
            print(f"Followers Queryset All (no filter): {followers}")

        return JsonResponse(list(followers), safe=False)


def allusers(request):
    filter_username = request.GET.get('user')
    if (filter_username):
        users = User.objects.filter(username=filter_username).values('id', 'username')
    else:
        users = User.objects.all().values('id', 'username')
    return JsonResponse(list(users), safe=False)


@csrf_exempt
def likes(request):
    print("POST likes")
    if request.method == "POST":
        data = json.loads(request.body)
        print(data)

        try:
            user = User.objects.get(username=data.get('user'))
            # print(user)
            post_id = data.get('post_id')
            like = Like(user=user, post_id=post_id)
            like.save()

            return JsonResponse({'message': 'DB: Like record added successfully.'},status=201)
        except User.DoesNotExist:
            return HttpResponse('A user with the given username does not exist.', status=400)

    elif request.method == "PUT":
        print("PUT likes")
        data = json.loads(request.body)
        print(data)

        user = User.objects.get(username=request.GET.get('user'))
        post_id = request.GET.get('post_id')
        like_status = data['like']

        like = Like.objects.get(user=user, post_id=post_id)
        like.like= like_status
        like.save()

        return JsonResponse({'message': 'DB: Like record updated successfully.'},status=200)

    else:
        print("GET likes")

        user = User.objects.get(username=request.GET.get('user'))
        print(user)
        post_id = request.GET.get('post_id')
        print(post_id)

        if user is not None and post_id is not None:
            likes_records = Like.objects.filter(user=user, post_id=post_id).values('user__username', 'post_id', 'like')
        else:
            likes_records = Like.objects.all().values('user__username', 'post_id', 'like')

        return JsonResponse(list(likes_records), safe=False)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
