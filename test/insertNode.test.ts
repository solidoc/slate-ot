import { xTransformMxN } from '../src/SlateType';
import { initialDoc, makeOp, applyOp } from './utils';
import * as _ from 'lodash';

const branch = { children: [{ text: 'X' }] };

const leaf = { text: 'X' };

describe('left side to insertNode, right side to:', () => {
  let doc1, doc2;
  let op1, op2;

  beforeEach(() => {
    doc1 = _.cloneDeep(initialDoc);
    doc2 = _.cloneDeep(initialDoc);
  });

  afterEach(() => {
    const [op12, op21] = xTransformMxN([op1], [op2], 'left');

    doc1 = applyOp(applyOp(doc1, op1), op21);
    doc2 = applyOp(applyOp(doc2, op2), op12);

    expect(doc1).toStrictEqual(doc2);
  });

  describe('insertText', () => {
    test('', () => {
      op1 = makeOp.insertNode([0], branch);
      op2 = makeOp.insertText([0, 1], 1, 'ee');
    });
  });

  describe('removeText', () => {
    test('', () => {
      op1 = makeOp.insertNode([0], branch);
      op2 = makeOp.removeText([0, 1], 0, 'C');
    });
  });

  describe('insertNode', () => {
    test('at same place as left', () => {
      op1 = makeOp.insertNode([0], branch);
      op2 = makeOp.insertNode([0], leaf);
    });
  });

  describe('removeNode', () => {
    test('at insertOp.path', () => {
      op1 = makeOp.insertNode([1], branch);
      op2 = makeOp.removeNode([1], doc2.children[1]);
    });

    test('at insertOp.path.parent', () => {
      op1 = makeOp.insertNode([1, 2], leaf);
      op2 = makeOp.removeNode([1], doc2.children[1]);
    });
  });

  describe('splitNode', () => {
    test('at insertOp.path', () => {
      op1 = makeOp.insertNode([1], branch);
      op2 = makeOp.splitNode([1], 1);
    });

    test('at insertOp.path.parent', () => {
      op1 = makeOp.insertNode([1, 1], leaf);
      op2 = makeOp.splitNode([1], 1);
    });
  });

  describe('mergeNode', () => {
    test('at insertOp.path of branches', () => {
      op1 = makeOp.insertNode([1], branch);
      op2 = makeOp.mergeNode([1], 3);
    });

    test('at insertOp.path of leaves', () => {
      op1 = makeOp.insertNode([1, 1], leaf);
      op2 = makeOp.mergeNode([1, 1], 2);
    });

    test('at insertOp.path.parent', () => {
      op1 = makeOp.insertNode([1, 1], leaf);
      op2 = makeOp.mergeNode([1], 3);
    });
  });

  describe('moveNode', () => {
    test('from and to the same path', () => {
      op1 = makeOp.insertNode([1], branch);
      op2 = makeOp.moveNode([1], [1]);
    });

    test('from insertOp.path', () => {
      op1 = makeOp.insertNode([1], branch);
      op2 = makeOp.moveNode([1], [2]);
    });

    test('from insertOp.path.parent', () => {
      op1 = makeOp.insertNode([1, 1], leaf);
      op2 = makeOp.moveNode([1], [2]);
    });

    test('to insertOp.path', () => {
      op1 = makeOp.insertNode([1], branch);
      op2 = makeOp.moveNode([0], [1]);
    });

    test('to insertOp.path.parent', () => {
      op1 = makeOp.insertNode([1, 1], leaf);
      op2 = makeOp.moveNode([2], [1]);
    });
  });

  describe('setNode', () => {
    test('', () => {
      op1 = makeOp.insertNode([0], branch);
      op2 = makeOp.setNode([0, 0], { bold: true });
    });
  });
});
