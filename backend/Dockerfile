# Use an official Python runtime as a parent image
FROM python:3.12.6-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install PostgreSQL client libraries
RUN apt-get update && apt-get install -y \
	gcc \
	libpq-dev \
	netcat-openbsd \
	xxd \
	jq \
	curl
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /code

# Copy the requirements file into the container
COPY requirements.txt /code/

# Install any required packages specified in requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project into the container
COPY . /code/

#Copy the environment setup script into the container
COPY ./tools/setup_env.sh /usr/local/bin/setup_env.sh
RUN chmod +x /usr/local/bin/setup_env.sh

# Copy the entrypoint script into the container
COPY ./tools/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Run the entrypoint script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Run the Django development server by default
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Run Gunicorn (instead of Django's runserver) in production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application", "--reload"]
