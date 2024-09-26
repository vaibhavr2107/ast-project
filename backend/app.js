const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const loginRoute = require('./routes/login');
const stashRoute = require('./routes/stash');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS middleware
app.use(cors());

// Middleware to parse JSON body
app.use(express.json());

// HTTP request logger middleware
app.use(morgan('dev'));

// Custom response logger middleware
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    console.log(`Response Code: ${res.statusCode}`);
    console.log('Response Body:', body);
    originalJson.call(this, body);
  };
  next();
});

// Use login route
app.use('/login', loginRoute);

// Use stash route
app.use('/stash', stashRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});