import {
  InsertNodeOperation,
  SplitNodeOperation,
  MergeNodeOperation,
  Operation,
  Path,
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

      return [
        {
          ...rightOp,
          type: 'split_node',
        },
        leftOp,
        rightOp,
        rightOp,
      ];
    }

    case 'move_node': {
      const [rr, ri] = decomposeMove(rightOp);
      const [l] = xTransformMxN([leftOp], [rr, ri], side);

      return <InsertNodeOperation[]>l;
    }

    default:
      throw new Error('Unsupported OP');
  }
};
