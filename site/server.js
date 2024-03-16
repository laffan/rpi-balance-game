const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const port = 3000;

app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcastMessage(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    // Broadcast the message to all connected clients
    broadcastMessage(message);
  });
});

server.listen(port, function() {
  console.log(`Server is listening on http://localhost:${port}`);
});
