import { RemoveNodeOperation, Operation, Path } from 'slate';

export const transRemoveNode = (
  leftOp: RemoveNodeOperation,
  rightOp: Operation,
  _side: 'left' | 'right'
): RemoveNodeOperation[] => {
  switch (rightOp.type) {
    case 'insert_text': {
      return [leftOp];
    }

    case 'remove_text': {
      return [leftOp];
    }

    case 'insert_node': {
      return [
        {
          ...leftOp,
          path: Path.transform(leftOp.path, rightOp)!,
        },
      ];
    }

    case 'remove_node': {
      const path: Path | null = Path.transform(leftOp.path, rightOp);
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
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return [
          {
            ...leftOp,
            path: Path.transform(leftOp.path, rightOp)!,
          },
        ];
      }

      // should remove the target node && the split node
      //   however, after removing the target node,
      //   the split node becomes the same path.
      // TODO: node within op should be split.
      return [leftOp, leftOp];
    }

    default:
      throw new Error('Unsupported OP');
  }
};
