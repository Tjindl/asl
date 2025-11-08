#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/push-to-github.sh [-r <remote_url>] [-n <repo_name>] [-b <branch>] [-m <commit_msg>] [--gh-create]
# Examples:
#   ./scripts/push-to-github.sh -r git@github.com:USER/REPO.git
#   ./scripts/push-to-github.sh -n my-repo --gh-create

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REMOTE_URL=""
REPO_NAME=""
BRANCH="main"
COMMIT_MSG="Initial commit"
GH_CREATE=false
QUIET=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -r|--remote) REMOTE_URL="$2"; shift 2;;
    -n|--name) REPO_NAME="$2"; shift 2;;
    -b|--branch) BRANCH="$2"; shift 2;;
    -m|--message) COMMIT_MSG="$2"; shift 2;;
    --gh-create) GH_CREATE=true; shift;;
    -q|--quiet) QUIET=true; shift;;
    -h|--help) echo "See header comments for usage."; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

info() { if [ "$QUIET" = false ]; then echo "› $*"; fi }
error() { echo "Error: $*" >&2; }

trap 'error "Script failed at line $LINENO"; exit 1' ERR

# Ensure git is available
if ! command -v git >/dev/null 2>&1; then
  error "git is not installed or not in PATH."
  exit 1
fi

# Initialize git if needed
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  info "Initializing new git repository..."
  git init
fi

# Stage and commit if there are changes
if [ -n "$(git status --porcelain)" ]; then
  info "Staging changes..."
  git add .
  info "Committing changes..."
  git commit -m "$COMMIT_MSG" || true
else
  info "No working-tree changes to commit."
fi

# Ensure there is at least one commit (create empty commit if necessary)
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  info "Creating initial empty commit so branch can be pushed..."
  git commit --allow-empty -m "$COMMIT_MSG"
fi

# If remote URL supplied, (re)configure origin
if [ -n "$REMOTE_URL" ]; then
  if git remote | grep -q '^origin$'; then
    info "Updating origin to $REMOTE_URL"
    git remote set-url origin "$REMOTE_URL"
  else
    info "Adding origin $REMOTE_URL"
    git remote add origin "$REMOTE_URL"
  fi
fi

# If origin missing and GH_CREATE requested or gh available, try to create remote via gh
if ! git remote | grep -q '^origin$'; then
  if $GH_CREATE || command -v gh >/dev/null 2>&1; then
    if ! command -v gh >/dev/null 2>&1; then
      error "gh CLI not found; install it or provide -r <remote_url>."
      exit 1
    fi
    REPO_NAME="${REPO_NAME:-$(basename "$ROOT_DIR")}"
    info "Creating GitHub repo '$REPO_NAME' with gh and adding origin..."
    # create non-interactively; fallback to just creating and adding remote
    gh repo create "$REPO_NAME" --private --source=. --remote=origin --push || {
      info "gh repo create failed or repo may already exist; attempting to add origin from gh..."
      ORIGIN_URL="$(gh repo view --json sshUrl --jq .sshUrl 2>/dev/null || true)"
      if [ -n "$ORIGIN_URL" ]; then
        git remote add origin "$ORIGIN_URL"
      else
        error "Unable to create or discover remote. Provide -r <remote_url>."
        exit 1
      fi
    }
  else
    error "No 'origin' remote configured. Provide -r <remote_url> or run with --gh-create (requires gh CLI)."
    exit 1
  fi
fi

# Ensure branch exists locally and switch/create it
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  info "Switching to existing branch $BRANCH"
  git checkout "$BRANCH"
else
  info "Creating and switching to branch $BRANCH"
  git checkout -b "$BRANCH"
fi

# Push and set upstream
info "Pushing to origin/$BRANCH..."
git push -u origin "$BRANCH"

info "Push complete."
git remote -v
