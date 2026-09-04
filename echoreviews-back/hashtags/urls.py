from django.urls import path
from .views import (
    HashtagListView,
    CreateHashtagView,
    UpdateHashtagView,
    DeleteHashtagView,
    CreateHashtagSuggestionView,
    ApproveHashtagSuggestionView,

)

urlpatterns = [
    path("", HashtagListView.as_view(), name="hashtags-list"),
    path("create/", CreateHashtagView.as_view(), name="create-hashtag"),
    path("<int:pk>/update/", UpdateHashtagView.as_view(), name="update-hashtag"),
    path("<int:pk>/delete/", DeleteHashtagView.as_view(), name="delete-hashtag"),
    path("suggestions/create/", CreateHashtagSuggestionView.as_view(), name="create-hashtag-suggestion"),
    path("suggestions/<int:pk>/approve/", ApproveHashtagSuggestionView.as_view(), name="approve-hashtag-suggestion"),
]