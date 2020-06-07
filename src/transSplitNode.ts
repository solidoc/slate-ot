import { SplitNodeOperation, Operation, Path } from 'slate';

export const transSplitNode = (
  leftOp: SplitNodeOperation,
  rightOp: Operation,
  _side: 'left' | 'right'
): SplitNodeOperation[] => {
  switch (rightOp.type) {
    case 'insert_text': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return [leftOp];
      }

      if (leftOp.position < rightOp.offset) {
        return [leftOp];
      }

      return [
        {
          ...leftOp,
          position: leftOp.position + rightOp.text.length,
        },
      ];
    }

    case 'remove_text': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return [leftOp];
      }

      if (leftOp.position < rightOp.offset) {
        return [leftOp];
      }

      if (leftOp.position >= rightOp.offset + rightOp.text.length) {
        return [
          {
            ...leftOp,
            position: leftOp.position - rightOp.text.length,
          },
        ];
      }

      return [
        {
          ...leftOp,
          position: rightOp.offset,
        },
      ];
    }

    case 'insert_node': {
      if (Path.isParent(leftOp.path, rightOp.path)) {
        let offset = rightOp.path[rightOp.path.length - 1];

        return [
          {
            ...leftOp,
            position:
              leftOp.position < offset ? leftOp.position : leftOp.position + 1,
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

    case 'remove_node': {
      if (Path.isParent(leftOp.path, rightOp.path)) {
        let offset = rightOp.path[rightOp.path.length - 1];
        if (leftOp.position < offset) {
          return [leftOp];
        }

        return [
          {
            ...leftOp,
            position: leftOp.position - 1,
          },
        ];
      }

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

      if (leftOp.position <= rightOp.position) {
        return [leftOp];
      }

      return [
        {
          ...leftOp,
          path: Path.next(leftOp.path),
          position: leftOp.position - rightOp.position,
        },
      ];
    }

    default:
      throw new Error('Unsupported OP');
  }
};
