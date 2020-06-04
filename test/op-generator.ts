// import { slateType } from '../src/SlateType';
import { Operation, Transforms, Path, Node, Text } from 'slate';
import * as fuzzer from 'ot-fuzzer';
import * as _ from 'lodash';

// const MARKS = ['mark1', 'mark2', 'mark3', 'mark4', 'mark5'];
const BLOCKS = ['block1', 'block2', 'block3', 'block4', 'block5'];

/**
 * Start from document
 * @param {Value} snapshot
 * @param {Array} leafs
 */
export const getAllTextPaths = (node: Node, path: Path = []): Path[] => {
  let array: Path[] = [];
  if (Text.isText(node)) {
    array.push(path);
  } else {
    node.children.forEach((n, i) => {
      array = array.concat(getAllTextPaths(n, [...path, i]));
    });
  }
  return array;
};

/**
 * Start from document
 * @param {Value} snapshot
 * @param {Array} leafs
 */
export const getRandomNodePath = (root: Node): Path => {
  const path: Path = [];
  // let currentNode = root;
  while (path.length === 0 || fuzzer.randomInt(3) > 0) {
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

/**
 * We use the Operations.apply function since we expect the apply function to work in Slate
 * @param {Value} snapshot
 */
export const generateAndApplyRandomOp = function (snapshot) {
  // const value = slateType.create(snapshot);
  let index = fuzzer.randomInt(AVAILIBLE_OPS_LEN);
  let op: Operation = genRandOp[index](snapshot);
  const result = _.cloneDeep(snapshot);
  Transforms.transform(result, op);
  return [[op], result];
};

/**
 * Get a random leaf given a snapshot
 * @param {Value} snapshot
 */
interface TextWithPath extends Text {
  path: Path;
}
export const getRandomLeafWithPath = (snapshot: Node): TextWithPath => {
  const paths = getAllTextPaths(snapshot);
  const path = paths[fuzzer.randomInt(paths.length)];

  const t = Node.leaf(snapshot, path);

  return { ...t, path };
};

// insert_text: ['path', 'offset', 'text', 'marks', 'data'],
export const generateRandomInsertTextOp = (
  snapshot,
  randomLeaf = getRandomLeafWithPath(snapshot)
): Operation => {
  // get random leaf path and find the node above it

  return {
    type: 'insert_text',
    path: randomLeaf.path,
    offset: fuzzer.randomInt(randomLeaf.text.length),
    text: fuzzer.randomWord(),
  };
};

// remove_text: ['path', 'offset', 'text', 'marks', 'data'],
export const generateRandomRemoveTextOp = (
  snapshot,
  randomLeaf = getRandomLeafWithPath(snapshot)
): Operation => {
  const offset = fuzzer.randomInt(randomLeaf.text.length);
  const textLength = fuzzer.randomInt(randomLeaf.text.length - offset);

  return {
    type: 'remove_text',
    path: randomLeaf.path,
    offset,
    text: randomLeaf.text.slice(offset, textLength),
  };
};

export const generateRandomNode = (): Node => {
  return {
    type: BLOCKS[fuzzer.randomInt(BLOCKS.length)],
    children: [{ text: fuzzer.randomWord() }],
  };
};

// insert_node: ['path', 'node', 'data']
export const generateRandomInsertNodeOp = (snapshot): Operation => {
  const randomPath = getRandomNodePath(snapshot);

  return {
    type: 'insert_node',
    path: randomPath,
    node: generateRandomNode(),
  };
};

// export const generateRandomRemoveNodeOp = (snapshot) => {
//   const randomPath = getRandomNodePath(snapshot.document);

//   const op = Operation.create({
//     object: 'operation',
//     type: 'remove_node',
//     path: randomPath,
//     data: {},
//   });

//   return op;
// };

// const AVAILIBLE_OPS = ['insert_text', 'remove_text', 'insert_node'];
const AVAILIBLE_OPS = ['insert_node'];
const AVAILIBLE_OPS_LEN = AVAILIBLE_OPS.length;

const genRandOp = [
  // generateRandomInsertTextOp,
  // generateRandomRemoveTextOp,
  generateRandomInsertNodeOp,
];
