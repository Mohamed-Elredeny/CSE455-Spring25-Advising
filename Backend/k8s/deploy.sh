#!/bin/bash

echo "Deploying advising service..."

# Apply the deployment
kubectl apply -f student-service/deployment.yaml

# Wait for deployment to roll out
echo "Waiting for deployment to roll out..."
kubectl rollout status deployment/advising-service

# Get pod information
echo "Getting pod information..."
kubectl get pods -l app=advising-service -o wide

# Get deployment information
echo "Getting deployment information..."
kubectl get deployment advising-service

echo "Deployment complete!" 