#!/bin/bash

echo "Testing Kubernetes Deployment"
echo "==========================="

# Check if kubectl is configured
echo -e "\n1. Checking kubectl configuration..."
kubectl cluster-info
if [ $? -ne 0 ]; then
    echo "Error: kubectl is not properly configured"
    exit 1
fi

# Check all pods are running
echo -e "\n2. Checking pod status..."
kubectl get pods --all-namespaces
echo -e "\nChecking for any pods in non-Running state..."
kubectl get pods --all-namespaces | grep -v "Running" | grep -v "NAME"

# Check services
echo -e "\n3. Checking services..."
kubectl get services
echo -e "\nChecking service endpoints..."
kubectl get endpoints

# Check deployments
echo -e "\n4. Checking deployments..."
kubectl get deployments
echo -e "\nChecking deployment status..."
kubectl rollout status deployment/frontend
kubectl rollout status deployment/advising-service

# Test frontend accessibility
echo -e "\n5. Testing frontend accessibility..."
FRONTEND_IP=$(kubectl get service frontend-service -o jsonpath='{.spec.clusterIP}')
echo "Frontend service IP: $FRONTEND_IP"
curl -I http://$FRONTEND_IP

# Test backend API endpoints
echo -e "\n6. Testing backend API endpoints..."
STUDENT_SERVICE_IP=$(kubectl get service student-service -o jsonpath='{.spec.clusterIP}')
echo "Student service IP: $STUDENT_SERVICE_IP"

# Test student service
echo -e "\nTesting student service..."
curl -X POST http://$STUDENT_SERVICE_IP/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test@example.com",
    "major": "Computer Science",
    "gpa": 3.8
  }'

# Get the created student
echo -e "\nGetting created student..."
curl http://$STUDENT_SERVICE_IP/api/students

# Test advisor service
ADVISOR_SERVICE_IP=$(kubectl get service advisor-service -o jsonpath='{.spec.clusterIP}')
echo -e "\nTesting advisor service..."
curl -X POST http://$ADVISOR_SERVICE_IP/api/advisors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Advisor",
    "email": "advisor@example.com",
    "department": "Computer Science"
  }'

# Check ingress
echo -e "\n7. Checking ingress configuration..."
kubectl get ingress
echo -e "\nIngress details:"
kubectl describe ingress advising-system-ingress

# Check logs for any errors
echo -e "\n8. Checking pod logs for errors..."
echo "Frontend logs:"
kubectl logs -l app=frontend --tail=50
echo -e "\nBackend logs:"
kubectl logs -l app=advising-service --tail=50

# Check resource usage
echo -e "\n9. Checking resource usage..."
kubectl top pods
kubectl top nodes

echo -e "\nKubernetes deployment test complete!" 