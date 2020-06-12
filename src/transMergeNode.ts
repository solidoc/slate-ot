import {
  MergeNodeOperation,
  Operation,
  Path,
  Text,
  MoveNodeOperation,
} from 'slate';

import { decomposeMove, reverseMove } from './transMoveNode';

export const transMergeNode = (
  leftOp: MergeNodeOperation,
  rightOp: Operation,
  _side: 'left' | 'right'
): (MergeNodeOperation | MoveNodeOperation)[] => {
  switch (rightOp.type) {
    case 'insert_text': {
      if (Path.equals(leftOp.path, Path.next(rightOp.path))) {
        return [
          {
            ...leftOp,
            position: leftOp.position + rightOp.text.length,
          },
        ];
      }

      return [leftOp];
    }

    case 'remove_text': {
      if (Path.equals(leftOp.path, Path.next(rightOp.path))) {
        return [
          {
            ...leftOp,
            position: leftOp.position - rightOp.text.length,
          },
        ];
      }

      return [leftOp];
    }

    case 'insert_node': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return [
          {
            ...leftOp,
            path: Path.transform(leftOp.path, rightOp)!,
          },
        ];
      }

      const offset = Text.isText(rightOp.node)
        ? rightOp.node.text.length
        : rightOp.node.children.length;

      return [
        leftOp, // merge the inserted node
        {
          ...leftOp, // merge the original node
          position: leftOp.position + offset,
        },
      ];
    }

    case 'remove_node': {
      if (Path.equals(leftOp.path, Path.next(rightOp.path))) {
        return [];
      }

      const path = Path.transform(leftOp.path, rightOp);
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

      if (Path.equals(Path.previous(leftOp.path), rightOp.path)) {
        return [
          {
            ...leftOp,
            path: Path.next(leftOp.path),
            position: leftOp.position - rightOp.position,
          },
        ];
      }

      return [
        {
          ...leftOp,
          path: Path.transform(leftOp.path, rightOp)!,
        },
      ];
    }

    case 'merge_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        return [];
      }

      if (Path.equals(Path.previous(leftOp.path), rightOp.path)) {
        return [
          {
            ...leftOp,
            path: Path.previous(leftOp.path),
            position: leftOp.position + rightOp.position,
          },
        ];
      }

      return [
        {
          ...leftOp,
          path: Path.transform(leftOp.path, rightOp)!,
        },
      ];
    }

    case 'move_node': {
      if (Path.equals(rightOp.path, rightOp.newPath)) {
        return [leftOp];
      }

      let path = leftOp.path;
      let prevPath = Path.previous(path);

      path = Path.transform(path, rightOp)!;
      prevPath = Path.transform(prevPath, rightOp)!;

      // ops conflict with each other, discard move
      if (!Path.equals(path, Path.next(prevPath))) {
        let [rr, ri] = decomposeMove(rightOp);
        return [reverseMove(rr, ri), leftOp];
      }

      return [
        {
          ...leftOp,
          path,
        },
      ];
    }

    default:
      throw new Error('Unsupported OP');
  }
};
