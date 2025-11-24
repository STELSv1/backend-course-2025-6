const express = require('express');
const { program } = require('commander');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();

program
  .requiredOption('-h, --host <host>', 'Server address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <path>', 'Cache directory path');

program.parse(process.argv);
const options = program.opts();

if (!fs.existsSync(options.cache)) {
  fs.mkdirSync(options.cache, { recursive: true });
  console.log(`Created cache directory: ${options.cache}`);
}

const server = http.createServer(app);
server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
  console.log(`Cache directory: ${options.cache}`);
});