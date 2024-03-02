'use strict';

const TagMap = {
  '\\*\\*(.*?)\\*\\*': '<b>$1</b>',
  '\\b_(.*?)_\\b': '<i>$1</i>',
  '`([^`]+)`': '<tt>$1</tt>',
};

const paragraphOpeningTag = '<p>';
const paragraphClosingTag = '</p>';
const backtick = '```';
const preformattedBlockOpeningTag = '<pre>\n';
const preformattedBlockClosingTag = '</pre>\n';

function processPreformattedBlock(result, isPreformattedBlock) {
  isPreformattedBlock[0] = !isPreformattedBlock[0];
  if (isPreformattedBlock[0]) result.push(preformattedBlockOpeningTag);
  else result.push(preformattedBlockClosingTag);
}

function processParagraph(result, isParagraphOpen, line) {
  const trimmedLine = line.trim();
  if (trimmedLine === '') {
    if (isParagraphOpen[0]) {
      result.push(paragraphClosingTag + '\n');
      isParagraphOpen[0] = false;
    }
  } else {
    if (!isParagraphOpen[0]) {
      result.push(paragraphOpeningTag);
      isParagraphOpen[0] = true;
    }
    for (const [regex, replacement] of Object.entries(TagMap)) {
      line = line.replace(new RegExp(regex, 'g'), replacement);
    }
    result.push(line + '\n');
  }
}

function convertMarkdownToHTML(markdown) {
  const lines = markdown.split('\n');
  const result = [];
  const isPreformattedBlock = [false];
  const isParagraphOpen = [false];

  for (const line of lines) {
    if (line.startsWith(backtick)) {
      processPreformattedBlock(result, isPreformattedBlock);
      continue;
    }
    if (isPreformattedBlock[0]) result.push(line + '\n');
    else processParagraph(result, isParagraphOpen, line);
  }

  if (isParagraphOpen[0]) result.push(paragraphClosingTag + '\n');

  if (isPreformattedBlock[0]) result.push(preformattedBlockClosingTag);

  return result.join('');
}

module.exports = { convertMarkdownToHTML };
