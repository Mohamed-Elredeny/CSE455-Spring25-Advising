#!/bin/bash

echo "Deploying frontend..."

# Apply the deployment and service
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Wait for deployment to roll out
echo "Waiting for deployment to roll out..."
kubectl rollout status deployment/frontend

# Get pod information
echo "Getting pod information..."
kubectl get pods -l app=frontend -o wide

# Get deployment information
echo "Getting deployment information..."
kubectl get deployment frontend

echo "Deployment complete!" 