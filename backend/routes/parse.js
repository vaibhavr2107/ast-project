const express = require('express');
const router = express.Router();
const path = require('path');
const stashClone = require('../components/stashClone');
const parseJavaProject = require('../components/javaParser');

router.post('/', async (req, res) => {
  const { cloneUrl, username, password } = req.body;

  if (!cloneUrl || !username || !password) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const cloneResult = await stashClone(cloneUrl, username, password);
    const repoPath = path.join(__dirname, '..', 'temp_repos', cloneResult.repoName);
    
    const parseResult = await parseJavaProject(repoPath);
    
    res.json({
      ...cloneResult,
      parseResult
    });
  } catch (error) {
    console.error('Error in parse:', error.message);
    res.status(500).json({ error: 'An error occurred while processing the repository' });
  }
});

module.exports = router;