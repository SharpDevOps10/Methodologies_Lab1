'use strict';

export const formattingRules = {
  '\\*\\*(.*?)\\*\\*': '<b>$1</b>',
  '(?<![\\w`*\\u0400-\\u04FF])_(\\S(?:.*?\\S)?)_(?![\\w`*\\u0400-\\u04FF])': '<i>$1</i>',
  '`([^`\\u0400-\\u04FF]+)`': '<tt>$1</tt>',
};

export const htmlTags = {
  preformattedBlockOpeningTag: '<pre>\n',
  preformattedBlockClosingTag: '</pre>',
  paragraphOpeningTag: '<p>',
  paragraphClosingTag: '</p>',
};

export const backtick = '```';

const countUnclosedTags = (markdownContent, regex) => {
  const tagRegex = /[A-Za-z0-9,\u0400-\u04FF]/;
  let count = 0;
  let tagMatch;

  while ((tagMatch = regex.exec(markdownContent)) !== null) {
    const [fullMatch] = tagMatch;
    const tagStart = tagMatch.index > 0 && markdownContent[tagMatch.index - 1].match(tagRegex);
    const tagEnd = tagMatch.index + fullMatch.length < markdownContent.length
      && markdownContent[tagMatch.index + fullMatch.length].match(tagRegex);

    const isTagSurrounded = ((!tagStart && !tagEnd) || (tagStart && tagEnd));
    if (!isTagSurrounded) count++;
  }

  return count;
};

const hasUnclosedTags = (markdownContent, regex) => {
  const countTags = countUnclosedTags(markdownContent, regex);
  return countTags % 2 !== 0;
};

export const checkForUnclosedTagsOutsideBlock = (markdownContent, isInPreformattedBlock) => {
  const tagRegexArray = [/\*\*/g, /_/g, /`/g, /```/g];

  if (!isInPreformattedBlock[0] && tagRegexArray.some(tagRegex => hasUnclosedTags(markdownContent, tagRegex))) {
    const error = new Error('Unclosed tag was found');
    error.errorCode = 403;
    throw error;
  }
};

export const isMarkingNested = (markdown) => {
  const validTags = ['**', '`', '_'];
  let iPreformatted = false;
  let openTags = [];

  for (let i = 0; i < markdown.length; i++) {
    if (markdown.startsWith(backtick, i)) {
      iPreformatted = !iPreformatted;
      i += 2;
      continue;
    }

    if (iPreformatted) continue;

    for (const marker of validTags) {
      if (markdown.startsWith(marker, i)) {
        const isUnderscore = marker === '_';
        const prevChar = i > 0 ? markdown[i - 1] : '';
        const nextChar = i < markdown.length - 1 ? markdown[i + 1] : '';

        if (isUnderscore) {
          const isWordBefore = prevChar.match(/[A-Za-z0-9\u0400-\u04FF]/);
          const isWordAfter = nextChar.match(/[A-Za-z0-9\u0400-\u04FF]/);
          const isNonWordSpaceBefore = prevChar.match(/[^\w\s\u0400-\u04FF]/);
          const isNonWordSpaceAfter = nextChar.match(/[^\w\s\u0400-\u04FF]/);

          if ((isWordBefore && isWordAfter) || (isNonWordSpaceBefore && isNonWordSpaceAfter)) continue;
        }

        if (openTags.length > 0 && openTags[openTags.length - 1] !== marker) return false;

        if (openTags.length > 0 && openTags[openTags.length - 1] === marker) openTags.pop();
        else openTags.push(marker);

        i += marker.length - 1;
        break;
      }
    }
  }

  return true;
};