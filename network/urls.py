from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API routs
    path('posts', views.allposts, name='posts'),
    path('users', views.allusers, name='users'),
    path('followers', views.followers, name='followers'),
    path('likes', views.likes, name='likes'),
]
