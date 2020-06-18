import { xTransformMxN } from '../src/SlateType';
import { initialDoc, makeOp, applyOp } from './utils';
import * as _ from 'lodash';

describe('left side to splitNode, right side to:', () => {
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
    test('at splitOp.path w. offset < position', () => {
      op1 = makeOp.splitNode([0, 1], 1);
      op2 = makeOp.insertText([0, 1], 0, 'ee');
    });

    test('at splitOp.path w. offset = position', () => {
      op1 = makeOp.splitNode([0, 1], 1);
      op2 = makeOp.insertText([0, 1], 1, 'ee');
    });

    test('at splitOp.path w. offset > position', () => {
      op1 = makeOp.splitNode([0, 1], 1);
      op2 = makeOp.insertText([0, 1], 2, 'ee');
    });

    test('at splitOp.path.child', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.insertText([0, 1], 1, 'ee');
    });
  });

  describe('removeText', () => {
    test('at splitOp.path w. offset < position', () => {
      op1 = makeOp.splitNode([0, 1], 1);
      op2 = makeOp.removeText([0, 1], 0, 'C');
    });

    test('at splitOp.path w. offset = position', () => {
      op1 = makeOp.splitNode([0, 1], 1);
      op2 = makeOp.removeText([0, 1], 1, 'D');
    });

    test('at splitOp.path w. offset > position', () => {
      op1 = makeOp.splitNode([0, 1], 1);
      op2 = makeOp.removeText([0, 1], 2, '');
    });

    test('at splitOp.path.child', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.removeText([0, 1], 1, 'D');
    });
  });

  describe('insertNode', () => {
    test('at splitOp.path.child w. offset < position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.insertNode([0, 0], { text: 'X' });
    });

    test('at splitOp.path.child w. offset = position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.insertNode([0, 1], { text: 'X' });
    });

    test('at splitOp.path.child w. offset > position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.insertNode([0, 2], { text: 'X' });
    });
  });

  describe('removeNode', () => {
    test('at splitOp.path.child w. offset < position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.removeNode([0, 0], { text: 'AB' });
    });

    test('at splitOp.path.child w. offset = position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.removeNode([0, 1], { text: 'CD' });
    });

    test('at splitOp.path.child w. offset > position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.removeNode([0, 2], { text: 'EF' });
    });

    test('at some other place', () => {
      op1 = makeOp.splitNode([0, 1], 1);
      op2 = makeOp.removeNode([1], doc2.children[1]);
    });
  });

  describe('splitNode', () => {
    test('at left.path w. a smaller position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.splitNode([0], 0);
    });

    test('at left.path w. the same position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.splitNode([0], 1);
    });

    test('at left.path w. a larger position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.splitNode([0], 2);
    });

    test('at left.path.child w. offset < position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.splitNode([0, 0], 1);
    });

    test('at left.path.child w. offset = position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.splitNode([0, 1], 1);
    });

    test('at left.path.child w. offset > position', () => {
      op1 = makeOp.splitNode([0], 1);
      op2 = makeOp.splitNode([0, 2], 1);
    });
  });

  describe('mergeNode', () => {
    test('at splitOp.path', () => {
      op1 = makeOp.splitNode([1], 1);
      op2 = makeOp.mergeNode([1], 3);
    });

    test('at splitOp.path.child w. offset < position', () => {
      op1 = makeOp.splitNode([1], 2);
      op2 = makeOp.mergeNode([1, 1], 2);
    });

    test('at splitOp.path.child w. offset = position', () => {
      op1 = makeOp.splitNode([1], 1);
      op2 = makeOp.mergeNode([1, 1], 2);
    });

    test('at splitOp.path.child w. offset > position', () => {
      op1 = makeOp.splitNode([1], 1);
      op2 = makeOp.mergeNode([1, 2], 2);
    });

    test('at splitOp.path.parent', () => {
      op1 = makeOp.splitNode([1, 1], 1);
      op2 = makeOp.mergeNode([1], 3);
    });
  });

  describe('moveNode', () => {
    test('from and to the same place', () => {
      op1 = makeOp.splitNode([1, 1], 1);
      op2 = makeOp.moveNode([1], [1]);
    });

    test('from splitOp.path.child w. offset < position', () => {
      op1 = makeOp.splitNode([1], 1);
      op2 = makeOp.moveNode([1, 0], [0, 0]);
    });

    test('from splitOp.path.child w. offset = position', () => {
      op1 = makeOp.splitNode([1], 1);
      op2 = makeOp.moveNode([1, 1], [0, 0]);
    });

    test('from splitOp.path.child w. offset > position', () => {
      op1 = makeOp.splitNode([1], 1);
      op2 = makeOp.moveNode([1, 2], [0, 0]);
    });

    test('to splitOp.path.child w. offset < position', () => {
      op1 = makeOp.splitNode([1], 1);
      op2 = makeOp.moveNode([0, 0], [1, 0]);
    });

    test('to splitOp.path.child w. offset = position', () => {
      op1 = makeOp.splitNode([1], 1);
      op2 = makeOp.moveNode([0, 0], [1, 1]);
    });

    test('to splitOp.path.child w. offset > position', () => {
      op1 = makeOp.splitNode([1], 1);
      op2 = makeOp.moveNode([0, 0], [1, 2]);
    });
  });

  describe('setNode', () => {
    test('to splitOp.path.child w. offset > position', () => {
      op1 = makeOp.splitNode([1], 1);
      op2 = makeOp.setNode([1, 0], { bold: true });
    });
  });
});
