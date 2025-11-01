# Rider Service

Rider Service is a microservice for managing rider profiles in a Ride-Hailing Platform Assignment. This service handles rider registration, profile management, and CRUD operations.

## Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express**: Lightweight, fast web framework
- **MongoDB** - Database
- **Mongoose**: Schema-based MongoDB object modeling
- **Docker**: Containerization for consistent deployment
- **Kubernetes**: Orchestration for scalable deployment

## Getting Started

### Prerequisites

- Node.js (v16 or higher) or Docker
- MongoDB (local or remote) or Docker
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

````bash
Create a .env file at the project root and set the required variables manually. Example .env:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ridehailing-riders

````

3. Start MongoDB (if running locally):

```bash
# Make sure MongoDB is running on localhost:27017
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

#### Build and Run

```bash
npm run build
npm start
```

#### Seed Database

Populate the database with sample rider data:
Make sure to add a rhfd_riders.csv file to the src/scripts with sample data before running the script

```bash
npm run seed
```

### Docker Deployment

#### Prerequisites

- Docker and Docker Compose installed

#### Running with Docker Compose

Build and start all services (Rider Service + MongoDB):

```bash
docker-compose up --build
```

Run in detached mode:

```bash
docker-compose up -d --build
```

#### Docker Commands

**View running containers:**

```bash
docker-compose ps
```

**View logs:**

```bash
docker-compose logs -f rider-service
```

**Stop services:**

```bash
docker-compose down
```

**Stop services and remove volumes:**

```bash
docker-compose down -v
```

**Seed database in Docker:**
Make sure to add a rhfd_riders.csv file to the src/scripts with sample data before running this

```bash
docker-compose exec rider-service npm run seed
```

#### Building Docker Image

Build the Docker image:

```bash
docker build -t rider-service .
```

Run the container:

```bash
docker run -p 3001:3001 --env MONGODB_URI=mongodb://your-mongodb:27017/ridehailing-riders rider-service
```

### API Endpoints

#### Health Check

```
GET /health
```

Check service health and status.

#### Rider Endpoints

**Get All Riders**

```
GET /v1/riders
```

Returns a list of all riders.

Response:

```json
{
  "success": true,
  "count": 80,
  "data": [
    {
      "_id": "...",
      "name": "Rider1",
      "email": "rider1132@mail.com",
      "phone": "9324268160",
      "createdAt": "2024-01-01T03:41:39.000Z",
      "updatedAt": "2024-01-01T03:41:39.000Z"
    }
  ]
}
```

**Get Single Rider**

```
GET /v1/riders/:id
```

Returns a single rider by ID.

**Create Rider**

```
POST /v1/riders
```

Create a new rider profile.

Request Body:

```json
{
  "name": "Rider81",
  "email": "rider81@mail.com",
  "phone": "9876543210"
}
```

**Update Rider**

```
PUT /v1/riders/:id
```

Update an existing rider profile.

Request Body:

```json
{
  "name": "Updated Name",
  "email": "updated@mail.com"
}
```

**Delete Rider**

```
DELETE /v1/riders/:id
```

Delete a rider profile.

## Database Schema

### Rider Collection

The Rider model stores rider profile information.

**Schema:**

```typescript
{
  name: string; // Rider name (required, max 100 chars)
  email: string; // Email address (required, unique, validated)
  phone: string; // Phone number (required, unique, 10 digits)
  createdAt: Date; // Auto-generated timestamp
  updatedAt: Date; // Auto-updated timestamp
}
```

**Validation:**

- Name: Required, trimmed, max 100 characters
- Email: Required, unique, lowercase, validated format
- Phone: Required, unique, must be exactly 10 digits
- Timestamps: Automatically managed by Mongoose

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── scripts/        # Utility scripts (seed data)
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## Kubernetes Deployment (Minikube)

### Prerequisites

- Minikube installed and running
- kubectl configured

### Deploy to Minikube

1. **Start Minikube:**

```bash
minikube start
```

2. **Build Docker image inside Minikube:**

```bash
eval $(minikube docker-env)
docker build --no-cache -t rider-service:latest .
```

3. **Apply manifests and wait for readiness:**

```bash
kubectl apply -f k8s/
kubectl rollout status deployment/mongodb
kubectl rollout status deployment/rider-service
kubectl get pods -o wide
```

4. **Access the service:**

```bash
# NodePort (works directly on Linux/VM drivers)
curl http://$(minikube ip):30001/health

