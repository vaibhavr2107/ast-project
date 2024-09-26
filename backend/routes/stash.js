const express = require('express');
const router = express.Router();
const stashClone = require('../components/stashClone');

router.post('/', async (req, res) => {
  const { cloneUrl, username, password } = req.body;

  if (!cloneUrl || !username || !password) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const result = await stashClone(cloneUrl, username, password);
    res.json(result);
  } catch (error) {
    console.error('Error in stash clone:', error.message);
    if (error.message.includes('Git is not installed')) {
      res.status(500).json({ error: 'Server configuration error: Git is not properly installed or configured' });
    } else if (error.message.includes('Authentication failed')) {
      res.status(401).json({ error: 'Authentication failed. Please check your credentials.' });
    } else {
      res.status(500).json({ error: 'An error occurred while cloning the repository' });
    }
  }
});

module.exports = router;