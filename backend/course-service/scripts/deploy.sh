#!/bin/bash
set -e

# Configuration
DOCKERHUB_USERNAME="adhamafis"  # Change this to your DockerHub username
IMAGE_NAME="course-service"
IMAGE_TAG="latest"

# Pull Docker image from DockerHub
echo "Pulling Docker image from DockerHub..."
docker pull $DOCKERHUB_USERNAME/$IMAGE_NAME:$IMAGE_TAG

# Replace placeholder in Kubernetes files
echo "Replacing image placeholders in Kubernetes files..."
for file in k8s/*.yaml; do
    sed -i '' "s/\${DOCKERHUB_USERNAME}/$DOCKERHUB_USERNAME/g" $file
done

# Apply Kubernetes configurations
echo "Applying Kubernetes configurations..."

echo "Creating database and cache services..."
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml

echo "Waiting for database to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s

echo "Waiting for Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=redis --timeout=60s

echo "Creating ConfigMap..."
kubectl apply -f k8s/configmap.yaml

echo "Running database initialization..."
kubectl apply -f k8s/init-db.yaml
kubectl wait --for=condition=complete job/init-db --timeout=120s

echo "Deploying the application..."
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/course-service

echo "Deployment complete!"
echo "To check your pods: kubectl get pods -l app=course-service"
echo "To access the service: kubectl port-forward svc/course-service 8000:80" 