import { xTransformMxN } from '../src/SlateType';
import { initialDoc, makeOp, applyOp } from './utils';
import * as _ from 'lodash';

describe('left side to removeText, right side to:', () => {
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
    test('before removal', () => {
      op1 = makeOp.removeText([0, 0], 1, 'B');
      op2 = makeOp.insertText([0, 0], 0, 'and');
    });

    test('at the beginning of removal', () => {
      op1 = makeOp.removeText([0, 0], 1, 'B');
      op2 = makeOp.insertText([0, 0], 1, 'and');
    });

    test('in the middle of removal', () => {
      op1 = makeOp.removeText([0, 0], 0, 'AB');
      op2 = makeOp.insertText([0, 0], 1, 'and');
    });

    test('at the end of removal', () => {
      op1 = makeOp.removeText([0, 0], 0, 'A');
      op2 = makeOp.insertText([0, 0], 1, 'and');
    });

    test('after removal', () => {
      op1 = makeOp.removeText([0, 0], 0, 'A');
      op2 = makeOp.insertText([0, 0], 2, 'and');
    });

    test('at some other path', () => {
      op1 = makeOp.removeText([0, 0], 0, 'A');
      op2 = makeOp.insertText([1, 0], 2, 'and');
    });
  });

  describe('removeText', () => {
    test('before left removal', () => {
      op1 = makeOp.removeText([2, 2], 1, 'S');
      op2 = makeOp.removeText([2, 2], 0, 'R');
    });

    test('after left removal', () => {
      op1 = makeOp.removeText([2, 2], 1, 'S');
      op2 = makeOp.removeText([2, 2], 2, 'T');
    });

    test('with partial overlap', () => {
      op1 = makeOp.removeText([2, 2], 1, 'ST');
      op2 = makeOp.removeText([2, 2], 0, 'RS');
    });

    test('completely covers let removal', () => {
      op1 = makeOp.removeText([2, 2], 1, 'S');
      op2 = makeOp.removeText([2, 2], 0, 'RST');
    });

    test('at some other path', () => {
      op1 = makeOp.removeText([2, 2], 1, 'ST');
      op2 = makeOp.removeText([2, 1], 1, 'PQ');
    });
  });

  describe('insertNode', () => {
    // trivial
  });

  describe('removeNode', () => {
    // trivial
  });

  describe('splitNode', () => {
    test('at remTextOp.path and removal is before position', () => {
      op2 = makeOp.removeText([0, 1], 0, 'C');
      op1 = makeOp.splitNode([0, 1], 1);
    });

    test('at remTextOp.path and removal is after position', () => {
      op2 = makeOp.removeText([0, 1], 1, 'D');
      op1 = makeOp.splitNode([0, 1], 1);
    });

    test('at remTextOp.path and removal is across position', () => {
      op2 = makeOp.removeText([0, 1], 0, 'CD');
      op1 = makeOp.splitNode([0, 1], 1);
    });
  });

  describe('mergeNode', () => {
    test('at remTextOp.path', () => {
      op2 = makeOp.removeText([0, 1], 1, 'D');
      op1 = makeOp.mergeNode([0, 1], 2);
    });

    test('at remTextOp.path.next', () => {
      op2 = makeOp.removeText([0, 1], 1, 'D');
      op1 = makeOp.mergeNode([0, 2], 2);
    });
  });

  describe('moveNode', () => {
    // trivial
  });

  describe('setNode', () => {
    // trivial
  });
});
