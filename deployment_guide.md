# Your ASL App Azure Deployment

I have already started the deployment for you! Below are the specific resources I created and the next steps.

## 1. Resources Created
- **Resource Group**: `aslapprg`
- **Container Registry**: `aslappregistrytj`
- **Backend Web App**: `asl-backend-api` (Status: Starting up)

## Deploying ASL Recognition App to Render

We are switching the deployment from Azure to **Render** for a more streamlined experience. We will use Render's **Blueprint (Infrastructure as Code)** feature to set up both the backend and frontend.

## Prerequisites
1.  **Render Account**: Sign up at [render.com](https://render.com).
2.  **GitHub Connection**: Link your GitHub account to Render.
3.  **Repository**: Ensure your code (including the new `render.yaml`) is pushed to your GitHub repository.

## Deployment Steps

### Step 1: Push Changes to GitHub
Make sure the `render.yaml` and latest code are pushed:
```bash
git add .
git commit -m "Add Render deployment blueprint"
git push origin finalizing
```

### Step 2: Create a New Blueprint
1.  Go to the [Render Dashboard](https://dashboard.render.com).
2.  Click **New** (top right) -> **Blueprint**.
3.  Connect your GitHub repository.
4.  Render will automatically detect the `render.yaml` file.
5.  Click **Apply**.

### Step 3: Monitor Deployment
Render will now create two services:
- **asl-backend**: A Web Service running your Dockerized Flask API.
- **asl-frontend**: A Static Site serving your React application.

### Step 4: Final Configuration (If needed)
The blueprint is designed to link them automatically, but if you need to adjust URLs:
1.  **Backend**: `FRONTEND_URL` environment variable should point to your Render frontend URL.
2.  **Frontend**: `REACT_APP_API_URL` environment variable should point to your Render backend URL.

## Local Testing
You can still run the entire stack locally using Docker Compose:
```bash
docker-compose up --build
```
