import {
  Operation,
  InsertTextOperation,
  RemoveTextOperation,
  Transforms,
  Element,
  createEditor,
  Editor,
  Path,
} from 'slate';

const slateType = {
  name: 'slate-ot-type',

  uri: 'http://sharejs.org/types/slate-ot-type',

  create(init: Element): Editor {
    const e = createEditor();
    e.children = init.children;
    return <Editor>init;
  },

  apply(snapshot: Editor, op: Operation[] | Operation) {
    slateType.normalize(op).forEach((o) => {
      Transforms.transform(snapshot, o);
    });
    return snapshot;
  },

  transform(
    op1: Operation[] | Operation,
    op0: Operation[],
    side: 'left' | 'right'
  ) {
    let result: Operation[] = [];
    op1 = slateType.normalize(op1);

    for (let i = 0; i < op1.length; i++) {
      let leftOp = op1[i];

      for (let j = 0; j < op0.length; j++) {
        const rightOp = op0[j];
        leftOp = doTransform(leftOp, rightOp, side);

        // if (Array.isArray(leftOp) && leftOp.length > 1) {
        //   leftOp = slateType.transform(leftOp, op0.slice(j), side);
        //   break;
        // }
      }
      result = Array.isArray(leftOp)
        ? [...result, ...leftOp]
        : [...result, leftOp];
    }
    return result;
  },

  serialize(snapshot) {
    return JSON.stringify(snapshot);
  },

  // deserialize(data) {
  //   // return Value.fromJSON(data);
  // },

  normalize(op: Operation | Operation[]): Operation[] {
    return Array.isArray(op) ? op : [op];
  },
};

const doTransform = (
  leftOp: Operation,
  rightOp: Operation,
  side: 'left' | 'right'
) => {
  // return side === 'left' ? leftOp : rightOp;
  switch (leftOp.type) {
    case 'insert_text':
      return insertTextTransform(leftOp, rightOp, side);
    case 'remove_text':
      return removeTextTransform(leftOp, rightOp, side);
    default:
      throw new Error('Unsupported OP');
  }
};

const insertTextTransform = (
  leftOp: InsertTextOperation,
  rightOp: Operation,
  side: 'left' | 'right'
): InsertTextOperation => {
  switch (rightOp.type) {
    case 'insert_text': {
      if (Path.compare(leftOp.path, rightOp.path)) {
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
      if (Path.compare(leftOp.path, rightOp.path)) {
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

    default:
      throw new Error('Unsupported OP');
  }
};

const removeTextTransform = (
  leftOp: RemoveTextOperation,
  rightOp: Operation,
  _side: 'left' | 'right'
): RemoveTextOperation => {
  switch (rightOp.type) {
    case 'insert_text': {
      if (Path.compare(leftOp.path, rightOp.path)) {
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
      if (Path.compare(leftOp.path, rightOp.path)) {
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

export { slateType };
