#!/usr/bin/env node

require('dotenv').config();
const express = require('express');
const http = require('http');
const loaders = require('./loaders');

const app = express();
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample route
app.get('/', (req, res) => {
  res.json({ message: '🚀 Hello from CodeGrow API!' });
});

// Create server
const server = http.createServer(app);

(async () => {
  try {
    // Load things like DB, socket, etc.
    console.log('🔄 Running loaders...');
    await loaders(app, server);
    console.log('✅ Loaders completed.');

    // Start server
    server.listen(port, () => {
      console.log(`✅ Server is listening on port ${port}`);
    });

    server.on('error', onError);
  } catch (err) {
    console.error('❌ Failed during app start:', err);
    process.exit(1);
  }
})();

// Error handling
process.on('unhandledRejection', (reason) => {
  console.error('🛑 Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('🛑 Uncaught Exception:', err);
});

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
}
