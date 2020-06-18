import { xTransformMxN } from '../src/SlateType';
import { initialDoc, makeOp, applyOp } from './utils';
import * as _ from 'lodash';

describe('left side to mergeNode, right side to:', () => {
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
    test('at mergeOp.path', () => {
      op1 = makeOp.mergeNode([0, 1], 2);
      op2 = makeOp.insertText([0, 1], 1, 'ee');
    });

    test('at mergeOp.path.prev', () => {
      op1 = makeOp.mergeNode([0, 1], 2);
      op2 = makeOp.insertText([0, 0], 1, 'ee');
    });
  });

  describe('removeText', () => {
    test('at mergeOp.path', () => {
      op1 = makeOp.mergeNode([0, 1], 2);
      op2 = makeOp.removeText([0, 1], 1, 'D');
    });

    test('at mergeOp.path.prev', () => {
      op1 = makeOp.mergeNode([0, 1], 2);
      op2 = makeOp.removeText([0, 0], 1, 'B');
    });
  });

  describe('insertNode', () => {
    test('at mergeOp.path', () => {
      op1 = makeOp.mergeNode([0, 1], 2);
      op2 = makeOp.insertNode([0, 1], { text: 'X' });
    });

    test('at mergeOp.path.child', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.insertNode([1, 1], { text: 'X' });
    });

    test('at mergeOp.path.prev.child', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.insertNode([0, 1], { text: 'X' });
    });
  });

  describe('removeNode', () => {
    test('at mergeOp.path', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.removeNode([1], doc2.children[1]);
    });

    test('at mergeOp.path.prev', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.removeNode([0], doc2.children[0]);
    });

    test('at mergeOp.path.child', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.removeNode([1, 1], doc2.children[1].children[1]);
    });

    test('at mergeOp.path.prev.child', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.removeNode([0, 1], doc2.children[0].children[1]);
    });
  });

  describe('splitNode', () => {
    test('at mergeOp.path', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.splitNode([1], 1);
    });

    test('at mergeOp.path.prev', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.splitNode([0], 1);
    });

    test('at mergeOp.path.prev.child', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.splitNode([0, 1], 1);
    });

    test('at mergeOp.path.parent', () => {
      op1 = makeOp.mergeNode([1, 1], 2);
      op2 = makeOp.splitNode([1], 1);
    });
  });

  describe('mergeNode', () => {
    test('at left.path', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.mergeNode([1], 3);
    });

    test('at left.path.child', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.mergeNode([1, 1], 2);
    });

    test('at left.path.prev', () => {
      op1 = makeOp.mergeNode([2], 3);
      op2 = makeOp.mergeNode([1], 3);
    });

    test('at left.path.prev.child', () => {
      op1 = makeOp.mergeNode([2], 3);
      op2 = makeOp.mergeNode([1, 1], 2);
    });
  });

  describe('moveNode', () => {
    test('from and to the same place', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.moveNode([1], [1]);
    });

    test('from mergeOp.path', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.moveNode([1], [2]);
    });

    test('from mergeOp.path.prev', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.moveNode([0], [2]);
    });

    test('from mergeOp.path.prev.child', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.moveNode([0, 1], [2, 0]);
    });

    test('to mergeOp.path', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.moveNode([2], [1]);
    });

    test('to mergeOp.path.prev.child', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.moveNode([2, 1], [0, 0]);
    });

    test('from and to mergeOp.path.prev.child', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.moveNode([0, 1], [0, 2]);
    });
  });

  describe('setNode', () => {
    test('', () => {
      op1 = makeOp.mergeNode([1], 3);
      op2 = makeOp.setNode([1, 0], { bold: true });
    });
  });
});
