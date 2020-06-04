import { RemoveTextOperation, Operation, Path } from 'slate';

export const transRemoveText = (
  leftOp: RemoveTextOperation,
  rightOp: Operation,
  _side: 'left' | 'right'
): RemoveTextOperation => {
  switch (rightOp.type) {
    case 'insert_text': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return leftOp;
      }
      if (leftOp.offset + leftOp.text.length <= rightOp.offset) {
        return leftOp;
      }
      if (rightOp.offset <= leftOp.offset) {
        return {
          ...leftOp,
          offset: leftOp.offset + rightOp.text.length,
        };
      }
      const intersectingIndex = rightOp.offset - leftOp.offset;
      const leftText = leftOp.text.slice(0, intersectingIndex);
      const rightText = leftOp.text.slice(intersectingIndex);
      return {
        ...leftOp,
        text: leftText + rightOp.text + rightText,
      };
    }
    case 'remove_text': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return leftOp;
      }
      if (leftOp.offset + leftOp.text.length <= rightOp.offset) {
        return leftOp;
      }
      if (rightOp.offset + rightOp.text.length <= leftOp.offset) {
        return {
          ...leftOp,
          offset: leftOp.offset - rightOp.text.length,
        };
      }
      // leftText and rightText both come from leftOp
      const leftTextEnd = Math.max(rightOp.offset - leftOp.offset, 0);
      const leftText = leftOp.text.slice(0, leftTextEnd);
      const rightTextStart = Math.min(
        leftOp.text.length,
        rightOp.offset + rightOp.text.length - leftOp.offset
      );
      const rightText = leftOp.text.slice(rightTextStart);
      return {
        ...leftOp,
        offset: Math.min(leftOp.offset, rightOp.offset),
        text: leftText + rightText,
      };
    }

    default:
      throw new Error('Unsupported OP');
  }
};
