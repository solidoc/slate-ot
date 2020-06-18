import { transInsertText } from './transInsertText';
import { transRemoveText } from './transRemoveText';
import { transInsertNode } from './transInsertNode';
import { transRemoveNode } from './transRemoveNode';
import { transSplitNode } from './transSplitNode';
import { transMergeNode } from './transMergeNode';
import { transMoveNode } from './transMoveNode';
import { transSetNode } from './transSetNode';
import { Operation, Path, NodeOperation, TextOperation } from 'slate';

export const OT = {
  transInsertText,
  transRemoveText,
  transInsertNode,
  transRemoveNode,
  transSplitNode,
  transMergeNode,
  transMoveNode,
  transSetNode,
};

// TODO: use type generics
export const pathTransform = (
  leftOp: NodeOperation | TextOperation,
  rightOp: Operation
): (NodeOperation | TextOperation)[] => {
  let path = Path.transform(leftOp.path, rightOp);

  return path
    ? [
        {
          ...leftOp,
          path,
        },
      ]
    : [];
};
