const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// You may need to adjust this path based on your Git installation
const gitPath = 'C:\\Program Files\\Git\\cmd\\git.exe';

const stashClone = async (cloneUrl, username, password) => {
  console.log('Starting clone process...');
  const repoName = cloneUrl.split('/').pop().replace('.git', '');
  const tempDir = path.join(__dirname, '..', 'temp_repos');
  const repoPath = path.join(tempDir, repoName);

  console.log(`Repository: ${repoName}`);
  console.log(`Temp directory: ${tempDir}`);
  console.log(`Repository path: ${repoPath}`);

  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    console.log('Creating temp directory...');
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Remove existing repo if it exists
  if (fs.existsSync(repoPath)) {
    console.log('Removing existing repository...');
    fs.rmSync(repoPath, { recursive: true, force: true });
  }

  return new Promise((resolve, reject) => {
    // Prepare the clone URL with credentials
    const urlWithAuth = cloneUrl.replace('https://', `https://${username}:${encodeURIComponent(password)}@`);

    console.log('Starting git clone...');
    // Clone the repository
    const git = spawn(gitPath, ['clone', '--progress', urlWithAuth, repoPath]);

    let output = '';

    git.stderr.on('data', (data) => {
      const message = data.toString();
      console.log('Git progress:', message);
      output += message;
    });

    git.on('close', (code) => {
      console.log(`Git process exited with code ${code}`);
      if (code !== 0) {
        reject(new Error(`Git clone failed with code ${code}`));
        return;
      }

      console.log('Counting files...');
      // Count files
      const files = fs.readdirSync(repoPath, { recursive: true });
      const totalFiles = files.filter(file => !file.includes('.git')).length;

      console.log(`Total files: ${totalFiles}`);

      resolve({
        repoName,
        totalFiles,
        message: 'Repository cloned successfully',
        output
      });
    });

    git.on('error', (error) => {
      console.error('Git process error:', error);
      reject(new Error(`Failed to start Git process: ${error.message}`));
    });
  });
};

module.exports = stashClone;