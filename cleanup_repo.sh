#!/bin/bash

# Remove existing git
rm -rf .git

# Remove unnecessary files
find . -name "*.pyc" -delete
find . -name "__pycache__" -exec rm -rf {} +
find . -name "node_modules" -exec rm -rf {} +
find . -name ".DS_Store" -delete
find . -name "*.h5" -delete

# Initialize new git
git init

# Add files
git add .

# Initial commit
git commit -m "Initial clean commit"

# Set up remote
git branch -M main
git remote add origin https://github.com/Tjindl/asl.git
