import { InsertNodeOperation, Operation, Path } from 'slate';

export const transInsertNode = (
  leftOp: InsertNodeOperation,
  rightOp: Operation,
  side: 'left' | 'right'
): InsertNodeOperation => {
  switch (rightOp.type) {
    case 'insert_text': {
      return leftOp;
    }

    // case 'remove_text': {
    // }

    case 'insert_node': {
      if (Path.equals(leftOp.path, rightOp.path) && side === 'left') {
        return leftOp;
      }
      return {
        ...leftOp,
        path: <Path>Path.transform(leftOp.path, rightOp),
      };
    }

    default:
      throw new Error('Unsupported OP');
  }
};