# Single-terminal port-forward (macOS Docker driver friendly)
kubectl port-forward svc/rider-service 3001:3001 >/tmp/rider-pf.log 2>&1 & PF=$!; sleep 1; curl -sS http://localhost:3001/health; kill $PF

# Or Minikube proxy in one terminal (paste URL; add /health)
minikube service rider-service --url
```

5. **View logs:**

```bash
kubectl logs -f deployment/rider-service
```

6. **Seed the database:**

```bash
# Prefer running the compiled JS to reduce memory usage
kubectl exec -it deployment/rider-service -- node dist/scripts/seedRiders.js

# If you encounter exit code 137 (OOM), temporarily increase resources and retry
kubectl set resources deployment/rider-service \
  --limits=memory=512Mi,cpu=500m --requests=memory=256Mi,cpu=200m
kubectl rollout status deployment/rider-service
kubectl exec -it deployment/rider-service -- node dist/scripts/seedRiders.js
```

#### Notes and Troubleshooting

- Always include a path like `/health` or `/v1/riders` (base URL may return 404).
- On macOS with the Docker driver, NodePort is not directly reachable from the host; use the port-forward one-liner above or run `minikube service` in another terminal.
- Ensure the image was built after `eval $(minikube docker-env)` and tagged exactly `rider-service:latest`.

### Kubernetes Resources

**mongodb.yaml:**

- PVC: Persistent volume for MongoDB data (1Gi)
- Deployment: MongoDB with liveness/readiness probes, resource limits
- Service: Headless service for MongoDB

**rider-service.yaml:**

- ConfigMap: Application configuration
- Secret: MongoDB connection URI
- Deployment: Rider Service (2 replicas) with probes and resource limits
- Service: NodePort for external access (port 30001)

## Monitoring and Observability

### Health Check Endpoint

The service provides a health check endpoint that returns service status and metrics:

```bash
GET /health
```

Response:

```json
{
  "status": "OK",
  "service": "Rider Service",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### Request Logging

All HTTP requests are automatically logged with the following information:

- Timestamp
- HTTP Method
- Request Path
- Response Status Code
- Response Duration
- Client IP Address

Example log output:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "method": "GET",
  "path": "/v1/riders",
  "statusCode": 200,
  "duration": "45ms",
  "ip": "192.168.1.1"
}
```

### Logging

- **Format**: JSON structured logs
- **Level**: Console output with timestamps
- **Coverage**: All API requests, errors, and health checks

### Error Handling

The service implements comprehensive error handling:

- Custom error classes (AppError, NotFoundError, ConflictError)
- Centralized error middleware
- Consistent error response format
- HTTP status code mapping

## API Documentation Summary

### Endpoints Overview

| Method | Endpoint         | Description          |
| ------ | ---------------- | -------------------- |
| GET    | `/health`        | Service health check |
| GET    | `/v1/riders`     | Get all riders       |
| GET    | `/v1/riders/:id` | Get single rider     |
| POST   | `/v1/riders`     | Create new rider     |
| PUT    | `/v1/riders/:id` | Update rider         |
| DELETE | `/v1/riders/:id` | Delete rider         |

### Response Format

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error message"
}
```

## Architecture

### Microservice Design

- **Database-per-Service**: Independent MongoDB database
- **Stateless**: No session state stored in the service
- **Scalable**: Horizontal scaling support
- **Containerized**: Docker-ready with multi-stage builds
- **Cloud-Ready**: Kubernetes manifests included

### Data Flow

1. Request → Express Middleware (JSON parser, logger)
2. Route → Controller → Service Logic
3. Controller → Model (Mongoose) → MongoDB
4. Response ← Format ← Error Handler

## License

This project is created for educational purposes as part of Scalable Service Assignment.
