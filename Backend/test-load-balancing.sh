#!/bin/bash

echo "Testing Load Balancing for Advising Service"
echo "=========================================="

# Get the pod names
echo "Current Pods:"
kubectl get pods -l app=advising-service -o wide

echo -e "\nMaking 10 requests to test load balancing..."
echo "=========================================="

for i in {1..10}
do
    echo "Request $i:"
    response=$(curl -s http://localhost:8000/health)
    pod=$(kubectl get pods -l app=advising-service -o jsonpath="{.items[0].metadata.name}")
    echo "Response: $response"
    echo "Handled by pod: $pod"
    echo "----------------------------------------"
    sleep 1
done

echo -e "\nFinal Pod Status:"
kubectl get pods -l app=advising-service -o wide 