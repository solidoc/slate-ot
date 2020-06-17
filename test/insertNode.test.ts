import { xTransformMxN } from '../src/SlateType';
import { makeOp, applyOp } from './utils';
import { Node } from 'slate';
import * as _ from 'lodash';

const doc: Node = {
  children: [
    {
      type: 'Paragraph',
      children: [{ text: 'A' }, { text: 'B' }],
    },
    {
      type: 'NumberedList',
      children: [{ text: 'C' }, { text: 'D' }],
    },
    {
      type: 'BulletedList',
      children: [{ text: 'E' }, { text: 'F' }],
    },
  ],
};

describe('left side to insertNode, right side to:', () => {
  let doc1, doc2;
  let op1, op2;

  beforeEach(() => {
    doc1 = _.cloneDeep(doc);
    doc2 = _.cloneDeep(doc);
  });

  afterEach(() => {
    const [op12, op21] = xTransformMxN([op1], [op2], 'left');

    doc1 = applyOp(applyOp(doc1, op1), op21);
    doc2 = applyOp(applyOp(doc2, op2), op12);

    expect(doc1).toStrictEqual(doc2);
  });

  describe('insertText', () => {
    test('', () => {
      op1 = makeOp.insertNode([0], doc.children[1]);
      op2 = makeOp.insertText([0, 1], 1, 'ee');
    });
  });

  describe('removeText', () => {
    test('', () => {
      op1 = makeOp.insertNode([0], doc.children[1]);
      op2 = makeOp.removeText([0, 1], 0, 'B');
    });
  });

  describe('insertNode', () => {
    test('at same place as left', () => {
      op1 = makeOp.insertNode([0], doc.children[1]);
      op2 = makeOp.insertNode([0], doc.children[0]);
    });
  });

  describe('removeNode', () => {
    test('at insertOp.path', () => {
      op1 = makeOp.insertNode([1], doc.children[1]);
      op2 = makeOp.removeNode([1], doc.children[1]);
    });

    test('at insertOp.path.parent', () => {
      op1 = makeOp.insertNode([1, 2], { text: 'Z' });
      op2 = makeOp.removeNode([1], doc.children[1]);
    });
  });

  describe('splitNode', () => {
    test('at insertOp.path', () => {
      op1 = makeOp.insertNode([1], doc.children[1]);
      op2 = makeOp.splitNode([1], 1);
    });

    test('at insertOp.path.parent', () => {
      op1 = makeOp.insertNode([1, 1], { text: 'Y' });
      op2 = makeOp.splitNode([1], 1);
    });
  });

  describe('mergeNode', () => {
    test('at insertOp.path of branches', () => {
      op1 = makeOp.insertNode([1], doc.children[1]);
      op2 = makeOp.mergeNode([1], 2);
    });

    test('at insertOp.path of leaves', () => {
      op1 = makeOp.insertNode([1, 1], { text: 'Y' });
      op2 = makeOp.mergeNode([1, 1], 1);
    });

    test('at insertOp.path.parent', () => {
      op1 = makeOp.insertNode([1, 1], { text: 'Y' });
      op2 = makeOp.mergeNode([1], 2);
    });
  });

  describe('moveNode', () => {
    test('from and to the same path', () => {
      op1 = makeOp.insertNode([1], doc.children[1]);
      op2 = makeOp.moveNode([1], [1]);
    });

    test('from insertOp.path', () => {
      op1 = makeOp.insertNode([1], doc.children[1]);
      op2 = makeOp.moveNode([1], [2]);
    });

    test('from insertOp.path.parent', () => {
      op1 = makeOp.insertNode([1, 1], { text: 'X' });
      op2 = makeOp.moveNode([1], [2]);
    });

    test('to insertOp.path', () => {
      op1 = makeOp.insertNode([1], doc.children[1]);
      op2 = makeOp.moveNode([0], [1]);
    });

    test('to insertOp.path.parent', () => {
      op1 = makeOp.insertNode([1, 1], { text: 'X' });
      op2 = makeOp.moveNode([2], [1]);
    });
  });

  describe('setNode', () => {
    test('', () => {
      op1 = makeOp.insertNode([0], doc.children[1]);
      op2 = makeOp.setNode([0, 0], { bold: true });
    });
  });
});
