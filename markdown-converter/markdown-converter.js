'use strict';

import {
  backtick,
  htmlTags,
  formattingRules,
  checkForUnclosedTagsOutsideBlock,
} from './validation.js';

const processPreformattedBlock = (result, isPreformattedBlock, isInPreformattedBlock) => {
  isPreformattedBlock[0] = !isPreformattedBlock[0];
  isInPreformattedBlock[0] = true;
  if (isPreformattedBlock[0]) result.push(htmlTags.preformattedBlockOpeningTag);
  else result.push(htmlTags.preformattedBlockClosingTag);
};

const processParagraph = (result, isParagraphOpen, line, isInPreformattedBlock) => {
  const trimmedLine = line.trim();
  if (isInPreformattedBlock[0]) {
    result.push(line + '\n');
    return;
  }

  if (trimmedLine === '') {
    if (isParagraphOpen[0]) {
      result.push(htmlTags.paragraphClosingTag + '\n');
      isParagraphOpen[0] = false;
    }
  } else {
    if (!isParagraphOpen[0]) {
      result.push(htmlTags.paragraphOpeningTag);
      isParagraphOpen[0] = true;
    }
    for (const [regex, replacement] of Object.entries(formattingRules)) {
      line = line.replace(new RegExp(regex, 'g'), replacement);
    }
    result.push(line + '\n');
  }
};

export const convertMarkdownToHTML = (markdown) => {
  const lines = markdown.split('\n');
  const result = [];
  const isParagraphOpen = [false];
  const isPreformattedBlock = [false];
  const isInPreformattedBlock = [false];

  for (const line of lines) {
    if (line.startsWith(backtick)) {
      processPreformattedBlock(result, isPreformattedBlock, isInPreformattedBlock);
      continue;
    }

    if (isPreformattedBlock[0]) {
      result.push(line + '\n');
    } else {
      if (line.trim() === backtick) {
        processPreformattedBlock(result, isPreformattedBlock, isInPreformattedBlock);
        continue;
      }
      processParagraph(result, isParagraphOpen, line, isInPreformattedBlock);
    }
  }

  if (isParagraphOpen[0]) result.push(htmlTags.paragraphClosingTag);

  const htmlContent = result.join('');

  checkForUnclosedTagsOutsideBlock(htmlContent, isInPreformattedBlock);

  if (isPreformattedBlock[0]) {
    const error = new Error('Unclosed tag was found');
    error.errorCode = 403;
    throw error;
  }

  return htmlContent;
};
