from django.urls import path
from .views import me, register

urlpatterns = [
    path("me/", me),
    path("register/", register),
]
