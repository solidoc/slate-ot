import { MergeNodeOperation, Operation, Path, Text } from 'slate';

export const transMergeNode = (
  leftOp: MergeNodeOperation,
  rightOp: Operation,
  _side: 'left' | 'right'
): MergeNodeOperation[] => {
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

    // case 'remove_node': {
    // }

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

    default:
      throw new Error('Unsupported OP');
  }
};
