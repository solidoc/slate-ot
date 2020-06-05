import { InsertTextOperation, Operation, Path } from 'slate';

export const transInsertText = (
  leftOp: InsertTextOperation,
  rightOp: Operation,
  side: 'left' | 'right'
): InsertTextOperation | null => {
  switch (rightOp.type) {
    case 'insert_text': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return leftOp;
      }
      if (leftOp.offset < rightOp.offset) {
        return leftOp;
      }
      if (leftOp.offset === rightOp.offset && side === 'left') {
        return leftOp;
      }
      return {
        ...leftOp,
        offset: leftOp.offset + rightOp.text.length,
      };
    }

    case 'remove_text': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return leftOp;
      }
      if (leftOp.offset <= rightOp.offset) {
        return leftOp;
      }
      if (rightOp.offset + rightOp.text.length <= leftOp.offset) {
        return {
          ...leftOp,
          offset: leftOp.offset - rightOp.text.length,
        };
      }
      return {
        ...leftOp,
        offset: rightOp.offset,
        text: '',
      };
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
