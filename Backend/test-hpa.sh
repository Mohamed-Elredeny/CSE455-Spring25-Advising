#!/bin/bash

echo "Starting HPA test..."

# Monitor HPA in the background
kubectl get hpa student-service-hpa --watch &
HPA_PID=$!

# Create a load generator pod
kubectl run load-generator --image=busybox -- /bin/sh -c "while true; do wget -q -O- http://student-service/api/students; done"

# Wait for 5 minutes
echo "Generating load for 5 minutes..."
sleep 300

# Clean up
kubectl delete pod load-generator
kill $HPA_PID

echo "HPA test complete!"
echo "Final HPA status:"
kubectl get hpa student-service-hpa 