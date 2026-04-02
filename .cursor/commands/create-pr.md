---
description: Create a GitHub PR from the current branch to main with an auto-generated summary
---

# Create Pull Request

Create a pull request from the current branch to `main` with an auto-generated title and description based on actual code changes.

## Steps

1. **Verify branch state**
   - Confirm you are NOT on `main`. If on `main`, stop and tell the user.
   - Ensure there are commits on this branch that differ from `main`. If not, stop and tell the user.

2. **Collect change context (run all in parallel)**
   - `git status` — check for uncommitted changes
   - `git diff main...HEAD` — full PR diff since divergence
   - `git log --oneline main..HEAD` — commit history for this branch

3. **Handle uncommitted changes**
   - If there are uncommitted changes, ask the user if they want to commit them first before creating the PR.

4. **Draft PR title**
   - Concise, action-oriented title matching repo conventions.
   - Use the branch name or top commit summary as a starting point.
   - Format: `feat: ...`, `fix: ...`, `chore: ...` etc. if the repo uses conventional commits.

5. **Draft PR body (3–4 lines max)**
   - Line 1: Summary of the main change
   - Line 2: Notable behavior/UX change (if any)
   - Line 3: Test status (tests added/updated, or "no test changes")
   - Line 4: (Optional) Risk notes or follow-up items

6. **Push branch if needed**
   - If the branch is not pushed to origin, push with `git push -u origin HEAD`.

7. **Create the PR**
   - Use `gh pr create --base main --head <branch> --title "<title>" --body "<body>"`
   - If `gh` is not available, try the GitHub MCP tools.

8. **Return results**
   - Output the PR URL and the final title + body used.
   - Do not dump large diffs into the chat.

## Safety Rules

- Never push or PR to a different base branch unless the user explicitly asks.
- Never include secrets or `.env` files. If detected, warn and stop.
- Never force push. Never rewrite history.
- If there are known failing checks, mention them in the PR body.
