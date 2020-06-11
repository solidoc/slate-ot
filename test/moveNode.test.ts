import { transMoveNode } from '../src/transMoveNode';
import { MoveNodeOperation, Path } from 'slate';

const makeMoveOp = (path: Path, newPath: Path): MoveNodeOperation => {
  return {
    type: 'move_node',
    path,
    newPath,
  };
};

describe('on move_node', () => {
  test('moving the same node', () => {
    const op1 = makeMoveOp([1], [2]);
    const op2 = makeMoveOp([1], [0]);

    const op12 = transMoveNode(op1, op2, 'left');
    const op21 = transMoveNode(op2, op1, 'right');

    expect(op12).toEqual([makeMoveOp([0], [1]), op1]);
    expect(op21).toEqual([]);
  });

  test('ops making a circle', () => {
    const op1 = makeMoveOp([1], [0, 0]);
    const op2 = makeMoveOp([0], [1, 0]);

    const op12 = transMoveNode(op1, op2, 'left');
    const op21 = transMoveNode(op2, op1, 'right');

    expect(op12).toEqual([makeMoveOp([0, 0], [0]), op1]);
    expect(op21).toEqual([]);
  });

  test('moving within the same level', () => {
    const op1 = makeMoveOp([1], [4]);
    const op2 = makeMoveOp([2], [0]);

    const op12 = transMoveNode(op1, op2, 'left');
    const op21 = transMoveNode(op2, op1, 'right');

    expect(op12).toEqual([makeMoveOp([2], [4])]);
    expect(op21).toEqual([makeMoveOp([1], [0])]);
  });

  test('moving within a big node', () => {
    const op1 = makeMoveOp([0, 0], [0, 1]);
    const op2 = makeMoveOp([0], [1]);

    const op12 = transMoveNode(op1, op2, 'left');
    const op21 = transMoveNode(op2, op1, 'right');

    expect(op12).toEqual([makeMoveOp([1, 0], [1, 1])]);
    expect(op21).toEqual([op2]);
  });
});
