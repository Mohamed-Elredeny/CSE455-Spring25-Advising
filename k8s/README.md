# Kubernetes Deployment Guide

This guide explains how to deploy the Course Advising API to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (local or cloud-based)
- `kubectl` configured to access your cluster
- Docker image of the application built and pushed to a container registry

## Directory Structure

```
k8s/
├── configmap.yaml      # Environment variables configuration
├── postgres.yaml      # PostgreSQL deployment and service
├── app.yaml           # FastAPI application deployment and service
└── init-db.yaml       # Database initialization job
```

## Deployment Steps

1. **Build and Push Docker Image**

   First, build and push your Docker image to a container registry:
   ```bash
   docker build -t your-registry/course-api:latest .
   docker push your-registry/course-api:latest
   ```

2. **Update Image Reference**

   Update the image reference in `app.yaml` and `init-db.yaml` to point to your container registry:
   ```yaml
   image: your-registry/course-api:latest
   ```

3. **Deploy to Kubernetes**

   Apply the manifests in the following order:
   ```bash
   # Create ConfigMap
   kubectl apply -f configmap.yaml

   # Deploy PostgreSQL
   kubectl apply -f postgres.yaml

   # Initialize the database
   kubectl apply -f init-db.yaml

   # Deploy the application
   kubectl apply -f app.yaml
   ```

4. **Verify Deployment**

   Check the status of your deployments:
   ```bash
   kubectl get pods
   kubectl get services
   ```

   The application will be accessible through the LoadBalancer service. Get the external IP:
   ```bash
   kubectl get service course-api
   ```

## Configuration

### Environment Variables

The application uses a ConfigMap for environment variables. You can modify these in `configmap.yaml`:

- `DATABASE_URL`: PostgreSQL connection string
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name

### Scaling

To scale the application, modify the `replicas` field in `app.yaml`:
```yaml
spec:
  replicas: 3  # Change this number to scale
```

### Storage

The PostgreSQL data is persisted using a PersistentVolumeClaim. The storage size can be adjusted in `postgres.yaml`:
```yaml
resources:
  requests:
    storage: 1Gi  # Adjust this value as needed
```

## Health Checks

The application includes readiness and liveness probes that check the `/health` endpoint:
- Readiness probe: Checks every 10 seconds after an initial 5-second delay
- Liveness probe: Checks every 20 seconds after an initial 15-second delay

## Troubleshooting

1. **Check Pod Logs**
   ```bash
   kubectl logs -f deployment/course-api
   ```

2. **Check Database Initialization**
   ```bash
   kubectl logs -f job/init-db
   ```

3. **Check Persistent Volume**
   ```bash
   kubectl get pvc
   kubectl get pv
   ```

4. **Check Service Status**
   ```bash
   kubectl describe service course-api
   ```

## Cleanup

To remove all resources:
```bash
kubectl delete -f .
```

## Notes

- The application service is exposed as a LoadBalancer. For local development, you might want to change it to NodePort.
- The database initialization job runs once to set up the database schema.
- Make sure your Kubernetes cluster has enough resources allocated for the application and database. 