#!/bin/bash

# Replace this with your actual DockerHub username
DOCKERHUB_USERNAME="amrnawar"

# Build the image
echo "Building Docker image..."
docker build -t ${DOCKERHUB_USERNAME}/advising-frontend:latest .

# Push to DockerHub
echo "Pushing to DockerHub..."
docker push ${DOCKERHUB_USERNAME}/advising-frontend:latest

# Verify the image
echo "Verifying image..."
docker pull ${DOCKERHUB_USERNAME}/advising-frontend:latest

echo "Done!"
echo "Your DockerHub image is available at: https://hub.docker.com/r/${DOCKERHUB_USERNAME}/advising-frontend" 