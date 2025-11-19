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

To enable real npm publishing, use **NPM's trusted publishers** (recommended):

### 1. Configure trusted publisher on npm

1. Go to [npmjs.com](https://www.npmjs.com)
2. Sign in to your account
3. Click on your avatar → Profile
4. Select **Packages** tab
5. Click on each package (@alexcatdad/calico, @alexcatdad/calico-validators, @alexcatdad/calico-cli)
6. For each package:
   - Go to **Settings** tab
   - Scroll to **Trusted Publishers**
   - Click **Add a trusted publisher**
   - Select **GitHub Actions**
   - **Repository**: `alexcatdad/calico`
   - **Workflow filename**: `.github/workflows/publish.yml` (for main releases) or `.github/workflows/prerelease.yml` (for PR releases)
   - **Environment**: leave blank or select your environment
   - Save

**Benefits of Trusted Publishers:**
- ✅ No tokens to manage or rotate
- ✅ Automatic OIDC token from GitHub
- ✅ More secure than personal access tokens
- ✅ NPM-recommended approach
- ✅ Perfect for CI/CD

See [npm docs](https://docs.npmjs.com/trusted-publishers) for more details.

### 2. Update workflows to use OIDC

The workflows already support OIDC. Just uncomment the publish commands:

**Before** (dry-run):
```bash
bun publish --dry-run --tag $DIST_TAG
```

**After** (real publish):
```bash
bun publish --tag $DIST_TAG
```

GitHub Actions will automatically provide an OIDC token that npm accepts.

### 3. (Optional) Legacy: Personal Access Token

If you prefer the old method with personal tokens:

1. Go to [npmjs.com](https://www.npmjs.com)
2. Settings → Tokens → Create Token
3. Choose **Automation** type
4. Copy token
5. Go to repo → Settings → Secrets
6. Add secret: `NPM_TOKEN`
7. Update workflows to use:
   ```bash
   export NPM_CONFIG_TOKEN=${{ secrets.NPM_TOKEN }}
   bun publish --tag $DIST_TAG
   ```

**Not recommended** - tokens need manual rotation and management.

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
