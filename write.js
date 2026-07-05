const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'App_content.js'), 'utf8');
fs.writeFileSync('App.js', content);
console.log('Written! Lines:', content.split('\n').length);
