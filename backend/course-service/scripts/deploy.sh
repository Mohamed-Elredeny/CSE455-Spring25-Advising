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
for file in ../k8s/*.yaml; do
    sed -i "s/\${DOCKERHUB_USERNAME}/$DOCKERHUB_USERNAME/g" $file
done

# Apply Kubernetes configurations
echo "Applying Kubernetes configurations..."

echo "Creating database and cache services..."
kubectl apply -f ../k8s/postgres.yaml --validate=false
kubectl apply -f ../k8s/redis.yaml --validate=false

echo "Waiting for database to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s || echo "Failed to wait for postgres, continuing anyway"

echo "Waiting for Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=redis --timeout=60s || echo "Failed to wait for redis, continuing anyway"

echo "Creating ConfigMap..."
kubectl apply -f ../k8s/configmap.yaml --validate=false

echo "Running database initialization..."
kubectl apply -f ../k8s/init-db.yaml --validate=false
kubectl wait --for=condition=complete job/init-db --timeout=120s || echo "Failed to wait for init-db job, continuing anyway"

echo "Deploying the application..."
kubectl apply -f ../k8s/deployment.yaml --validate=false
kubectl apply -f ../k8s/service.yaml --validate=false
kubectl apply -f ../k8s/hpa.yaml --validate=false

echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/course-service || echo "Failed to wait for deployment, continuing anyway"

echo "Deployment complete!"
echo "To check your pods: kubectl get pods -l app=course-service"
echo "To access the service: kubectl port-forward svc/course-service 8000:80" 