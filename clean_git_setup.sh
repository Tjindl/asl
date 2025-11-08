#!/bin/bash

# Remove all existing git repositories
find . -type d -name ".git" -exec rm -rf {} +

# Initialize fresh git repository
git init

# Create gitignore
cat > .gitignore << EOL
# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
*.h5

# Node
node_modules/
/frontend/build
.env
.env.local
.DS_Store

# IDE
.vscode/
.idea/
EOL

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: ASL Recognition App"

echo "Git repository cleaned and initialized successfully!"
