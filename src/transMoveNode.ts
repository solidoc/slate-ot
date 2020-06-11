import {
  MoveNodeOperation,
  InsertNodeOperation,
  RemoveNodeOperation,
  Operation,
  Path,
} from 'slate';

import { xTransformMxN } from '../src/SlateType';

export const transMoveNode = (
  leftOp: MoveNodeOperation,
  rightOp: Operation,
  side: 'left' | 'right'
): (MoveNodeOperation | InsertNodeOperation | RemoveNodeOperation)[] => {
  if (Path.equals(leftOp.path, leftOp.newPath)) {
    return [];
  }

  let [lr, li] = decomposeMove(leftOp);

  switch (rightOp.type) {
    // case 'insert_text': {
    // }

    // case 'remove_text': {
    // }

    case 'insert_node': {
      let [l] = xTransformMxN([lr, li], [rightOp], side);

      return [
        composeMove(<RemoveNodeOperation>l[0], <InsertNodeOperation>l[1]),
      ];
    }

    case 'remove_node': {
      let [l] = xTransformMxN([lr, li], [rightOp], side);

      // normal case
      if (l.length === 2) {
        return [
          {
            ...leftOp,
            ...composeMove(
              <RemoveNodeOperation>l[0],
              <InsertNodeOperation>l[1]
            ),
          },
        ];
      }

      // leftOp moves a branch into the removed zone
      else if (l.length === 1 && l[0].type === 'remove_node') {
        return [l[0]];
      }

      // leftOp moves a branch out of the removed zone
      // we choose NOT to keep it
      else if (l.length === 1 && l[0].type === 'insert_node') {
        return [];
      }

      // l.length === 0, move within the removed zone
      else {
        return [];
      }
    }

    // case 'split_node': {
    // }

    // case 'merge_node': {
    // }

    case 'move_node': {
      // the other side didn't do anything
      if (Path.equals(rightOp.path, rightOp.newPath)) {
        return [leftOp];
      }

      let [rr, ri] = decomposeMove(rightOp);

      let [l, r] = xTransformMxN([lr, li], [rr, ri], side);

      // normal case
      if (l.length === 2) {
        return [
          composeMove(<RemoveNodeOperation>l[0], <InsertNodeOperation>l[1]),
        ];
      }

      // handling conflict
      if (r.length === 1) {
        if (l.length !== 1 || l[0].type !== r[0].type) {
          throw new Error('Unexpected xTransform');
        }

        return side === 'left' ? [reverseMove(rr, ri), leftOp] : [];
      }

      // r.length === 2
      if (l.length === 0 || l[0].type === 'insert_node') {
        l[1] = l[0];
        l[0] = {
          type: 'remove_node',
          path: ri.path.concat(lr.path.slice(rr.path.length)),
          node: { text: '' },
        };
      }

      if (l.length === 0 || l[0].type === 'remove_node') {
        l[1] = {
          type: 'insert_node',
          path: ri.path.concat(li.path.slice(rr.path.length)),
          node: { text: '' },
        };
      }

      return [
        composeMove(<RemoveNodeOperation>l[0], <InsertNodeOperation>l[1]),
      ];
    }

    default:
      throw new Error('Unsupported OP');
  }
};

export const decomposeMove = (
  op: MoveNodeOperation
): [RemoveNodeOperation, InsertNodeOperation] => {
  const rem: RemoveNodeOperation = {
    type: 'remove_node',
    path: op.path.slice(),
    node: { text: '' },
  };

  const ins: InsertNodeOperation = {
    type: 'insert_node',
    path: Path.transform(op.path, op)!,
    node: { text: '' },
  };

  return [rem, ins];
};

const composeMove = (
  rem: RemoveNodeOperation,
  ins: InsertNodeOperation
): MoveNodeOperation => {
  let path = rem.path;
  let newPath = Path.transform(ins.path, {
    ...rem,
    type: 'insert_node',
  })!;

  // this is a trick in slate:
  //   normally moving destination is right BEFORE newPath,
  //   however when the condition holds, it becomes right AFTER newPath
  if (Path.isSibling(path, newPath) && Path.endsBefore(path, newPath)) {
    newPath = Path.previous(newPath);
  }

  return {
    type: 'move_node',
    path,
    newPath,
  };
};

const reverseMove = (
  rem: RemoveNodeOperation,
  ins: InsertNodeOperation
): MoveNodeOperation => {
  let path = ins.path;
  let newPath = Path.transform(rem.path, ins)!;

  if (Path.isSibling(path, newPath) && Path.endsBefore(path, newPath)) {
    newPath = Path.previous(newPath);
  }

  return {
    type: 'move_node',
    path,
    newPath,
  };
};
