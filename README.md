# Markdown to HTML converter 

This is a tool for converting Markdown text format into HTML. The core functionality includes handling 
various tags such as bold text (**), monospaced text (`), and italic text (_). In addition, processing of code blocks using 
backticks has been implemented. The program also includes error handling, such as detection of unclosed and nested tags.
Furthermore, it is possible to output the result as HTML or write it to a file. 

# Installation

1. First and foremost, you need to make sure that you have installed [Node.js](https://nodejs.org/en) 
2. After that, you have to clone this repository and enter the working folder :
```bash
$ git clone https://github.com/SharpDevOps10/Methodologies_Lab1
$ cd Methodologies_Lab1
```
3. In order to start using the project you have to run the main `index.js` file with input Markdown file :
```bash
$ node index.js -in input/1-common-marking.md
```

# Usage 
The input folder has a lot of examples of both correct and invalid Markdown markup, so you can use them to test this convertor. 
This program can work in two modes: 
1. The application outputs the generated HTML markup to the standard output (stdout), if `-out` flag is not provided
```bash
$ node index.js -in input/1-common-marking.md
```
2. If there is an argument with the output file (`-out` flag), the application outputs HTML to the output file
```bash
$ node index.js -in input/1-common-marking.md -out output/1-common-marking.html
```

# Revert commit link

[Here you can find revert commit](https://github.com/SharpDevOps10/Methodologies_Lab1/commit/b025406f8fb6a1f109db3f7c6ea23e05fbb666c5)