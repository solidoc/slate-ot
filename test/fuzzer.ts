/* eslint-disable no-console */
import { slateType } from '../src/SlateType';
import { createEditor, Element, Editor } from 'slate';
import * as _ from 'lodash';
import { generateAndApplyRandomOp } from './op-generator';
// const fuzzer = require('ot-fuzzer');
import * as fuzzer from 'ot-fuzzer';

const testDoc: Element = {
  children: [
    {
      type: 'paragraph',
      // children: [{ text: 'A line of text in a paragraph.' }, { text: 'Test' }],
      children: [{ text: 'A quick brown fox jumps over the lazy dog.' }],
    },
  ],
};
/**
 * Overload slateType create function for easier random op generation
 */
slateType.create = function (init: Element) {
  console.log('called create in SlateType');
  init = _.cloneDeep(testDoc);
  const e = createEditor();
  e.children = init.children;
  return <Editor>init;
};

fuzzer(slateType, generateAndApplyRandomOp, 1000);
