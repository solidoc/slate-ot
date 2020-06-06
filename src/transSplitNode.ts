import { SplitNodeOperation, Operation, Path } from 'slate';

export const transSplitNode = (
  leftOp: SplitNodeOperation,
  rightOp: Operation,
  _side: 'left' | 'right'
): SplitNodeOperation | null => {
  switch (rightOp.type) {
    // case 'insert_text': {
    //   return leftOp;
    // }

    // case 'remove_text': {
    //   return leftOp;
    // }

    // case 'insert_node': {
    //   if (Path.equals(leftOp.path, rightOp.path) && side === 'left') {
    //     return leftOp;
    //   }
    //   return {
    //     ...leftOp,
    //     path: <Path>Path.transform(leftOp.path, rightOp),
    //   };
    // }

    // case 'remove_node': {
    //   // seems to be a bug in slate's Path.transform()
    //   const path: Path | null = Path.equals(leftOp.path, rightOp.path)
    //     ? leftOp.path
    //     : Path.transform(leftOp.path, rightOp);
    //   return path
    //     ? {
    //         ...leftOp,
    //         path,
    //       }
    //     : null;
    // }

    case 'split_node': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return {
          ...leftOp,
          path: Path.transform(leftOp.path, rightOp)!,
        };
      }

      if (leftOp.position <= rightOp.position) {
        return leftOp;
      }

      return {
        ...leftOp,
        path: Path.next(leftOp.path),
        position: leftOp.position - rightOp.position,
      };
    }

    default:
      throw new Error('Unsupported OP');
  }
};
