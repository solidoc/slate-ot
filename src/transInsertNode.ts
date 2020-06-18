import {
  InsertNodeOperation,
  SplitNodeOperation,
  MergeNodeOperation,
  Operation,
  Path,
  Text,
} from 'slate';

import { xTransformMxN } from './SlateType';
import { decomposeMove } from './transMoveNode';
import { pathTransform } from './OT';

export const transInsertNode = (
  leftOp: InsertNodeOperation,
  rightOp: Operation,
  side: 'left' | 'right'
): (InsertNodeOperation | SplitNodeOperation | MergeNodeOperation)[] => {
  switch (rightOp.type) {
    case 'insert_node': {
      if (Path.equals(leftOp.path, rightOp.path) && side === 'left') {
        return [leftOp];
      }

      return <InsertNodeOperation[]>pathTransform(leftOp, rightOp);
    }

    case 'remove_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        return [leftOp];
      }

      return <InsertNodeOperation[]>pathTransform(leftOp, rightOp);
    }

    case 'split_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        return [leftOp];
      }

      return <InsertNodeOperation[]>pathTransform(leftOp, rightOp);
    }

    case 'merge_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        const offset = Text.isText(leftOp.node)
          ? leftOp.node.text.length
          : leftOp.node.children.length;
        return [
          {
            ...rightOp,
            type: 'split_node',
            path: Path.previous(rightOp.path),
          },
          leftOp,
          rightOp,
          {
            ...rightOp,
            position: rightOp.position + offset,
          },
        ];
      }

      return <InsertNodeOperation[]>pathTransform(leftOp, rightOp);
    }

    case 'move_node': {
      if (Path.equals(rightOp.path, rightOp.newPath)) {
        return [leftOp];
      }

      // the anchor node is moved, but we don't want to move with the anchor
      // hence the next of anchor is chosen as the new anchor
      if (Path.equals(leftOp.path, rightOp.path)) {
        return [
          {
            ...leftOp,
            path: Path.transform(Path.next(leftOp.path), rightOp)!,
          },
        ];
      }

      const [rr, ri] = decomposeMove(rightOp);
      const [l] = xTransformMxN([leftOp], [rr, ri], side);

      if (l.length == 1) return <InsertNodeOperation[]>l;

      // l.length == 0, the parent node is moved
      // in this case rr and ri will not be transformed by leftOp
      return [
        {
          ...leftOp,
          path: ri.path.concat(leftOp.path.slice(rr.path.length)),
        },
      ];
    }

    // insert_text
    // remove_text
    // set_node
    default:
      return <InsertNodeOperation[]>pathTransform(leftOp, rightOp);
  }
};
