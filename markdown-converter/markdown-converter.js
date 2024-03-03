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

function processPreformattedBlock(result, isPreformattedBlock, isInPreformattedBlock) {
  isPreformattedBlock[0] = !isPreformattedBlock[0];
  isInPreformattedBlock[0] = true;
  if (isPreformattedBlock[0]) result.push(preformattedBlockOpeningTag);
  else result.push(preformattedBlockClosingTag);
}

function processParagraph(result, isParagraphOpen, line, isInPreformattedBlock) {
  const trimmedLine = line.trim();
  if (isInPreformattedBlock[0]) {
    result.push(line + '\n');
    return;
  }

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

function countUnclosedTags(markdownContent, regex) {
  const tagRegex = /[A-Za-z0-9,]/;
  let count = 0;
  let tagMatch;

  while ((tagMatch = regex.exec(markdownContent)) !== null) {
    const [fullMatch] = tagMatch;
    const tagStart = tagMatch.index > 0 && markdownContent[tagMatch.index - 1].match(tagRegex);
    const tagEnd = tagMatch.index + fullMatch.length < markdownContent.length && markdownContent[tagMatch.index + fullMatch.length].match(tagRegex);

    const isTagSurrounded = tagStart && tagEnd;
    if (!isTagSurrounded) count++;
  }

  return count;
}

function hasUnclosedTags(markdownContent, regex) {
  const countTags = countUnclosedTags(markdownContent, regex);
  return countTags % 2 !== 0;
}

function checkForUnclosedTagsOutsideBlock(markdownContent, isInPreformattedBlock) {
  const tagRegexArray = [/\*\*/g, /_/g, /`/g, /```/g];

  if (!isInPreformattedBlock[0] && tagRegexArray.some(tagRegex => hasUnclosedTags(markdownContent, tagRegex))) {
    throw new Error('Unclosed Tag');
  }
}

function convertMarkdownToHTML(markdown) {
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


  if (isParagraphOpen[0]) result.push(paragraphClosingTag);

  const htmlContent = result.join('');

  checkForUnclosedTagsOutsideBlock(htmlContent, isInPreformattedBlock);

  if (isPreformattedBlock[0]) throw new Error('Unclosed Tag');

  return htmlContent;
}

module.exports = { convertMarkdownToHTML };
