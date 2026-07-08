# ZoneOn AI Deployment Guide

This guide details instructions to compile, bundle, containerize, and deploy the ZoneOn AI platform on **Google Cloud Run** and standard Docker environments.

---

## 🐋 1. Containerization (Docker Setup)

We supply a production-ready container blueprint. Create a `Dockerfile` in the root directory:

```dockerfile
# Use official Node.js alpine base image
FROM node:18-alpine

# Establish working directory
WORKDIR /app

# Copy dependency logs
COPY package*.json ./

# Install packages
RUN npm ci

# Copy codebase contents
COPY . .

# Compile application assets
RUN npm run build

# Expose routing port
EXPOSE 3000

# Launch server
CMD ["npm", "run", "start"]
```

To build and run the image locally:
```bash
docker build -t zoneon-ai .
docker run -p 3000:3000 --env GEMINI_API_KEY=your_key_here zoneon-ai
```

---

## ☁️ 2. Cloud Run Deployment

ZoneOn AI is optimized for deployment on serverless container clouds like **Google Cloud Run**.

### Build and Push using Cloud Build
```bash
gcloud builds submit --tag gcr.io/your-project-id/zoneon-ai
```

### Deploy to Cloud Run
```bash
gcloud run deploy zoneon-ai \
  --image gcr.io/your-project-id/zoneon-ai \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_gemini_key_here
```

---

## 🔒 3. Secret Management & Compliance
For production environments, do not pass credentials as raw build arguments. Inject `GEMINI_API_KEY` using **Google Cloud Secret Manager** mapped directly into the container context on runtime initialization.
