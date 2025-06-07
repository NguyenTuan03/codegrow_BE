const express = require('express');
require('dotenv').config();
const loaders = require('./loaders');

const app = express();

const initApp = async (server) => {
  await loaders(app, server);
};

module.exports = { app, initApp };
