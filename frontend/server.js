// Custom Next.js server for cPanel / Phusion Passenger.
// Passenger launches this file and intercepts .listen() to wire up the port.
const { createServer } = require('http');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(process.env.PORT || 3000);
});
