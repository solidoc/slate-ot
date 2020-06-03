// import { slateType } from '../src/SlateType';
import { Operation, Transforms, Path, Node, Text } from 'slate';
import * as fuzzer from 'ot-fuzzer';
import * as _ from 'lodash';

const AVAILIBLE_OPS = ['insert_text', 'remove_text'];
const AVAILIBLE_OPS_LEN = AVAILIBLE_OPS.length;
// const MARKS = ['mark1', 'mark2', 'mark3', 'mark4', 'mark5'];
// const BLOCKS = ['block1', 'block2', 'block3', 'block4', 'block5'];

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

// /**
//  * Start from document
//  * @param {Value} snapshot
//  * @param {Array} leafs
//  */
// export const getRandomNodePath = (tree) => {
//   const path = [];
//   let currentNode = tree;
//   // generate a random int to see if you will continue
//   while (path.length === 0 || fuzzer.randomInt(3) > 0) {
//     // stop when you get to a leaf
//     if (!currentNode.nodes) {
//       return path;
//     }

//     if (currentNode.nodes.size === 0) {
//       if (path.length === 0) {
//         path.push(0);
//       }

//       return path;
//     }

//     const index = fuzzer.randomInt(currentNode.nodes.size);
//     path.push(index);
//     currentNode = currentNode.nodes.get(index);
//   }

//   return path;
// };

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
  let op: Operation;
  switch (fuzzer.randomInt(AVAILIBLE_OPS_LEN)) {
    case 0:
      op = generateRandomInsertTextOp(snapshot);
      break;
    case 1:
      op = generateRandomRemoveTextOp(snapshot);
      break;
    default:
      throw Error('Error generating random op');
  }
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

// // add_mark: ['path', 'offset', 'length', 'mark', 'data'],
// export const generateRandomAddMarkOp = (
//   snapshot,
//   randomLeaf = getRandomLeafWithPath(snapshot.toJSON().document)
// ) => {
//   const randomPath = randomLeaf.path;

//   const offset = fuzzer.randomInt(randomLeaf.text.length);
//   const op = Operation.create({
//     object: 'operation',
//     type: 'add_mark',
//     path: randomPath.slice(0, randomPath.length - 1),
//     offset,
//     length: fuzzer.randomInt(randomLeaf.text.length - offset),
//     mark: MARKS[fuzzer.randomInt(MARKS.length)],
//     data: {},
//   });
//   return op;
// };

// // remove_mark: ['path', 'offset', 'length', 'mark', 'data'],
// export const generateRandomRemoveMarkOp = (
//   snapshot,
//   randomLeaf = getRandomLeafWithPath(snapshot.toJSON().document)
// ) => {
//   const randomPath = randomLeaf.path;

//   const offset = fuzzer.randomInt(randomLeaf.text.length);
//   const op = Operation.create({
//     object: 'operation',
//     type: 'remove_mark',
//     path: randomPath.slice(0, randomPath.length - 1),
//     offset,
//     length: fuzzer.randomInt(randomLeaf.text.length - offset),
//     mark: MARKS[fuzzer.randomInt(MARKS.length)],
//     data: {},
//   });
//   return op;
// };

// export const generateRandomNode = () => {
//   return {
//     object: 'block',
//     type: BLOCKS[fuzzer.randomInt(BLOCKS.length)],
//     data: {},
//     nodes: [
//       {
//         object: 'text',
//         leaves: [
//           {
//             object: 'leaf',
//             text: fuzzer.randomWord(),
//             marks: [],
//           },
//         ],
//       },
//     ],
//   };
// };

// // insert_node: ['path', 'node', 'data']
// export const generateRandomInsertNodeOp = (snapshot) => {
//   const randomPath = getRandomNodePath(snapshot.document);

//   const op = Operation.create({
//     object: 'operation',
//     type: 'insert_node',
//     path: randomPath,
//     node: generateRandomNode(),
//     data: {},
//   });
//   return op;
// };

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
