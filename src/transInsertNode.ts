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

export const transInsertNode = (
  leftOp: InsertNodeOperation,
  rightOp: Operation,
  side: 'left' | 'right'
): (InsertNodeOperation | SplitNodeOperation | MergeNodeOperation)[] => {
  switch (rightOp.type) {
    case 'insert_text': {
      return [leftOp];
    }

    case 'remove_text': {
      return [leftOp];
    }

    case 'insert_node': {
      if (Path.equals(leftOp.path, rightOp.path) && side === 'left') {
        return [leftOp];
      }
      return [
        {
          ...leftOp,
          path: Path.transform(leftOp.path, rightOp)!,
        },
      ];
    }

    case 'remove_node': {
      // seems to be a bug in slate's Path.transform()
      const path: Path | null = Path.equals(leftOp.path, rightOp.path)
        ? leftOp.path
        : Path.transform(leftOp.path, rightOp);

      return path
        ? [
            {
              ...leftOp,
              path,
            },
          ]
        : [];
    }

    case 'split_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        return [leftOp];
      }

      return [
        {
          ...leftOp,
          path: Path.transform(leftOp.path, rightOp)!,
        },
      ];
    }

    case 'merge_node': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return [
          {
            ...leftOp,
            path: Path.transform(leftOp.path, rightOp)!,
          },
        ];
      }

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

    case 'set_node': {
      return [leftOp];
    }

    default:
      throw new Error('Unsupported OP');
  }
};
