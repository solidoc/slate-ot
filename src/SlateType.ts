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
    leftOps: Operation[],
    rightOps: Operation[],
    side: 'left' | 'right'
  ): Operation[] {
    let [leftRes] = xTransformMxN(leftOps, rightOps, side);
    return leftRes;
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

const xTransformMxN = (
  leftOps: Operation[],
  rightOps: Operation[],
  side: 'left' | 'right'
): [Operation[], Operation[]] => {
  let leftRes: Operation[] = [];

  for (let m = 0; m < leftOps.length; m++) {
    let leftOp: Operation = leftOps[m];

    let [lRes, rRes] = xTransform1xN(leftOp, rightOps, side);

    leftRes = leftRes.concat(lRes);

    rightOps = rRes;
  }

  return [leftRes, rightOps];
};

const xTransform1xN = (
  leftOp: Operation,
  rightOps: Operation[],
  side: 'left' | 'right'
): [Operation[], Operation[]] => {
  let rRes: Operation[] = [];

  for (let n = 0; n < rightOps.length; n++) {
    let rightOp: Operation = rightOps[n];

    let [l, r] = xTransform1x1(leftOp, rightOp, side);
    rRes = rRes.concat(r);

    if (l.length === 0) {
      rRes = rRes.concat(rightOps.slice(n + 1));
      return [[], rRes];
    }

    if (l.length > 1) {
      [l, r] = xTransformMxN(l, rightOps.slice(n + 1), side);
      rRes = rRes.concat(r);
      return [l, rRes];
    }

    // l.length == 1
    leftOp = l[0];
  }
  return [[leftOp], rRes];
};

const xTransform1x1 = (
  leftOp: Operation,
  rightOp: Operation,
  side: 'left' | 'right'
): [Operation[], Operation[]] => {
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
): Operation[] => {
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
    case 'split_node':
      return OT.transSplitNode(leftOp, rightOp, side);
    case 'merge_node':
      return OT.transMergeNode(leftOp, rightOp, side);
    case 'move_node':
      return OT.transMoveNode(leftOp, rightOp, side);
    default:
      throw new Error('Unsupported OP');
  }
};

export { slateType, xTransformMxN };
