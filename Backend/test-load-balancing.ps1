Write-Host "Testing Load Balancing for Advising Service"
Write-Host "=========================================="

# Get the pod names
Write-Host "`nCurrent Pods:"
kubectl get pods -l app=advising-service -o wide

Write-Host "`nMaking 10 requests to test load balancing..."
Write-Host "=========================================="

for ($i = 1; $i -le 10; $i++) {
    Write-Host "Request $i`:"
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
    $pod = kubectl get pods -l app=advising-service -o jsonpath="{.items[0].metadata.name}"
    Write-Host "Response: $($response | ConvertTo-Json)"
    Write-Host "Handled by pod: $pod"
    Write-Host "----------------------------------------"
    Start-Sleep -Seconds 1
}

Write-Host "`nFinal Pod Status:"
kubectl get pods -l app=advising-service -o wide 