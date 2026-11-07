#!/usr/bin/env bash
# One-shot GitHub Pages deploy for this static site.
# Run from this directory with Git Bash (Windows) or any POSIX shell:
#   bash deploy-github.sh
# It uses the Git credential already stored for github.com; no token is written to disk.
set -euo pipefail

OWNER="${GITHUB_OWNER:-xiaojinyi1}"
REPO="${GITHUB_REPO:-jinyi-portfolio}"
BRANCH="main"
REMOTE="https://github.com/${OWNER}/${REPO}.git"
API="https://api.github.com/repos/${OWNER}/${REPO}"

command -v git >/dev/null || { echo "git is required"; exit 1; }
command -v curl >/dev/null || { echo "curl is required"; exit 1; }

cred=$(printf 'protocol=https\nhost=github.com\n\n' | GIT_TERMINAL_PROMPT=0 git credential fill 2>/dev/null || true)
token=$(printf '%s\n' "$cred" | sed -n 's/^password=//p')
if [ -z "$token" ]; then
  echo "No cached GitHub credential found. Run: git credential fill (host=github.com) first."
  exit 1
fi

echo "Checking ${OWNER}/${REPO} ..."
code=$(curl -sS -o /tmp/jinyi-repo.json -w '%{http_code}' -H "Authorization: Bearer ${token}" "$API")
if [ "$code" = "404" ]; then
  echo "Creating repository ${OWNER}/${REPO} ..."
  curl -sS -X POST \
    -H "Authorization: Bearer ${token}" \
    -H "Accept: application/vnd.github+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"${REPO}\",\"description\":\"JINYI — Selected Works / Three.js billboard portfolio\",\"homepage\":\"https://${OWNER}.github.io/${REPO}/\",\"private\":false,\"has_issues\":true,\"has_projects\":false,\"has_wiki\":false}" \
    >/tmp/jinyi-create.json
elif [ "$code" != "200" ]; then
  echo "GitHub API returned HTTP ${code}; refusing to continue."
  cat /tmp/jinyi-repo.json
  exit 1
fi

if [ ! -d .git ]; then
  git init
fi
git add .
if ! git diff --cached --quiet; then
  git commit -m "feat: Three.js billboard portfolio"
fi
git branch -M "$BRANCH"
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REMOTE"
else
  git remote set-url origin "$REMOTE"
fi

echo "Pushing ${BRANCH} ..."
git -c http.extraheader="AUTHORIZATION: Bearer ${token}" push -u origin "$BRANCH"

echo "Enabling GitHub Pages (Actions build) ..."
curl -sS -X POST \
  -H "Authorization: Bearer ${token}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${OWNER}/${REPO}/pages" \
  -d '{"build_type":"workflow"}' >/tmp/jinyi-pages.json || true

cat <<EOF

Done.
Repository: https://github.com/${OWNER}/${REPO}
Actions:    https://github.com/${OWNER}/${REPO}/actions
Site:       https://${OWNER}.github.io/${REPO}/

If the first Actions run cannot enable Pages, open:
  https://github.com/${OWNER}/${REPO}/settings/pages
and set Source to "GitHub Actions", then re-run the workflow.
EOF
