"""
URL configuration for gymsystem project.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from gym.views import AthleteViewSet, ShelfViewSet, DashboardStatsView, ChangePasswordView
from pathlib import Path

router = DefaultRouter()
router.register(r'athletes', AthleteViewSet)
router.register(r'shelves', ShelfViewSet)

def index_view(request):
    """Serve the React app's index.html for all non-API routes"""
    index_path = Path(settings.BASE_DIR).parent / 'frontend' / 'dist' / 'index.html'
    with open(index_path, 'r', encoding='utf-8') as f:
        return HttpResponse(f.read(), content_type='text/html')

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/', include(router.urls)),
    path('api/dashboard/', DashboardStatsView.as_view(), name='dashboard'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all: serve index.html for all other routes (SPA support)
# WhiteNoise will automatically serve static files from STATIC_ROOT with correct MIME types
urlpatterns += [re_path(r'^.*$', index_view)]
