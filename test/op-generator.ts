// import { slateType } from '../src/SlateType';
import { Operation, Transforms, Path, Node, Text, Ancestor } from 'slate';
import * as fuzzer from 'ot-fuzzer';
import * as _ from 'lodash';

const BLOCKS = ['block1', 'block2', 'block3', 'block4', 'block5'];

export const getAllTextPaths = (node: Node): Path[] => {
  let array: Path[] = [];
  for (let [, p] of Node.texts(node)) {
    array.push(p);
  }
  return array;
};

interface TextWithPath extends Text {
  path: Path;
}
export const getRandomLeafWithPath = (snapshot: Node): TextWithPath | null => {
  const paths = getAllTextPaths(snapshot);
  const path = paths[fuzzer.randomInt(paths.length)];

  if (!path || !path.length) {
    return null;
  }

  const t = Node.leaf(snapshot, path);

  return { ...t, path };
};

export const getRandomPathFrom = (root: Node): Path => {
  const path: Path = [];
  // let currentNode = root;
  while (1) {
    // stop when you get to a leaf
    if (Text.isText(root)) {
      return path;
    }

    if (root.children.length === 0 || fuzzer.randomInt(3) === 0) {
      return [];
    }

    // continue
    const index = <number>fuzzer.randomInt(root.children.length);
    path.push(index);
    root = root.children[index];
  }
  return path;
};

export const getRandomPathTo = (root: Node): Path => {
  const path: Path = [];
  // let currentNode = root;
  while (1) {
    // stop when you get to a leaf
    if (Text.isText(root)) {
      return path;
    }

    if (root.children.length === 0) {
      return [...path, 0];
    }

    // randomly stop at the next level
    if (fuzzer.randomInt(3) === 0) {
      const index = <number>fuzzer.randomInt(root.children.length + 1);
      return [...path, index];
    }

    // continue
    const index = <number>fuzzer.randomInt(root.children.length);
    path.push(index);
    root = root.children[index];
  }
  return path;
};

export const generateAndApplyRandomOp = function (snapshot) {
  const result = _.cloneDeep(snapshot);

  let op: Operation | null = null;
  while (!op) {
    let index = fuzzer.randomInt(genRandOp.length);
    op = genRandOp[index](snapshot);
  }

  Transforms.transform(result, op);
  return [[op], result];
};

// insert_text: ['path', 'offset', 'text', 'marks', 'data'],
export const generateRandomInsertTextOp = (snapshot): Operation | null => {
  const randomLeaf = getRandomLeafWithPath(snapshot);

  return randomLeaf
    ? {
        type: 'insert_text',
        path: randomLeaf.path,
        offset: fuzzer.randomInt(randomLeaf.text.length),
        text: fuzzer.randomWord(),
      }
    : null;
};

// remove_text: ['path', 'offset', 'text', 'marks', 'data'],
export const generateRandomRemoveTextOp = (snapshot): Operation | null => {
  const randomLeaf = getRandomLeafWithPath(snapshot);

  if (!randomLeaf) return null;

  const offset = fuzzer.randomInt(randomLeaf.text.length);
  const textLength = fuzzer.randomInt(randomLeaf.text.length - offset);

  return {
    type: 'remove_text',
    path: randomLeaf.path,
    offset,
    text: randomLeaf.text.slice(offset, textLength),
  };
};

// insert_node: ['path', 'node', 'data']
export const generateRandomInsertNodeOp = (snapshot): Operation => {
  const randomPath = getRandomPathTo(snapshot);

  const parent = <Ancestor>Node.get(snapshot, Path.parent(randomPath));

  let node;

  if (parent.children[0] && Text.isText(parent.children[0])) {
    node = { text: fuzzer.randomWord() };
  } else if (!parent.children[0] && fuzzer.randomInt(3) === 0) {
    node = { text: fuzzer.randomWord() };
  } else if (fuzzer.randomInt(2) === 0) {
    node = {
      type: BLOCKS[fuzzer.randomInt(BLOCKS.length)],
      children: [{ text: fuzzer.randomWord() }, { text: fuzzer.randomWord() }],
    };
  } else {
    node = {
      type: BLOCKS[fuzzer.randomInt(BLOCKS.length)],
      children: [
        {
          type: BLOCKS[fuzzer.randomInt(BLOCKS.length)],
          children: [
            { text: fuzzer.randomWord() },
            { text: fuzzer.randomWord() },
          ],
        },
      ],
    };
  }

  return {
    type: 'insert_node',
    path: randomPath,
    node,
  };
};

export const generateRandomRemoveNodeOp = (snapshot): Operation | null => {
  const randomPath = getRandomPathFrom(snapshot);

  return randomPath.length
    ? {
        type: 'remove_node',
        path: randomPath,
        node: Node.get(snapshot, randomPath),
      }
    : null;
};

export const generateRandomSplitNodeOp = (snapshot): Operation | null => {
  const randomPath = getRandomPathFrom(snapshot);

  const node = Node.get(snapshot, randomPath);
  const position = Text.isText(node)
    ? <number>fuzzer.randomInt(node.text.length + 1)
    : <number>fuzzer.randomInt(node.children.length + 1);

  return randomPath.length
    ? {
        type: 'split_node',
        path: randomPath,
        position,
        target: null,
        properties: {},
      }
    : null;
};

export const generateRandomMergeNodeOp = (snapshot): Operation | null => {
  const randomPath = getRandomPathFrom(snapshot);

  if (randomPath.length == 0 || randomPath[randomPath.length - 1] == 0) {
    return null;
  }

  const prev = Node.get(snapshot, Path.previous(randomPath));

  const node = Node.get(snapshot, randomPath);

  if (Text.isText(prev) && Text.isText(node)) {
    return {
      type: 'merge_node',
      path: randomPath,
      position: prev.text.length,
      target: null,
      properties: {},
    };
  }

  if (!Text.isText(prev) && !Text.isText(node)) {
    return {
      type: 'merge_node',
      path: randomPath,
      position: prev.children.length,
      target: null,
      properties: {},
    };
  }

  return null;
};

export const generateRandomMoveNodeOp = (snapshot): Operation | null => {
  while (1) {
    const path = getRandomPathFrom(snapshot);
    const newPath = getRandomPathTo(snapshot);

    if (Path.isSibling(path, newPath)) {
      const parent = <Ancestor>Node.get(snapshot, Path.parent(newPath));
      if (newPath[newPath.length - 1] == parent.children.length) {
        newPath[newPath.length - 1]--;
      }
    }

    if (!Path.isAncestor(path, newPath)) {
      return {
        type: 'move_node',
        path,
        newPath,
      };
    }
  }
  return null;
};

const genRandOp = [
  generateRandomInsertTextOp,
  generateRandomRemoveTextOp,
  generateRandomInsertNodeOp,
  generateRandomRemoveNodeOp,
  // generateRandomSplitNodeOp,
  // generateRandomMergeNodeOp,
  generateRandomMoveNodeOp,
];
