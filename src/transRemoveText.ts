import { RemoveTextOperation, Operation, Path } from 'slate';
import { pathTransform } from './OT';

export const transRemoveText = (
  leftOp: RemoveTextOperation,
  rightOp: Operation,
  _side: 'left' | 'right'
): RemoveTextOperation[] => {
  switch (rightOp.type) {
    case 'insert_text': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return [leftOp];
      }

      if (leftOp.offset + leftOp.text.length <= rightOp.offset) {
        return [leftOp];
      }

      if (rightOp.offset <= leftOp.offset) {
        return [
          {
            ...leftOp,
            offset: leftOp.offset + rightOp.text.length,
          },
        ];
      }

      const intersectingIndex = rightOp.offset - leftOp.offset;
      const leftText = leftOp.text.slice(0, intersectingIndex);
      const rightText = leftOp.text.slice(intersectingIndex);
      return [
        {
          ...leftOp,
          text: leftText + rightOp.text + rightText,
        },
      ];
    }

    case 'remove_text': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return [leftOp];
      }
      if (leftOp.offset + leftOp.text.length <= rightOp.offset) {
        return [leftOp];
      }
      if (rightOp.offset + rightOp.text.length <= leftOp.offset) {
        return [
          {
            ...leftOp,
            offset: leftOp.offset - rightOp.text.length,
          },
        ];
      }

      // leftText and rightText both come from leftOp
      const leftTextEnd = Math.max(rightOp.offset - leftOp.offset, 0);
      const leftText = leftOp.text.slice(0, leftTextEnd);
      const rightTextStart = Math.min(
        leftOp.text.length,
        rightOp.offset + rightOp.text.length - leftOp.offset
      );
      const rightText = leftOp.text.slice(rightTextStart);
      return [
        {
          ...leftOp,
          offset: Math.min(leftOp.offset, rightOp.offset),
          text: leftText + rightText,
        },
      ];
    }

    case 'split_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        // text to remove all within the former segment
        if (leftOp.offset + leftOp.text.length <= rightOp.position) {
          return [leftOp];
        }

        // text to remove all within the latter segment
        if (leftOp.offset >= rightOp.position) {
          return [
            {
              ...leftOp,
              path: Path.next(rightOp.path),
              offset: leftOp.offset - rightOp.position,
            },
          ];
        }

        // text to remove in both segments
        return [
          {
            ...leftOp,
            text: leftOp.text.slice(0, rightOp.position - leftOp.offset),
          },
          {
            ...leftOp,
            path: Path.next(rightOp.path),
            offset: 0,
            text: leftOp.text.slice(rightOp.position - leftOp.offset),
          },
        ];
      }

      return <RemoveTextOperation[]>pathTransform(leftOp, rightOp);
    }

    case 'merge_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        return [
          {
            ...leftOp,
            path: Path.previous(rightOp.path),
            offset: leftOp.offset + rightOp.position,
          },
        ];
      }

      return <RemoveTextOperation[]>pathTransform(leftOp, rightOp);
    }

    // insert_node
    // remove_node
    // move_node
    // set_node
    default:
      return <RemoveTextOperation[]>pathTransform(leftOp, rightOp);
  }
};
