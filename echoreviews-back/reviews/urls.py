from django.urls import path
from .estadisticas import EstadisticasView
from .views import (
    ApprovedReviewsView,
    CreateReviewView,
    MyReviewsView,
    ApproveReviewView,
    RejectReviewView,
    ReviewDetailView,
)

urlpatterns = [
    path("", ApprovedReviewsView.as_view(), name="approved-reviews"),
    # Va ANTES de "<int:pk>/" para que "stats" no se lea como un id.
    path("stats/", EstadisticasView.as_view(), name="review-stats"),
    path("create/", CreateReviewView.as_view(), name="create-review"),
    path("mine/", MyReviewsView.as_view(), name="my-reviews"),
    path("<int:pk>/approve/", ApproveReviewView.as_view(), name="approve-review"),
    path("<int:pk>/reject/", RejectReviewView.as_view(), name="reject-review"),
    path("<int:pk>/", ReviewDetailView.as_view(), name="review-detail"),
]
