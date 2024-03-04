'use strict';

import fs from 'node:fs';
import { convertMarkdownToHTML } from './markdown-converter/markdown-converter.js';
import { isMarkingNested } from './markdown-converter/validation.js';

const main = () => {
  const args = process.argv.slice(2);
  const inputPathIndex = args.indexOf('-in');
  const outputPathIndex = args.indexOf('-out');

  if (inputPathIndex === -1 || args.length <= inputPathIndex + 1) {
    console.error('Error: Input file path not provided');
    process.exit(1);
  }

  const inputPath = args[inputPathIndex + 1];
  const outputPath = outputPathIndex !== -1 && args.length > outputPathIndex + 1 ? args[outputPathIndex + 1] : '';

  try {
    const markdownContent = fs.readFileSync(inputPath, 'utf8');
    const htmlContent = convertMarkdownToHTML(markdownContent);

    if (!isMarkingNested(markdownContent)) {
      const error = new Error('Nested tag was found');
      error.errorCode = 403;
      throw error;
    }

    if (outputPath !== '') fs.writeFileSync(outputPath, htmlContent, 'utf8');
    else console.log(htmlContent);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();