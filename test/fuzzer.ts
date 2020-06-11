/* eslint-disable no-console */
import { slateType } from '../src/SlateType';
import { createEditor, Element, Editor } from 'slate';
import * as _ from 'lodash';
import { generateAndApplyRandomOp } from './op-generator';
import * as fuzzer from 'ot-fuzzer';

const testDoc: Element = {
  children: [
    {
      type: 'paragraph',
      children: [{ text: 'ABC' }, { text: 'Test' }],
    },
    {
      type: 'checklist',
      children: [{ text: '123' }, { text: 'xyz' }],
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
