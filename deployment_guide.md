# Azure Deployment Guide

This guide describes how to deploy the ASL Recognition App to Microsoft Azure.

## Prerequisites
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed.
- [Docker](https://www.docker.com/products/docker-desktop/) installed and running.
- An active Azure Subscription.

## 1. Backend: Azure App Service (Web App for Containers)

The backend is a Flask application that will run in a Docker container.

### Step 1: Create Azure Resources
```bash
# Login to Azure
az login

# Create a resource group
az group create --name asl-app-rg --location eastus

# Create an Azure Container Registry (ACR)
az acr create --resource-group asl-app-rg --name aslregistry$(date +%s) --sku Basic
```

### Step 2: Build and Push Docker Image
```bash
# Login to ACR
az acr login --name <your-acr-name>

# Build and push
az acr build --registry <your-acr-name> --image asl-backend ./backend
```

### Step 3: Create App Service
```bash
# Create an App Service Plan
az appservice plan create --name asl-backend-plan --resource-group asl-app-rg --is-linux --sku B1

# Create the Web App for Containers
az webapp create --resource-group asl-app-rg --plan asl-backend-plan --name asl-backend-api --deployment-container-image-name <your-acr-name>.azurecr.io/asl-backend:latest
```

## 2. Frontend: Azure Static Web Apps

The frontend is a React application. Azure Static Web Apps is the easiest and most cost-effective way to host it.

### Option A: Via GitHub (Recommended)
1.  Push your code to a GitHub repository.
2.  Go to the [Azure Portal](https://portal.azure.com).
3.  Create a new **Static Web App**.
4.  Link your GitHub repo and select the branch.
5.  Select **React** as the Build Preset.
6.  Set **App location** to `/frontend` and **Output location** to `build`.

### Option B: Via Azure CLI
```bash
az staticwebapp create --name asl-frontend --resource-group asl-app-rg --source ./frontend --location eastus --branch main --token <GITHUB_TOKEN>
```

## 3. Configuration

### Backend Environment Variables
Update the Web App settings to allow your frontend URL:
```bash
az webapp config appsettings set --resource-group asl-app-rg --name asl-backend-api --settings FRONTEND_URL=https://<your-static-web-app-url>.azurestaticapps.net
```

### Frontend Environment Variables
In Azure Static Web Apps, you can add environment variables in the Portal or via CLI:
- `REACT_APP_API_URL`: `https://asl-backend-api.azurewebsites.net`
