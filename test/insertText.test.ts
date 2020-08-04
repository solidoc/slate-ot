import { xTransformMxN } from '../src/SlateType';
import { initialDoc, makeOp, applyOp } from './utils';
import * as _ from 'lodash';

describe('left side to insertText, right side to:', () => {
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
    test('before left insertion', () => {
      op1 = makeOp.insertText([0, 0], 1, 'tt');
      op2 = makeOp.insertText([0, 0], 0, 'ee');
    });

    test('same place as left insertion', () => {
      op1 = makeOp.insertText([0, 0], 1, 'tt');
      op2 = makeOp.insertText([0, 0], 1, 'ee');
    });

    test('at some other path', () => {
      op1 = makeOp.insertText([0, 0], 1, 'tt');
      op2 = makeOp.insertText([0, 1], 1, 'ee');
    });
  });

  describe('removeText', () => {
    // covered by removeText + insertText
  });

  describe('insertNode', () => {
    // trivial
  });

  describe('removeNode', () => {
    // trivial
  });

  describe('splitNode', () => {
    // covered by splitNode + insertText
  });

  describe('mergeNode', () => {
    // covered by mergeNode + insertText
  });

  describe('moveNode', () => {
    // trivial
  });

  describe('setNode', () => {
    // trivial
  });
});
