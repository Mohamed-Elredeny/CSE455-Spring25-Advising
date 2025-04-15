#!/bin/bash

# Build the backend Docker image
cd ..
docker build -t ali142/grade-simulator-backend:latest .

# Push the image to Docker Hub
echo "Pushing image to Docker Hub..."
docker push ali142/grade-simulator-backend:latest

# Copy init.sql to k8s directory
echo "Copying init.sql..."
cp init.sql k8s/

# Create the k8s resources
cd k8s
kubectl apply -f mysql-deployment.yaml
kubectl apply -f backend-deployment.yaml

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
kubectl wait --for=condition=ready pod -l app=mysql --timeout=300s

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend --timeout=300s

echo "Deployment completed!"
echo "Backend service is available at: http://localhost:30000" 