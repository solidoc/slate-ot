import { RemoveNodeOperation, Operation, Path } from 'slate';

export const transRemoveNode = (
  leftOp: RemoveNodeOperation,
  rightOp: Operation,
  _side: 'left' | 'right'
): RemoveNodeOperation | null => {
  switch (rightOp.type) {
    case 'insert_text': {
      return leftOp;
    }

    case 'remove_text': {
      return leftOp;
    }

    case 'insert_node': {
      return {
        ...leftOp,
        path: <Path>Path.transform(leftOp.path, rightOp),
      };
    }

    case 'remove_node': {
      const path: Path | null = Path.transform(leftOp.path, rightOp);
      return path
        ? {
            ...leftOp,
            path,
          }
        : null;
    }

    default:
      throw new Error('Unsupported OP');
  }
};
