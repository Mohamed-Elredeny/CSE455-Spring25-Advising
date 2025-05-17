#!/bin/bash

echo "Testing load balancing for grade-simulator-service..."
echo "-------------------------------------------------"

# Create a test pod that will stay alive for our test
kubectl run test-pod --image=curlimages/curl -i --tty --rm --restart=Never -- sh -c '
for i in {1..10}; do
  echo "Request $i:"
  curl -s grade-simulator-service/simulator/health | grep "healthy"
  echo ""
  sleep 1
done
'

# Show pod logs to see which handled the requests
echo "Checking logs from pods to verify load balancing:"
echo "-------------------------------------------------"

POD1=$(kubectl get pods -l app=grade-simulator-service -o jsonpath='{.items[0].metadata.name}')
POD2=$(kubectl get pods -l app=grade-simulator-service -o jsonpath='{.items[1].metadata.name}')

echo "Pod 1 ($POD1) logs:"
kubectl logs $POD1 | tail -5

echo "Pod 2 ($POD2) logs:"
kubectl logs $POD2 | tail -5 