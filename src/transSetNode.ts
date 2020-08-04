import { SetNodeOperation, Operation, Path } from 'slate';
import { pathTransform } from './OT';

export const transSetNode = (
  leftOp: SetNodeOperation,
  rightOp: Operation,
  side: 'left' | 'right'
): SetNodeOperation[] => {
  switch (rightOp.type) {
    case 'split_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        return [
          leftOp,
          {
            ...leftOp,
            path: Path.next(leftOp.path),
          },
        ];
      }

      return <SetNodeOperation[]>pathTransform(leftOp, rightOp);
    }

    case 'merge_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        return [];
      }

      return <SetNodeOperation[]>pathTransform(leftOp, rightOp);
    }

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

    // insert_text
    // remove_text
    // insert_node
    // remove_node
    // move_node
    default:
      return <SetNodeOperation[]>pathTransform(leftOp, rightOp);
  }
};
