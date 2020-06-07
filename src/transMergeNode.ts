import { MergeNodeOperation, Operation, Path } from 'slate';

export const transMergeNode = (
  leftOp: MergeNodeOperation,
  rightOp: Operation,
  _side: 'left' | 'right'
): MergeNodeOperation[] => {
  switch (rightOp.type) {
    // case 'insert_text': {
    // }

    // case 'remove_text': {
    // }

    // case 'insert_node': {
    // }

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
