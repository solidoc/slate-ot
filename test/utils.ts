import {
  Path,
  Node,
  Element,
  Text,
  Operation,
  Editor,
  InsertTextOperation,
  RemoveTextOperation,
  InsertNodeOperation,
  RemoveNodeOperation,
  SplitNodeOperation,
  MergeNodeOperation,
  MoveNodeOperation,
  SetNodeOperation,
} from 'slate';

import { slateType } from '../src/SlateType';

export const makeOp = {
  insertText: (
    path: Path,
    offset: number,
    text: string
  ): InsertTextOperation => {
    return {
      type: 'insert_text',
      path,
      offset,
      text,
    };
  },

  removeText: (
    path: Path,
    offset: number,
    text: string
  ): RemoveTextOperation => {
    return {
      type: 'remove_text',
      path,
      offset,
      text,
    };
  },

  insertNode: (path: Path, node: Node): InsertNodeOperation => {
    return {
      type: 'insert_node',
      path,
      node,
    };
  },

  removeNode: (path: Path, node: Node): RemoveNodeOperation => {
    return {
      type: 'remove_node',
      path,
      node,
    };
  },

  splitNode: (path: Path, position: number): SplitNodeOperation => {
    return {
      type: 'split_node',
      path,
      position,
      target: null,
      properties: {},
    };
  },

  mergeNode: (path: Path, position: number): MergeNodeOperation => {
    return {
      type: 'merge_node',
      path,
      position,
      target: null,
      properties: {},
    };
  },

  moveNode: (path: Path, newPath: Path): MoveNodeOperation => {
    return {
      type: 'move_node',
      path,
      newPath,
    };
  },

  setNode: (path: Path, newProperties: Partial<Node>): SetNodeOperation => {
    return {
      type: 'set_node',
      path,
      properties: {},
      newProperties,
    };
  },
};

export const applyOp = (
  snapshot: Editor,
  ops: Operation[] | Operation
): Editor => {
  slateType.normalize(ops).forEach((op) => {
    checkOp(snapshot, op);
    slateType.apply(snapshot, op);
  });
  return snapshot;
};

const checkOp = (snapshot: Editor, op: Operation) => {
  switch (op.type) {
    case 'remove_text': {
      const leaf = Node.leaf(snapshot, op.path);
      const textToRemove = leaf.text.slice(
        op.offset,
        op.offset + op.text.length
      );

      expect(textToRemove).toBe(op.text);

      break;
    }

    case 'merge_node': {
      const prev = Node.get(snapshot, Path.previous(op.path));

      const prevLen = Text.isText(prev)
        ? prev.text.length
        : prev.children.length;

      expect(prevLen).toBe(op.position);

      break;
    }

    case 'remove_node': {
      // op.node needs to be checked
      break;
    }

    default:
      return;
  }
};

export const initialDoc: Element = {
  children: [
    {
      type: 'Paragraph',
      children: [{ text: 'AB' }, { text: 'CD' }, { text: 'EF' }],
    },
    {
      type: 'NumberedList',
      children: [{ text: 'GH', bold: 'true' }, { text: 'IJ' }, { text: 'KL' }],
    },
    {
      type: 'BulletedList',
      children: [{ text: 'MN' }, { text: 'OP' }, { text: 'QR' }],
    },
  ],
};
