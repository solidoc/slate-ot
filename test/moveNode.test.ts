import { xTransformMxN } from '../src/SlateType';
import { makeOp, applyOp } from './utils';
import { Node } from 'slate';
import * as _ from 'lodash';

const doc: Node = {
  children: [
    {
      type: 'Paragraph',
      children: [{ text: 'A' }, { text: 'B' }],
    },
    {
      type: 'NumberedList',
      children: [{ text: 'C' }, { text: 'D' }],
    },
    {
      type: 'BulletedList',
      children: [{ text: 'E' }, { text: 'F' }],
    },
  ],
};

describe('left side to moveNode, right side to:', () => {
  let doc1, doc2;
  let op1, op2;

  beforeEach(() => {
    doc1 = _.cloneDeep(doc);
    doc2 = _.cloneDeep(doc);
  });

  afterEach(() => {
    const [op12, op21] = xTransformMxN([op1], [op2], 'left');

    doc1 = applyOp(applyOp(doc1, op1), op21);
    doc2 = applyOp(applyOp(doc2, op2), op12);

    expect(doc1).toStrictEqual(doc2);
  });

  describe('insertText', () => {
    test('', () => {
      op1 = makeOp.moveNode([1], [0]);
      op2 = makeOp.insertText([0, 1], 1, 'ee');
    });
  });

  describe('removeText', () => {
    test('', () => {
      op1 = makeOp.moveNode([1], [0]);
      op2 = makeOp.removeText([0, 1], 0, 'B');
    });
  });

  describe('insertNode', () => {
    const branch: Node = {
      children: [{ text: 'X' }, { text: 'Y' }],
    };
    const leaf: Node = { text: 'Z' };

    test('at moveOp.path', () => {
      op1 = makeOp.moveNode([1], [0]);
      op2 = makeOp.insertNode([1], branch);
    });

    test('at moveOp.newPath', () => {
      op1 = makeOp.moveNode([1], [0]);
      op2 = makeOp.insertNode([0], branch);
    });

    test('within moveOp.path', () => {
      op1 = makeOp.moveNode([1], [0]);
      op2 = makeOp.insertNode([1, 2], leaf);
    });
  });

  describe('removeNode', () => {
    test('at moveOp.path', () => {
      op1 = makeOp.moveNode([1], [0]);
      op2 = makeOp.removeNode([1], doc.children[1]);
    });

    test('at moveOp.newPath', () => {
      op1 = makeOp.moveNode([1], [0]);
      op2 = makeOp.removeNode([0], doc.children[0]);
    });

    test('at parent of moveOp.path', () => {
      op1 = makeOp.moveNode([0, 0], [1, 0]);
      op2 = makeOp.removeNode([0], doc.children[0]);
    });

    test('at parent of moveOp.newPpath', () => {
      op1 = makeOp.moveNode([1, 0], [0, 0]);
      op2 = makeOp.removeNode([0], doc.children[0]);
    });

    test('at parent of both moveOp.path&newPath', () => {
      op1 = makeOp.moveNode([0, 0], [0, 1]);
      op2 = makeOp.removeNode([0], doc.children[0]);
    });
  });

  describe('splitNode', () => {
    test('at moveOp.path && move after newPath', () => {
      op1 = makeOp.moveNode([1], [0]);
      op2 = makeOp.splitNode([1], 1);
    });

    test('at moveOp.path && move before newPath', () => {
      op1 = makeOp.moveNode([1], [2]);
      op2 = makeOp.splitNode([1], 1);
    });

    test('at moveOp.newPath && move before newPath', () => {
      op1 = makeOp.moveNode([2], [1]);
      op2 = makeOp.splitNode([1], 1);
    });

    test('at moveOp.newPath && move before newPath', () => {
      op1 = makeOp.moveNode([0], [1]);
      op2 = makeOp.splitNode([1], 1);
    });

    test('at parent of both moveOp.path&newPath and seperates them', () => {
      op1 = makeOp.moveNode([1, 0], [1, 1]);
      op2 = makeOp.splitNode([1], 1);
    });
  });

  describe('mergeNode', () => {
    test('at moveOp.path', () => {
      op1 = makeOp.moveNode([1], [2]);
      op2 = makeOp.mergeNode([1], 2);
    });

    test('at moveOp.path.next', () => {
      op1 = makeOp.moveNode([1], [2]);
      op2 = makeOp.mergeNode([2], 2);
    });

    test('at moveOp.newPath', () => {
      op1 = makeOp.moveNode([2], [1]);
      op2 = makeOp.mergeNode([1], 2);
    });

    test('at moveOp.newPath.next', () => {
      op1 = makeOp.moveNode([0], [1]);
      op2 = makeOp.mergeNode([2], 2);
    });

    test('at parent of moveOp.newPath & uncle of moveOp.path', () => {
      op1 = makeOp.moveNode([0, 1], [1, 0]);
      op2 = makeOp.mergeNode([1], 2);
    });

    test('at parent of moveOp.path & uncle of moveOp.newPath', () => {
      op1 = makeOp.moveNode([1, 0], [0, 1]);
      op2 = makeOp.mergeNode([1], 2);
    });
  });

  describe('moveNode', () => {
    test('with path == newPath', () => {
      op1 = makeOp.moveNode([1], [2]);
      op2 = makeOp.moveNode([0], [0]);
    });

    test('the same one as left', () => {
      op1 = makeOp.moveNode([1], [2]);
      op2 = makeOp.moveNode([1], [0]);
    });

    test('making a circle with left', () => {
      op1 = makeOp.moveNode([1], [0, 0]);
      op2 = makeOp.moveNode([0], [1, 0]);
    });

    test('at ancestor of left.path', () => {
      op1 = makeOp.moveNode([0, 0], [2, 1]);
      op2 = makeOp.moveNode([0], [1]);
    });

    test('at ancestor of left.newPath', () => {
      op1 = makeOp.moveNode([2, 0], [0, 1]);
      op2 = makeOp.moveNode([0], [1]);
    });

    test('at ancestor of both left.path&newPath', () => {
      op1 = makeOp.moveNode([0, 0], [0, 1]);
      op2 = makeOp.moveNode([0], [1]);
    });

    test('left side move to the same place', () => {
      op1 = makeOp.moveNode([1], [1]);
      op2 = makeOp.moveNode([2], [0]);
    });
  });

  describe('setNode', () => {
    test('', () => {
      op1 = makeOp.moveNode([1], [0]);
      op2 = makeOp.setNode([0, 1], { bold: 'true' });
    });
  });
});
