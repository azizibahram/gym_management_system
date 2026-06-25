#!/bin/sh
python manage.py migrate --noinput
exec gunicorn gymsystem.wsgi:application --bind 0.0.0.0:8000 --workers 4 --threads 2
