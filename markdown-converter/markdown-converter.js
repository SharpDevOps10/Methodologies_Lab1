'use strict';

const TagMap = {
  '\\*\\*(.*?)\\*\\*': '<b>$1</b>',
  '\\b_(.*?)_\\b': '<i>$1</i>',
  '`([^`]+)`': '<tt>$1</tt>',
};

const paragraphOpeningTag = '<p>';
const paragraphClosingTag = '</p>';

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
    if (isPreformattedBlock[0]) result.push(line + '\n');
    else processParagraph(result, isParagraphOpen, line);
  }

  if (isParagraphOpen[0]) result.push(paragraphClosingTag + '\n');

  return result.join('');
}

module.exports = { convertMarkdownToHTML };
