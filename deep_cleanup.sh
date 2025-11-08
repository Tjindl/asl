#!/bin/bash

# Remove all git repositories
rm -rf .git
find . -name ".git" -exec rm -rf {} +

# Remove virtual environments
rm -rf backend/venv
rm -rf backend/.venv
rm -rf .venv

# Remove node modules
rm -rf frontend/node_modules
rm -rf frontend/.next

# Remove cache files
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type d -name ".cache" -exec rm -rf {} +
find . -name "*.pyc" -delete
find . -name ".DS_Store" -delete

# Initialize fresh git
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial clean commit"

# Set up remote
git branch -M main
git remote add origin https://github.com/Tjindl/asl.git

echo "Repository cleaned and initialized. Ready for push."
