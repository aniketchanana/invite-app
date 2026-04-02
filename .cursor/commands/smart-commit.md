---
description: Analyze staged and working directory changes, then create a commit with a precise, conventional commit message
---

# Smart Commit

Analyze all staged and unstaged changes, draft a meaningful commit message based on the actual diff, and commit.

## Steps

1. **Gather current state (run in parallel)**
   - `git status` — see staged, unstaged, and untracked files
   - `git diff --cached` — see what is already staged
   - `git diff` — see unstaged modifications
   - `git log --oneline -5` — recent commit messages for style reference

2. **Stage files intelligently**
   - If there are unstaged changes or untracked files, ask the user whether to:
     - Stage everything (`git add .`)
     - Stage only specific files (let the user pick)
     - Commit only what is already staged
   - Never stage `.env`, `serviceAccountKey.json`, or other secret files. If detected, warn and exclude.

3. **Analyze the diff**
   - Read the full staged diff (`git diff --cached`) after staging.
   - Identify the nature of the change:
     - `feat:` — new functionality
     - `fix:` — bug fix
     - `refactor:` — code restructuring without behavior change
     - `test:` — adding or updating tests only
     - `style:` — formatting, whitespace, CSS-only changes
     - `docs:` — documentation changes
     - `chore:` — config, dependencies, build tooling
     - `perf:` — performance improvement
   - Identify the scope (which area of the codebase: auth, dashboard, invite, firestore, templates, etc.)

4. **Draft the commit message**
   - Format: `type(scope): concise summary`
   - The summary line must be under 72 characters.
   - If the change is non-trivial, add a body (separated by a blank line) with 1-3 lines explaining **why** the change was made, not what files were touched.
   - Never include file lists in the commit message — `git log --stat` already shows that.

   Example:
   ```
   feat(invite): add gift claiming with transaction-based conflict prevention

   Guests can now claim gifts from the invite page. Uses Firestore
   runTransaction to prevent double-claims under concurrent access.
   ```

5. **Commit**
   - Run `git commit -m "<message>"` using a HEREDOC for multi-line messages.
   - Run `git status` after to confirm the commit succeeded.

6. **Report**
   - Show the commit hash, message, and summary of files committed.
   - Do NOT push unless the user explicitly asks.

## Safety Rules

- Never commit files containing secrets (`.env`, credentials, private keys). Warn and exclude.
- Never amend existing commits unless the user explicitly asks.
- Never force push.
- If the staging area is empty and there are no changes to commit, tell the user — do not create an empty commit.
