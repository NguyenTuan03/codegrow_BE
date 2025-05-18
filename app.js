const express = require('express');
require('dotenv').config();
const loaders = require('./loaders');

const app = express();

const initApp = async () => {
  await loaders(app);
};

module.exports = { app, initApp };
