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

## 2. Deployment via Azure Portal (No CLI required)

Since you've already pushed your code to GitHub, the easiest way to deploy is using the **Azure Portal** and linking it to your repository.

### Part A: Host the Backend (Azure App Service)
1.  Go to the [Azure Portal](https://portal.azure.com).
2.  Click **Create a resource** > **Web App**.
3.  **Basics**:
    - **Resource Group**: Create new (e.g., `asl-app-rg`).
    - **Name**: `asl-backend-api` (must be unique).
    - **Publish**: **Container**.
    - **Operating System**: **Linux**.
4.  **Container**:
    - **Image Source**: **GitHub Actions**.
    - Link your GitHub account and select the `asl` repository and `finalizing` branch.
    - Azure will automatically create a GitHub Action file in your repo to build and deploy the `backend/Dockerfile`.
5.  **Review + create**.

### Part B: Host the Frontend (Azure Static Web Apps)
1.  Search for **Static Web Apps** in the Portal.
2.  **Create**:
    - **Name**: `asl-frontend`.
    - **Plan type**: **Free**.
    - **Deployment details**: Select **GitHub**.
    - Select your repository and the `finalizing` branch.
    - **Build Presets**: **React**.
    - **App location**: `/frontend`.
    - **Api location**: (leave blank).
    - **Output location**: `build`.
3.  **Review + create**.

---

## 3. Configuration & Connecting the two

Once both are deployed:

1.  **Get URLs**: Find the URL for your Backend (e.g., `asl-backend-api.azurewebsites.net`) and Frontend.
2.  **Enable CORS**:
    - In the Backend Web App -> **Configuration** -> **Application settings**.
    - Add `FRONTEND_URL` = `https://<your-frontend-url>.azurestaticapps.net`.
3.  **Update Frontend API URL**:
    - In the Static Web App -> **Configuration**.
    - Add `REACT_APP_API_URL` = `https://asl-backend-api.azurewebsites.net`.
