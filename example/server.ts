import { slateType } from '../src/SlateType';
const ShareDB = require('sharedb');

ShareDB.types.register(slateType);
var backend = new ShareDB();

function createDoc(callback) {
  const connection = backend.connect();
  const doc = connection.get('examples', 'richtext');
  doc.fetch(function (err) {
    if (err) throw err;
    if (doc.type === null) {
      doc.create({ children: [] }, 'slate-ot-type', callback);
      return;
    }
    callback && callback();
  });
}

var http = require('http');
var express = require('express');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');

function startServer() {
  var app = express();
  app.use(express.static('static'));
  var server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({ server: server });
  wss.on('connection', function (ws, _req) {
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });

  console.log('Server Listening at 9527');
  server.listen(9527);
}

createDoc(startServer);
