import { Operation, Transforms, Element, createEditor, Editor } from 'slate';
import { OT } from './OT';

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
    op1: Operation[],
    op0: Operation[],
    side: 'left' | 'right'
  ): Operation[] {
    let result: Operation[] = [];
    op1 = slateType.normalize(op1);

    for (let i = 0; i < op1.length; i++) {
      let leftOp: Operation | null = op1[i];
      let rightOp: Operation | null;

      let op0t: Operation[] = [];
      for (let j = 0; j < op0.length && leftOp; j++) {
        [leftOp, rightOp] = xTransform(leftOp, op0[j], side);

        rightOp && op0t.push(rightOp);
      }
      leftOp && result.push(leftOp);
      op0 = op0t;
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

const xTransform = (
  leftOp: Operation,
  rightOp: Operation,
  side: 'left' | 'right'
): [Operation | null, Operation | null] => {
  const other = side === 'left' ? 'right' : 'left';
  return [
    doTransform(leftOp, rightOp, side),
    doTransform(rightOp, leftOp, other),
  ];
};
const doTransform = (
  leftOp: Operation,
  rightOp: Operation,
  side: 'left' | 'right'
): Operation | null => {
  // return side === 'left' ? leftOp : rightOp;
  switch (leftOp.type) {
    case 'insert_text':
      return OT.transInsertText(leftOp, rightOp, side);
    case 'remove_text':
      return OT.transRemoveText(leftOp, rightOp, side);
    case 'insert_node':
      return OT.transInsertNode(leftOp, rightOp, side);
    case 'remove_node':
      return OT.transRemoveNode(leftOp, rightOp, side);
    default:
      throw new Error('Unsupported OP');
  }
};

export { slateType };
