import {
  InsertNodeOperation,
  InsertTextOperation,
  Operation,
  Path,
  Text,
} from 'slate';

export const transInsertNode = (
  leftOp: InsertNodeOperation,
  rightOp: Operation,
  side: 'left' | 'right'
): (InsertNodeOperation | InsertTextOperation)[] => {
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

      if (Text.isText(leftOp.node)) {
        return [
          {
            ...leftOp,
            type: 'insert_text',
            path: Path.previous(rightOp.path),
            offset: rightOp.position,
            text: leftOp.node.text,
          },
        ];
      }

      const result: InsertNodeOperation[] = [];
      leftOp.node.children.forEach((child) => {
        result.push({
          ...leftOp,
          node: child,
        });
      });

      return result;
    }

    default:
      throw new Error('Unsupported OP');
  }
};
