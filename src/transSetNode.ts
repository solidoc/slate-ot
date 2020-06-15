import { SetNodeOperation, Operation, Path } from 'slate';

export const transSetNode = (
  leftOp: SetNodeOperation,
  rightOp: Operation,
  side: 'left' | 'right'
): SetNodeOperation[] => {
  switch (rightOp.type) {
    case 'insert_text': {
      return [leftOp];
    }

    case 'remove_text': {
      return [leftOp];
    }

    // case 'insert_node': {
    // }

    // case 'remove_node': {
    // }

    // case 'split_node': {
    // }

    // case 'merge_node': {
    // }

    // case 'move_node': {
    // }

    case 'set_node': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return [leftOp];
      }

      return side === 'left'
        ? [
            {
              ...leftOp,
              newProperties: {
                ...rightOp.newProperties,
                ...leftOp.newProperties,
              },
            },
          ]
        : [
            {
              ...leftOp,
              newProperties: {
                ...leftOp.newProperties,
                ...rightOp.newProperties,
              },
            },
          ];
    }

    default:
      throw new Error('Unsupported OP');
  }
};
