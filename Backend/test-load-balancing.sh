#!/bin/bash

# Number of requests to send
REQUESTS=20

echo "Starting load balancing test..."
echo "Sending $REQUESTS requests to student-service..."

# Send requests and capture pod names
for i in $(seq 1 $REQUESTS); do
    echo "Request $i:"
    curl -s http://student-service/api/students | jq -r '.pod_name'
    sleep 1
done

echo "Load balancing test complete!"
echo "Checking pod logs..."

# Get pod names
PODS=$(kubectl get pods -l app=student-service -o jsonpath='{.items[*].metadata.name}')

# Check logs for each pod
for pod in $PODS; do
    echo "Logs for pod $pod:"
    kubectl logs $pod | grep "GET /api/students" | wc -l
done 