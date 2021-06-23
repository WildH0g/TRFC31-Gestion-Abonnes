// jshint esversion: 9

const fs = require('fs');

const scriptFiles = [
  'UserManagement.ignore.js',
  'Utils.ignore.js',
];


const htmlFiles = [
  'UserManagementJS.html',
  'UtilsJS.html'
];

const copy = (source, target, i = 0) => {
  console.log(`copying ${source[i]} -> ${target[i]}`);
  fs.readFile(source[i], 'utf8', (err, data) => {
    if (err) return console.log(err);
    const html = `<script>\n${data}\n</script>`;
    fs.writeFile(target[i], html, err => err && console.log(err));
    if (i === source.length - 1) return;
    copy(source, target, ++i);
  });
};

copy(scriptFiles, htmlFiles);
