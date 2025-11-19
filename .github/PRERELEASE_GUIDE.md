# Prerelease Deployment Guide

This guide explains how to test Calico versions before publishing to the main `latest` release on npm.

## Overview

There are several ways to test new versions:

1. **PR Prerelease** (automatic on pull requests)
2. **Manual Dev/Beta/RC** (manual trigger via GitHub Actions)
3. **Local Testing** (before publishing anywhere)

## PR Prerelease (Automatic)

Every pull request automatically triggers a prerelease build:

### How it works

1. **PR created/updated** → Workflow runs automatically
2. **Tests & lint pass** → Prerelease version generated
3. **Version format**: `1.0.0-pr.123.abc12345` (PR #123)
4. **Dist tag**: `pr`

### Install PR version

```bash
# Install via dist-tag (always gets latest PR prerelease)
npm install @alexcatdad/calico@pr

# Or install specific PR version
npm install @alexcatdad/calico@1.0.0-pr.123.abc12345
```

### Example workflow

```bash
# Create feature branch
git checkout -b feat/new-format

# Make changes and commit
git commit -m "feat: add new export format"

# Push and create PR
git push origin feat/new-format
```

→ GitHub Actions automatically publishes `@alexcatdad/calico@pr`

→ Reviewers can test with: `npm install @alexcatdad/calico@pr`

## Manual Prerelease (Dev/Beta/RC)

Manually trigger prerelease deployments from any state.

### Access

1. Go to **Actions** tab on GitHub
2. Select **Prerelease Deployment** workflow
3. Click **Run workflow**
4. Choose type:
   - **dev**: Development version (`1.0.0-dev.abc123`)
   - **beta**: Beta version (`1.0.0-beta.1`)
   - **rc**: Release candidate (`1.0.0-rc.1`)

### Use cases

| Type | When | Example |
|------|------|---------|
| `dev` | Testing features in development | Daily snapshots, internal testing |
| `beta` | Ready for community testing | "We're testing new CSV parser" |
| `rc` | Last check before release | "Please test 1.0.0-rc.1 before release" |
| `pr` | Testing pull requests | Automatic on every PR |

### Install specific prerelease

```bash
# Latest development version
npm install @alexcatdad/calico@dev

# Specific beta
npm install @alexcatdad/calico@1.0.0-beta.1

# Latest RC
npm install @alexcatdad/calico@rc
```

## Version Naming Convention

```
1.0.0-pr.123.abc12345
        ↑   ↑   ↑
        │   │   └─ Build ID (timestamp hash)
        │   └───── PR number
        └───────── Type (pr/dev/beta/rc)
```

| Type | Format | Example | Dist Tag |
|------|--------|---------|----------|
| PR | `MAJOR.MINOR.PATCH-pr.PR#.HASH` | `1.0.0-pr.42.abc123` | `pr` |
| Dev | `MAJOR.MINOR.PATCH-dev.HASH` | `1.0.0-dev.abc123` | `dev` |
| Beta | `MAJOR.MINOR.PATCH-beta.N` | `1.0.0-beta.1` | `beta` |
| RC | `MAJOR.MINOR.PATCH-rc.N` | `1.0.0-rc.1` | `rc` |

## Dist Tags Explained

Dist tags allow multiple versions to coexist on npm:

```bash
npm install @alexcatdad/calico           # Gets latest (default)
npm install @alexcatdad/calico@pr        # Gets latest PR prerelease
npm install @alexcatdad/calico@beta      # Gets latest beta
npm install @alexcatdad/calico@rc        # Gets latest RC
npm install @alexcatdad/calico@1.0.0-pr.42.abc123  # Specific version
```

## Enabling Real Publishing

Currently, prerelease deployments run in **dry-run mode** (no actual publishing).

To enable real npm publishing:

### 1. Create npm token

1. Go to [npmjs.com](https://www.npmjs.com)
2. Sign in to your account
3. Settings → Tokens → Create Token
4. Choose **Automation** type (can publish)
5. Copy token

### 2. Add GitHub secret

1. Go to repo → Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `NPM_TOKEN`
4. Value: paste your npm token

### 3. Uncomment publish commands

In `.github/workflows/prerelease.yml`, find the "Publish to npm" step:

**Before** (dry-run):
```yaml
- name: Publish to npm (dry run)
  run: |
    echo "[DRY RUN] Publishing..."
```

**After** (real publish):
```yaml
- name: Publish to npm
  run: |
    npm config set //registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}

    cd packages/core
    npm publish --tag ${{ steps.version.outputs.dist_tag }}

    cd ../validators
    npm publish --tag ${{ steps.version.outputs.dist_tag }}

    cd ../cli
    npm publish --tag ${{ steps.version.outputs.dist_tag }}
```

## Testing Locally First

Before publishing anywhere, test locally:

### Build
```bash
bun turbo build
```

### Link for local development
```bash
cd packages/core
npm link

# In another project
npm link @alexcatdad/calico
```

### Install from file
```bash
npm install ./packages/core/dist
```

## CI/CD Overview

```
┌─ All Branches ────────────────────────────────┐
│ • Lint                                        │
│ • Test (50 tests)                             │
│ • Build                                       │
│ • Bundle size check                           │
└──────────────────────────────────────────────┘
         ↓
┌─ Pull Requests (test.yml) ────────────────────┐
│ • Runs all branches checks                    │
│ • Creates prerelease (automatic)              │
│ • Comments version on PR                      │
└──────────────────────────────────────────────┘
         ↓
┌─ Main Branch (publish.yml) ────────────────────┐
│ • Runs all tests                              │
│ • Semantic version bump (conventional commits)│
│ • Publishes to latest (when enabled)          │
└──────────────────────────────────────────────┘
         ↓
┌─ Manual Trigger (prerelease.yml) ─────────────┐
│ • Dev/Beta/RC versions anytime               │
│ • Flexible version control                    │
│ • No git commits required                     │
└──────────────────────────────────────────────┘
```

## Examples

### Example 1: Test a feature in PR

```bash
# Create PR with new feature
git checkout -b feat/csv-custom-delimiter
# ... make changes ...
git commit -m "feat: allow custom CSV delimiters"
git push origin feat/csv-custom-delimiter

# PR automatically gets prerelease version
# GitHub Actions posts comment with version
# Reviewers test: npm install @alexcatdad/calico@pr

# After merge to main:
# Auto-publishes as v1.1.0 (minor bump for feat)
```

### Example 2: Beta testing new version

```bash
# Manually trigger beta from GitHub Actions
# Select Prerelease Deployment workflow
# Choose "beta" option

# Creates: 1.0.0-beta.1
# Publish with: npm install @alexcatdad/calico@beta

# Test the beta version
# If issues found:
#   - Create PR with fixes
#   - Test updated PR prerelease
#   - Eventually publishes as 1.0.0-rc.1
#   - Final review → 1.0.0 released
```

### Example 3: Release candidate before major release

```bash
# After all features added
# Manually trigger "rc" option
# Creates: 1.0.0-rc.1

# Users test: npm install @alexcatdad/calico@rc
# Report issues → fix in new PRs
# Create 1.0.0-rc.2, 1.0.0-rc.3 as needed
# After final approval, merge to main
# Auto-publishes as 1.0.0 (major release)
```

## Best Practices

✅ **Do:**
- Use PR prereleases for reviewing features
- Use beta/rc for community testing
- Update CHANGELOG when publishing RC
- Test locally before PR
- Use conventional commits for auto-versioning

❌ **Don't:**
- Publish to `latest` from feature branches
- Create manual version numbers
- Skip testing before RC
- Publish multiple RCs with same number

## Troubleshooting

**Q: Why doesn't my PR have a prerelease?**
- Check if PR is marked as draft (these skip deployment)
- Check if tests passed (red X prevents deployment)
- Check GitHub Actions tab for workflow results

**Q: How do I update a prerelease version?**
- Push new commit to PR → new prerelease created
- Or manually trigger workflow with different type

**Q: Can I delete a prerelease from npm?**
- Yes: `npm unpublish @alexcatdad/calico@1.0.0-pr.42.abc123`
- Or use npm registry web UI
- Requires npm token with unpublish permissions

**Q: What if I want to skip a version?**
- Manually delete git tags: `git tag -d v1.0.0 && git push origin :refs/tags/v1.0.0`
- Next publish will recalculate based on conventional commits
