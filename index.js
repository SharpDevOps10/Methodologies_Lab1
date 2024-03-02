'use strict';

const fs = require('fs');
const { convertMarkdownToHTML } = require('./markdown-converter/markdown-converter.js');

function main() {
  const args = process.argv.slice(2);
  const inputPathIndex = args.indexOf('-in');
  const outputPathIndex = args.indexOf('-out');

  if (inputPathIndex === -1 || args.length <= inputPathIndex + 1) {
    console.error('Error: Input file path not provided.');
    process.exit(1);
  }

  const inputPath = args[inputPathIndex + 1];
  const outputPath = outputPathIndex !== -1 && args.length > outputPathIndex + 1 ? args[outputPathIndex + 1] : '';

  try {
    const markdownContent = fs.readFileSync(inputPath, 'utf8');
    const htmlContent = convertMarkdownToHTML(markdownContent);

    if (outputPath !== '') fs.writeFileSync(outputPath, htmlContent, 'utf8');
    else console.log(htmlContent);

  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();