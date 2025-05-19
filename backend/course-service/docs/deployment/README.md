# Deployment Guide

## Overview

The CSE455-Spring25-Advising service is deployed using Kubernetes. The deployment includes:

- FastAPI application
- PostgreSQL database
- Redis cache
- Database initialization job

## Prerequisites

- Kubernetes cluster
- kubectl configured
- Helm (optional)
- Docker registry access

## Kubernetes Configuration

The Kubernetes configuration files are located in the `k8s/` directory:

```
k8s/
├── app.yaml           # FastAPI application deployment
├── postgres.yaml      # PostgreSQL deployment
├── redis.yaml         # Redis deployment
├── init-db.yaml       # Database initialization job
└── configmap.yaml     # Configuration management
```

## Deployment Steps

### 1. Create Namespace

```bash
kubectl create namespace cse455-advising
```

### 2. Apply Configurations

```bash
# Apply configurations in order
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/init-db.yaml
kubectl apply -f k8s/app.yaml
```

### 3. Verify Deployment

```bash
# Check pods
kubectl get pods -n cse455-advising

# Check services
kubectl get svc -n cse455-advising

# Check deployments
kubectl get deployments -n cse455-advising
```

## Configuration Files

### 1. Application Deployment (app.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: advising-app
  namespace: cse455-advising
spec:
  replicas: 3
  selector:
    matchLabels:
      app: advising-app
  template:
    metadata:
      labels:
        app: advising-app
    spec:
      containers:
      - name: advising-app
        image: your-registry/advising-app:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: advising-config
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: advising-app
  namespace: cse455-advising
spec:
  selector:
    app: advising-app
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

### 2. PostgreSQL Deployment (postgres.yaml)

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: cse455-advising
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:13
        ports:
        - containerPort: 5432
        envFrom:
        - configMapRef:
            name: advising-config
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: cse455-advising
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

### 3. Redis Deployment (redis.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: cse455-advising
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:6
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: cse455-advising
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

### 4. Database Initialization (init-db.yaml)

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: init-db
  namespace: cse455-advising
spec:
  template:
    spec:
      containers:
      - name: init-db
        image: your-registry/advising-app:latest
        command: ["alembic", "upgrade", "head"]
        envFrom:
        - configMapRef:
            name: advising-config
      restartPolicy: OnFailure
```

### 5. Configuration (configmap.yaml)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: advising-config
  namespace: cse455-advising
data:
  DATABASE_URL: "postgresql://user:password@postgres:5432/advising"
  REDIS_URL: "redis://redis:6379"
  ENVIRONMENT: "production"
```

## Scaling

### Horizontal Pod Autoscaling

```bash
# Create HPA
kubectl autoscale deployment advising-app -n cse455-advising --cpu-percent=50 --min=2 --max=10
```

## Monitoring

### 1. Resource Usage

```bash
# Check resource usage
kubectl top pods -n cse455-advising
```

### 2. Logs

```bash
# View logs
kubectl logs -f deployment/advising-app -n cse455-advising
```

## Backup and Recovery

### 1. Database Backup

```bash
# Create backup
kubectl exec -n cse455-advising postgres-0 -- pg_dump -U user advising > backup.sql
```

### 2. Restore Database

```bash
# Restore from backup
kubectl exec -i -n cse455-advising postgres-0 -- psql -U user advising < backup.sql
```

## Troubleshooting

### 1. Common Issues

1. **Pod Not Starting**
   - Check resource limits
   - Verify environment variables
   - Check container logs

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check connection string
   - Verify network policies

3. **Application Errors**
   - Check application logs
   - Verify configuration
   - Check resource usage

### 2. Debugging Commands

```bash
# Describe pod
kubectl describe pod <pod-name> -n cse455-advising

# Get events
kubectl get events -n cse455-advising

# Check service endpoints
kubectl get endpoints -n cse455-advising
```

## Security Considerations

1. **Network Policies**
   - Restrict pod-to-pod communication
   - Limit external access
   - Use internal services

2. **Secrets Management**
   - Use Kubernetes secrets
   - Avoid hardcoded credentials
   - Rotate secrets regularly

3. **Resource Limits**
   - Set appropriate limits
   - Monitor resource usage
   - Implement autoscaling

## Updates and Rollbacks

### 1. Update Deployment

```bash
# Update image
kubectl set image deployment/advising-app -n cse455-advising advising-app=your-registry/advising-app:new-version
```

### 2. Rollback Deployment

```bash
# Rollback to previous version
kubectl rollout undo deployment/advising-app -n cse455-advising
```

## Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [PostgreSQL on Kubernetes](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/)
- [Redis on Kubernetes](https://kubernetes.io/docs/tutorials/stateful-application/run-replicated-stateful-application/) 