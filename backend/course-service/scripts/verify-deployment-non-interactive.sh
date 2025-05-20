#!/bin/bash
set -e

echo "Verifying Kubernetes deployments..."

echo -e "\n== Database (PostgreSQL) =="
kubectl get pods -l app=postgres
kubectl get pvc postgres-data-pvc
kubectl get svc postgres

echo -e "\n== Cache (Redis) =="
kubectl get pods -l app=redis
kubectl get pvc redis-data-pvc
kubectl get svc redis

echo -e "\n== Application (Course Service) =="
kubectl get pods -l app=course-service
kubectl get svc course-service
kubectl get deployment course-service
kubectl get hpa course-service-hpa

echo -e "\n== Database Migration Job =="
kubectl get jobs

echo -e "\n== Testing API Connection =="
echo "Creating a test pod to access the API..."
kubectl run curl-test --image=curlimages/curl --restart=Never -- sleep 60 &
sleep 10

echo "Testing connection to course-service..."
kubectl exec curl-test -- curl -s http://course-service/
echo -e "\nTest complete!"

# Clean up
kubectl delete pod curl-test
