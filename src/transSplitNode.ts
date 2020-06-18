import { SplitNodeOperation, Operation, Path } from 'slate';
import { pathTransform } from './OT';

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

        if (leftOp.position <= offset) {
          return [leftOp];
        }

        return [
          {
            ...leftOp,
            position: leftOp.position + 1,
          },
        ];
      }

      return <SplitNodeOperation[]>pathTransform(leftOp, rightOp);
    }

    case 'remove_node': {
      if (Path.isParent(leftOp.path, rightOp.path)) {
        let offset = rightOp.path[rightOp.path.length - 1];

        if (leftOp.position <= offset) {
          return [leftOp];
        }

        return [
          {
            ...leftOp,
            position: leftOp.position - 1,
          },
        ];
      }

      return <SplitNodeOperation[]>pathTransform(leftOp, rightOp);
    }

    case 'split_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        if (leftOp.position < rightOp.position) {
          return [leftOp];
        }

        if (leftOp.position === rightOp.position) {
          return [];
        }

        return [
          {
            ...leftOp,
            path: Path.next(leftOp.path),
            position: leftOp.position - rightOp.position,
          },
        ];
      }

      if (Path.isParent(leftOp.path, rightOp.path)) {
        const offset = rightOp.path[rightOp.path.length - 1];

        if (leftOp.position <= offset) {
          return [leftOp];
        }

        return [
          {
            ...leftOp,
            position: leftOp.position + 1,
          },
        ];
      }

      return <SplitNodeOperation[]>pathTransform(leftOp, rightOp);
    }

    case 'merge_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        return [];
      }

      if (Path.isParent(leftOp.path, rightOp.path)) {
        const offset = rightOp.path[rightOp.path.length - 1];

        if (leftOp.position < offset) {
          return [leftOp];
        }

        if (leftOp.position > offset) {
          return [
            {
              ...leftOp,
              position: leftOp.position - 1,
            },
          ];
        }

        // conflicting ops, discard split
        return [];
      }

      return <SplitNodeOperation[]>pathTransform(leftOp, rightOp);
    }

    case 'move_node': {
      if (Path.equals(rightOp.path, rightOp.newPath)) {
        return [leftOp];
      }

      let position = leftOp.position;
      let offset = rightOp.path[rightOp.path.length - 1];
      let newOffset = rightOp.newPath[rightOp.newPath.length - 1];

      // only src path is leftOp's child
      if (
        Path.isParent(leftOp.path, rightOp.path) &&
        offset < leftOp.position
      ) {
        position--;
      }

      // only dst path is leftOp's child
      if (
        Path.isParent(leftOp.path, rightOp.newPath) &&
        newOffset < leftOp.position
      ) {
        position++;
      }

      return [
        {
          ...leftOp,
          path: Path.transform(leftOp.path, rightOp)!,
          position,
        },
      ];
    }

    // set_node
    default:
      return <SplitNodeOperation[]>pathTransform(leftOp, rightOp);
  }
};
