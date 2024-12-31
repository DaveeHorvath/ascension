#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e
source /usr/local/bin/setup_env.sh

# Wait for the PostgreSQL server to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z transc_db 5432; do
  sleep 1
done

echo "PostgreSQL started."

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create the superuser (if it doesn't already exist)
python manage.py createsuperuser --no-input || true

python manage.py collectstatic --no-input

# Run the main container process (the Django development server)
exec "$@"
