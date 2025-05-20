const fs = require('fs').promises;
const { execSync } = require('child_process');
const path = require('path');

// Configuration
const REPO_PATH = '/Users/ankursoni/Desktop/projects/git-101'; // Replace with your local repository path
const FILE_TO_COMMIT = 'canvas.txt'; // File to modify for commits
const COMMITS_PER_DAY = 3; // Number of commits per date for visibility
const START_DATE = new Date('2024-05-19'); // Start date (Sunday, ~1 year ago)
const REPO_URL = 'https://github.com/soniankur948/git-fun.git'; // Replace with your repo URL

async function runCommand(command, cwd = REPO_PATH) {
    try {
        execSync(command, { cwd, stdio: 'inherit' });
    } catch (error) {
        throw new Error(`Command failed: ${command}\nError: ${error.message}`);
    }
}

async function resetRepository() {
    // Check if repository path exists
    const repoExists = await fs.access(REPO_PATH).then(() => true).catch(() => false);
    if (!repoExists) {
        await fs.mkdir(REPO_PATH, { recursive: true });
    } else {
        // Remove existing .git folder to reset local history
        const gitDir = path.join(REPO_PATH, '.git');
        await fs.rm(gitDir, { recursive: true, force: true }).catch(() => {});
    }

    // Reinitialize the repository
    runCommand('git init');
    await fs.writeFile(path.join(REPO_PATH, FILE_TO_COMMIT), 'Initial commit after full reset\n');
    runCommand(`git add ${FILE_TO_COMMIT}`);
    runCommand('git commit -m "Full reset and initial commit"');
    runCommand(`git remote add origin ${REPO_URL}`);

    // Fetch and prune remote to ensure no old refs remain
    runCommand('git fetch origin --prune');
    runCommand('git branch -M main');
    runCommand(`git push origin main --force`);

    console.log('Repository fully reset and pushed successfully!');
}

(async () => {
    try {
        await resetRepository();
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
})();