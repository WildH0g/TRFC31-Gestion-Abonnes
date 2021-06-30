// jshint esversion: 9

function doGet(e) {
  const html = HtmlService.createTemplateFromFile('index').evaluate();
  return html;
}

const runFunc = (func, args) => {
  return User[func](...args);
};

function include(filename) {
  Logger.log(`including file ${filename}`);
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}
