# RecCollection Branch Workflow

## Branch Structure

The RecCollection repository uses a three-branch structure to manage development and contributions:

1. **main** - Production-ready code
2. **dev** - Development code that has passed review
3. **test** - Testing branch for new contributions

## Branch Protection Rules

### main Branch
- Requires pull request reviews before merging
- Only repository owner (TopherMayor) can merge to main
- Direct pushes to main are not allowed
- Contains stable, production-ready code

### dev Branch
- Branched from main
- Requires pull request reviews before merging
- Contains code that has passed review but may not be ready for production
- Periodically merged into main when features are complete and stable

### test Branch
- Branched from dev
- Contains code that is being tested and reviewed
- Contributors should push their changes to this branch
- Once reviewed, changes can be merged into dev

## Workflow for Contributors

### Starting Work on a New Feature

1. Make sure your local repository is up to date:
   ```bash
   git checkout test
   git pull origin test
   ```

2. Create a feature branch from test:
   ```bash
   git checkout -b feature/your-feature-name test
   ```

3. Make your changes, commit them, and push to your feature branch:
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push -u origin feature/your-feature-name
   ```

### Submitting Your Changes

1. Push your feature branch to the remote repository:
   ```bash
   git push -u origin feature/your-feature-name
   ```

2. Create a pull request from your feature branch to the test branch.

3. Wait for review and address any feedback.

4. Once approved, your changes will be merged into the test branch.

### Promoting Changes to dev

1. After changes have been tested and reviewed in the test branch, create a pull request from test to dev.

2. Only maintainers can approve and merge pull requests from test to dev.

### Promoting Changes to main

1. After changes have been thoroughly tested in dev, create a pull request from dev to main.

2. Only the repository owner (TopherMayor) can approve and merge pull requests to main.

## Best Practices

1. **Always create feature branches** from the test branch, not directly from dev or main.

2. **Keep pull requests focused** on a single feature or bug fix.

3. **Write descriptive commit messages** that explain what changes were made and why.

4. **Update your local branches regularly** to avoid merge conflicts:
   ```bash
   git checkout test
   git pull origin test
   git checkout your-feature-branch
   git rebase test
   ```

5. **Run tests locally** before submitting a pull request.

6. **Document your changes** in the pull request description.

## Diagram

```
main (production)
  │
  ├── dev (development)
  │     │
  │     ├── test (testing)
  │     │     │
  │     │     ├── feature/feature-1
  │     │     │
  │     │     ├── feature/feature-2
  │     │     │
  │     │     └── feature/feature-3
  │     │
  │     └── hotfix/urgent-fix (if needed)
  │
  └── hotfix/critical-fix (if needed)
```
