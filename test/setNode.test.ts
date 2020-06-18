import { xTransformMxN } from '../src/SlateType';
import { initialDoc, makeOp, applyOp } from './utils';
import * as _ from 'lodash';

describe('left side to setNode, right side to:', () => {
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
    // trivial but for coverage
    test('at some other place', () => {
      op1 = makeOp.setNode([1, 1], { italic: true });
      op2 = makeOp.insertText([1, 2], 1, 'but');
    });
  });

  describe('removeText', () => {
    // trivial
  });

  describe('insertNode', () => {
    test('at setOp.path.parent', () => {
      op1 = makeOp.setNode([1, 0], { italic: true });
      op2 = makeOp.removeNode([1], doc2.children[1]);
    });
  });

  describe('removeNode', () => {
    // trivial
  });

  describe('splitNode', () => {
    test('at setOp.path', () => {
      op1 = makeOp.setNode([1, 0], { italic: true });
      op2 = makeOp.splitNode([1, 0], 1);
    });
  });

  describe('mergeNode', () => {
    test('at setOp.path', () => {
      op1 = makeOp.setNode([1, 1], { italic: true });
      op2 = makeOp.mergeNode([1, 1], 2);
    });
  });

  describe('moveNode', () => {
    // trivial
  });

  describe('setNode', () => {
    test('at left.path', () => {
      op1 = makeOp.setNode([1, 1], { italic: true });
      op2 = makeOp.setNode([1, 1], { italic: false });
    });

    test('at some other place', () => {
      op1 = makeOp.setNode([1, 1], { italic: true });
      op2 = makeOp.setNode([1, 2], { italic: false });
    });
  });
});
