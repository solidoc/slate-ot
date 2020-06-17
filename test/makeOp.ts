import {
  Path,
  Node,
  InsertTextOperation,
  RemoveTextOperation,
  InsertNodeOperation,
  RemoveNodeOperation,
  SplitNodeOperation,
  MergeNodeOperation,
  MoveNodeOperation,
  SetNodeOperation,
} from 'slate';

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
