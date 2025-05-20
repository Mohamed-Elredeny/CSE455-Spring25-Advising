# Course Service Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the Course Service.

## Prerequisites

- Docker installed
- DockerHub account
- Kubernetes cluster (Minikube, Kind, or a cloud provider)
- kubectl installed and configured

## Files

- `configmap.yaml`: Environment variables for the Course Service
- `deployment.yaml`: Deployment configuration with 2 replicas and health probes
- `service.yaml`: ClusterIP service to expose the API within the cluster
- `hpa.yaml`: Horizontal Pod Autoscaler for automatic scaling
- `postgres.yaml`: PostgreSQL database deployment with persistent storage
- `redis.yaml`: Redis cache deployment with persistent storage
- `init-db.yaml`: Job for running database migrations

## Deployment Instructions

### 1. Update Docker Image Name

Before deploying, update the Docker image name in the `deployment.yaml` file to use your DockerHub username:

```yaml
image: your-dockerhub-username/course-service:latest
```

### 2. Build and Push Docker Image

```bash
# Login to DockerHub
docker login

# Build and tag the image
docker build -t your-dockerhub-username/course-service:latest ..

# Push to DockerHub
docker push your-dockerhub-username/course-service:latest
```

### 3. Apply Kubernetes Manifests

For proper deployment, follow this order:

```bash
# Create database and cache deployments first
kubectl apply -f postgres.yaml
kubectl apply -f redis.yaml

# Wait for the database and cache to be ready
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis --timeout=60s

# Create ConfigMap
kubectl apply -f configmap.yaml

# Initialize the database
kubectl apply -f init-db.yaml
kubectl wait --for=condition=complete job/init-db --timeout=120s

# Apply app deployment
kubectl apply -f deployment.yaml

# Create Service
kubectl apply -f service.yaml

# Apply HPA
kubectl apply -f hpa.yaml
```

Alternatively, use the provided deployment script:

```bash
# From the root directory
./scripts/deploy.sh
```

### 4. Verify Deployment

```bash
# Check if pods are running
kubectl get pods -l app=course-service

# Check if service is created
kubectl get svc course-service

# Check if HPA is configured
kubectl get hpa course-service-hpa
```

### 5. Testing Load Balancing

To verify load balancing across multiple pods, create a temporary pod with curl:

```bash
kubectl run curl-test --image=curlimages/curl -i --tty --rm -- sh
```

Then, from within the pod, send multiple requests:

```bash
for i in {1..10}; do
  curl http://course-service/
done
```

### 6. Accessing the Service

To access the service locally during development:

```bash
kubectl port-forward svc/course-service 8000:80
```

Then you can access the API at http://localhost:8000 