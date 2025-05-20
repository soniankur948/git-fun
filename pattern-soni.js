const fs = require('fs').promises;
const { execSync } = require('child_process');
const path = require('path');

// Configuration
const REPO_PATH = '/Users/ankursoni/Desktop/projects/git-101'; // Replace with your local repository path
const FILE_TO_COMMIT = 'canvas.txt'; // File to modify for commits
const COMMITS_PER_DAY = 3; // Number of commits per date for visibility
const START_DATE = new Date('2024-05-19'); // Start date (Sunday, ~1 year ago)
const REPO_URL = 'https://github.com/soniankur948/git-fun.git'; // Replace with your repo URL

// Pattern for "8888 8888" in a 7x53 grid (5x3 per digit, 1-2 column gaps, starting week 10)
const PATTERN = [
    Array(53).fill(0), // Sun: empty
    Array(9).fill(0).concat([1,1,1, 0, 1,1,1, 0, 1,1,1, 0, 1,1,1, 0], Array(2).fill(0), [1,1,1, 0, 1,1,1, 0, 1,1,1, 0, 1,1,1, 0], Array(27).fill(0)), // Mon
    Array(9).fill(0).concat([0,0,0, 0, 0,0,0, 0, 0,0,0, 0, 0,0,0, 0], Array(2).fill(0), [0,0,0, 0, 0,0,0, 0, 0,0,0, 0, 0,0,0, 0], Array(27).fill(0)), // Tue
    Array(9).fill(0).concat([1,1,1, 0, 1,1,1, 0, 1,1,1, 0, 1,1,1, 0], Array(2).fill(0), [1,1,1, 0, 1,1,1, 0, 1,1,1, 0, 1,1,1, 0], Array(27).fill(0)), // Wed
    Array(9).fill(0).concat([0,0,0, 0, 0,0,0, 0, 0,0,0, 0, 0,0,0, 0], Array(2).fill(0), [0,0,0, 0, 0,0,0, 0, 0,0,0, 0, 0,0,0, 0], Array(27).fill(0)), // Thu
    Array(9).fill(0).concat([1,1,1, 0, 1,1,1, 0, 1,1,1, 0, 1,1,1, 0], Array(2).fill(0), [1,1,1, 0, 1,1,1, 0, 1,1,1, 0, 1,1,1, 0], Array(27).fill(0)), // Fri
    Array(53).fill(0)  // Sat: empty
];

function runCommand(command, cwd = REPO_PATH) {
    try {
        execSync(command, { cwd, stdio: 'inherit' });
    } catch (error) {
        throw new Error(`Command failed: ${command}\nError: ${error.message}`);
    }
}

async function makeCommit(date, commitMessage) {
    await fs.appendFile(path.join(REPO_PATH, FILE_TO_COMMIT), `Change at ${new Date().toISOString()}\n`);
    runCommand(`git add ${FILE_TO_COMMIT}`);
    const dateStr = date.toISOString().split('T')[0] + 'T12:00:00';
    runCommand(`GIT_AUTHOR_DATE="${dateStr}" GIT_COMMITTER_DATE="${dateStr}" git commit -m "${commitMessage}"`);
}

async function updatePatternCommits() {
    process.chdir(REPO_PATH);

    // Ensure repository is set up
    if (!await fs.access(path.join(REPO_PATH, '.git')).then(() => true).catch(() => false)) {
        runCommand('git init');
        await fs.writeFile(path.join(REPO_PATH, FILE_TO_COMMIT), 'Initial commit\n');
        runCommand(`git add ${FILE_TO_COMMIT}`);
        runCommand('git commit -m "Initial commit"');
        runCommand(`git remote add origin ${REPO_URL}`);
        runCommand('git branch -M main');
        runCommand(`git push -u origin main`);
    }

    let currentDate = new Date(START_DATE);
    for (let week = 0; week < 53; week++) {
        for (let day = 0; day < 7; day++) {
            if (PATTERN[day][week] === 1) {
                for (let i = 0; i < COMMITS_PER_DAY; i++) {
                    const commitMessage = `Update commit for ${currentDate.toISOString().split('T')[0]}`;
                    await makeCommit(currentDate, commitMessage);
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    runCommand('git push origin main');
    console.log('Pattern updated and pushed successfully!');
}

(async () => {
    try {
        await updatePatternCommits();
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
})();