// import { slateType } from '../src/SlateType';
import { Operation, Transforms, Path, Node, Text } from 'slate';
import * as fuzzer from 'ot-fuzzer';
import * as _ from 'lodash';

// const MARKS = ['mark1', 'mark2', 'mark3', 'mark4', 'mark5'];
const BLOCKS = ['block1', 'block2', 'block3', 'block4', 'block5'];

// /**
//  * We use the Operations.apply function since we expect the apply function to work in Slate
//  * @param {Value} snapshot
//  */
// export const generateRandomOp = function (snapshot) {
//   // don't allow for remove node ops if document is empty
//   if (snapshot.document.nodes.size === 0)
//     return generateRandomInsertNodeOp(snapshot);
//   // don't allow for insert text op if no leaf nodes

//   let op = {};
//   switch (fuzzer.randomInt(AVAILIBLE_OPS_LEN)) {
//     case 0: {
//       const randomLeaf = getRandomLeafWithPath(snapshot.toJSON().document);
//       if (randomLeaf) {
//         op = generateRandomInsertTextOp(snapshot, randomLeaf);
//       } else {
//         op = generateRandomInsertNodeOp(snapshot);
//       }
//       break;
//     }
//     case 1:
//       op = generateRandomAddMarkOp(snapshot);
//       break;
//     default:
//       throw Error('Error generating random op');
//   }
//   return op;
// };

export const getAllTextPaths = (node: Node): Path[] => {
  let array: Path[] = [];
  // if (Text.isText(node)) {
  //   array.push(path);
  // } else {
  //   node.children.forEach((n, i) => {
  //     array = array.concat(getAllTextPaths(n, [...path, i]));
  //   });
  // }
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

export const generateRandomNode = (): Node => {
  return {
    type: BLOCKS[fuzzer.randomInt(BLOCKS.length)],
    children: [{ text: fuzzer.randomWord() }, { text: fuzzer.randomWord() }],
  };
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

  return {
    type: 'insert_node',
    path: randomPath,
    node: generateRandomNode(),
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

const genRandOp = [
  generateRandomInsertTextOp,
  generateRandomRemoveTextOp,
  generateRandomInsertNodeOp,
  generateRandomRemoveNodeOp,
  // generateRandomSplitNodeOp,
];
