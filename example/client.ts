import { slateType } from '../src/SlateType';
import { createEditor, Editor, Operation, Transforms } from 'slate';
import { v4 as uuid } from 'uuid';
// const _ = require('lodash');

const sharedb = require('sharedb/lib/client');
sharedb.types.register(slateType);

// Open WebSocket connection to ShareDB server
var WebSocket = require('ws');
var socket = new WebSocket('ws://' + 'localhost:9527');
var connection = new sharedb.Connection(socket);

const doc: any = connection.get('examples', 'richtext');

const e: Editor = createEditor();
const clientId = uuid();
console.log('clientId = ' + clientId);

doc.subscribe((err: any) => {
  if (err) {
    throw err;
  }

  e.children = doc.data.children;
  console.log(JSON.stringify(e.children));

  doc.on('op', (op: Operation | Operation[], options: any) => {
    if (options.source === clientId) return;

    const ops = Array.isArray(op) ? op : [op];

    for (const o of ops) {
      console.log(op);
      Transforms.transform(e, o);
    }
  });

  e.apply({
    type: 'insert_node',
    path: [0],
    node: { children: [{ text: 'a quick brown fox' }] },
  });
});

e.onChange = () => {
  e.operations.forEach((o: Operation) => {
    if (o.type !== 'set_selection') {
      doc.submitOp(o, { source: clientId });
    }
  });
};
