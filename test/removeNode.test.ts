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

describe('left side to removeNode, right side to:', () => {
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
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.insertText([0, 1], 1, 'ee');
    });
  });

  describe('removeText', () => {
    test('', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.removeText([0, 0], 0, 'A');
    });
  });

  describe('insertNode', () => {
    test('at removeOp.path', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.insertNode([0], doc.children[1]);
    });

    test('at child of removeOp.path', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.insertNode([0, 1], { text: 'X' });
    });
  });

  describe('removeNode', () => {
    test('at same path as left', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.removeNode([0], doc.children[0]);
    });

    test('at parent of left.path', () => {
      op1 = makeOp.removeNode([0, 0], { text: 'A' });
      op2 = makeOp.removeNode([0], doc.children[0]);
    });

    test('at child of left.path', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.removeNode([0, 0], { text: 'A' });
    });
  });

  describe('splitNode', () => {
    test('at removeOp.path', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.splitNode([0], 1);
    });

    test('at removeOp.path.parent', () => {
      op1 = makeOp.removeNode([0, 0], { text: 'A' });
      op2 = makeOp.splitNode([0], 1);
    });

    test('at removeOp.path.children', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.splitNode([0, 0], 1);
    });
  });

  describe('mergeNode', () => {
    test('at removeOp.path', () => {
      op1 = makeOp.removeNode([1], doc.children[1]);
      op2 = makeOp.mergeNode([1], 2);
    });

    test('at removeOp.path.next', () => {
      op1 = makeOp.removeNode([1], doc.children[1]);
      op2 = makeOp.mergeNode([2], 2);
    });

    test('at removeOp.path.parent', () => {
      op1 = makeOp.removeNode([1, 0], { text: 'C' });
      op2 = makeOp.mergeNode([1], 2);
    });

    test('at removeOp.path.parent.next', () => {
      op1 = makeOp.removeNode([1, 0], { text: 'C' });
      op2 = makeOp.mergeNode([2], 2);
    });

    test('at child of removeOp.path', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.mergeNode([0, 1], 1);
    });
  });

  describe('moveNode', () => {
    test('from removeOp.path', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.moveNode([0], [1]);
    });

    test('to removeOp.path', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.moveNode([1], [0]);
    });

    test('from and to the same place', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.moveNode([0], [0]);
    });
  });

  describe('setNode', () => {
    test('', () => {
      op1 = makeOp.removeNode([0], doc.children[0]);
      op2 = makeOp.setNode([0, 0], { bold: true });
    });
  });
});
