import { slateType, xTransformMxN } from '../src/SlateType';
import { makeOp } from './makeOp';
import * as _ from 'lodash';

const doc = {
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

describe('move_node + insertText', () => {
  let doc1, doc2;
  let op1, op2;

  beforeEach(() => {
    doc1 = _.cloneDeep(doc);
    doc2 = _.cloneDeep(doc);
  });

  afterEach(() => {
    const [op12, op21] = xTransformMxN([op1], [op2], 'left');

    doc1 = slateType.apply(slateType.apply(doc1, op1), op21);
    doc2 = slateType.apply(slateType.apply(doc2, op2), op12);

    expect(doc1).toStrictEqual(doc2);
  });

  test('', () => {
    op1 = makeOp.moveNode([1], [0]);
    op2 = makeOp.insertText([0, 1], 1, 'ee');
  });
});

describe('move_node + move_node', () => {
  let doc1, doc2;
  let op1, op2;

  beforeEach(() => {
    doc1 = _.cloneDeep(doc);
    doc2 = _.cloneDeep(doc);
  });

  afterEach(() => {
    const [op12, op21] = xTransformMxN([op1], [op2], 'left');

    doc1 = slateType.apply(slateType.apply(doc1, op1), op21);
    doc2 = slateType.apply(slateType.apply(doc2, op2), op12);

    expect(doc1).toStrictEqual(doc2);
  });

  test('both sides moving the same node', () => {
    op1 = makeOp.moveNode([1], [2]);
    op2 = makeOp.moveNode([1], [0]);
  });

  test('ops making a circle', () => {
    op1 = makeOp.moveNode([1], [0, 0]);
    op2 = makeOp.moveNode([0], [1, 0]);
  });

  test('moving within the same level', () => {
    op1 = makeOp.moveNode([1], [4]);
    op2 = makeOp.moveNode([2], [0]);
  });

  test('moving within a big node', () => {
    op1 = makeOp.moveNode([0, 0], [0, 1]);
    op2 = makeOp.moveNode([0], [1]);
  });
});
