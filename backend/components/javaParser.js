const { spawn } = require('child_process');
const path = require('path');

function parseJavaProject(repoPath) {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, 'java_ast_parser.py');
    const pythonProcess = spawn('python', [pythonScriptPath, repoPath]);

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}\nError: ${errorData}`));
      } else {
        try {
          const parsedData = JSON.parse(outputData);
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Failed to parse Python script output: ${error.message}`));
        }
      }
    });
  });
}

module.exports = parseJavaProject;  // Export the function directly