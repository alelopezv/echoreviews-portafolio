from django.urls import path
from .views import CreateMediaSuggestionView, MediaDetailView, MediaListView, ApproveMediaSuggestionView

urlpatterns = [
    path("", MediaListView.as_view(), name="media-list"),
    path("<int:pk>/", MediaDetailView.as_view(), name="media-detail"),
    path("suggestions/<int:pk>/approve/", ApproveMediaSuggestionView.as_view(), name="approve-media-suggestion"),
    path("suggestions/create/", CreateMediaSuggestionView.as_view(), name="create-media-suggestion"),
]