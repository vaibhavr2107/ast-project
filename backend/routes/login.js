const express = require('express');
const router = express.Router();
const auth = require('../components/auth');

router.post('/', (req, res) => {
  const { name, password } = req.body;

  if (auth(name, password)) {
    res.status(200).json({ message: 'Successful login' });
  } else {
    res.status(401).json({ message: 'Authentication failed' });
  }
});

module.exports = router;