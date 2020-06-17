import { MoveNodeOperation, Path } from 'slate';
import { slateType, xTransformMxN } from '../src/SlateType';
import * as _ from 'lodash';

const makeMoveOp = (path: Path, newPath: Path): MoveNodeOperation => {
  return {
    type: 'move_node',
    path,
    newPath,
  };
};

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
    op1 = makeMoveOp([1], [2]);
    op2 = makeMoveOp([1], [0]);
  });

  test('ops making a circle', () => {
    op1 = makeMoveOp([1], [0, 0]);
    op2 = makeMoveOp([0], [1, 0]);
  });

  test('moving within the same level', () => {
    op1 = makeMoveOp([1], [4]);
    op2 = makeMoveOp([2], [0]);
  });

  test('moving within a big node', () => {
    op1 = makeMoveOp([0, 0], [0, 1]);
    op2 = makeMoveOp([0], [1]);
  });
});
