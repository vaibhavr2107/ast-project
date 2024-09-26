const dotenv = require('dotenv');
dotenv.config();

const auth = (user, pass) => {
  const validUser = process.env.VALID_USER;
  const validPass = process.env.VALID_PASS;
  return user === validUser && pass === validPass;
};

module.exports = auth;