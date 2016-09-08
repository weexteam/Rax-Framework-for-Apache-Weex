const easyfile = require('easyfile');
const path = require('path');
const request = require('request');
const async = require('async');
const builtinModules = require('./builtinModules');

async.map(builtinModules, function(moduleName, callback){
  const url = 'http://g.alicdn.com/kg/' + moduleName + '/index.nv.js';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(`Success request ${(body.length/1024).toFixed(2)}kb "${moduleName}" (${body.substr(0, 30)}...)`)
      callback(null, body); // Show the HTML for the Google homepage.
    } else {
      console.error(`Failed request "${moduleName}": ${url}`);
      callback(error);
    }
  });
}, function(err, results){
  const code = results.join('\n');
  const moduleCode = 'module.exports = ' + JSON.stringify(code);

  const targetFile = path.join(__dirname, '../build/builtinModulesCode.js');
  easyfile.write(targetFile, moduleCode, {force: true});
  console.log(`Generate builtinModulesCode (${(moduleCode.length/1024).toFixed(2)}kb) to ${targetFile} `);
});
