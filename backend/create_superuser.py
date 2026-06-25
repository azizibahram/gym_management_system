import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymsystem.settings')
django.setup()

from django.contrib.auth.models import User

username = os.environ.get('ADMIN_USERNAME', 'admin')
email = os.environ.get('ADMIN_EMAIL', 'admin@gym.com')
password = os.environ.get('ADMIN_PASSWORD', 'admin')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f'Superuser created: {username}')
else:
    print(f'Superuser already exists: {username}')
