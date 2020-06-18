import { xTransformMxN } from '../src/SlateType';
import { initialDoc, makeOp, applyOp } from './utils';
import * as _ from 'lodash';
import { Element } from 'slate';

const branch = initialDoc.children[1];

const leaf = (<Element>initialDoc.children[1]).children[0];

describe('left side to removeNode, right side to:', () => {
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
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.insertText([0, 1], 1, 'ee');
    });
  });

  describe('removeText', () => {
    test('', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.removeText([0, 0], 0, 'A');
    });
  });

  describe('insertNode', () => {
    test('at removeOp.path', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.insertNode([1], { text: 'X' });
    });

    test('at child of removeOp.path', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.insertNode([1, 2], { text: 'X' });
    });
  });

  describe('removeNode', () => {
    test('at same path as left', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.removeNode([1], branch);
    });

    test('at parent of left.path', () => {
      op1 = makeOp.removeNode([1, 0], leaf);
      op2 = makeOp.removeNode([1], branch);
    });

    test('at child of left.path', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.removeNode([1, 0], leaf);
    });
  });

  describe('splitNode', () => {
    test('at removeOp.path', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.splitNode([1], 1);
    });

    test('at removeOp.path.parent', () => {
      op1 = makeOp.removeNode([1, 0], leaf);
      op2 = makeOp.splitNode([1], 1);
    });

    test('at removeOp.path.children', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.splitNode([1, 0], 1);
    });
  });

  describe('mergeNode', () => {
    test('at removeOp.path', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.mergeNode([1], 3);
    });

    test('at removeOp.path.next', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.mergeNode([2], 3);
    });

    test('at removeOp.path.parent', () => {
      op1 = makeOp.removeNode([1, 0], leaf);
      op2 = makeOp.mergeNode([1], 3);
    });

    test('at removeOp.path.parent.next', () => {
      op1 = makeOp.removeNode([1, 0], leaf);
      op2 = makeOp.mergeNode([2], 3);
    });

    test('at removeOp.path.child', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.mergeNode([1, 1], 2);
    });
  });

  describe('moveNode', () => {
    test('from removeOp.path', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.moveNode([1], [1]);
    });

    test('to removeOp.path', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.moveNode([0], [1]);
    });

    test('from and to the same place', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.moveNode([1], [1]);
    });
  });

  describe('setNode', () => {
    test('', () => {
      op1 = makeOp.removeNode([1], branch);
      op2 = makeOp.setNode([1, 0], { bold: true });
    });
  });
});
