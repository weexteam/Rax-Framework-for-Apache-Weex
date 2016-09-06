const easyfile = require('easyfile');
const path = require('path');
const request = require('request');
const async = require('async');

const builtinModules = [
  'rx/0.1.18',
  'rx-env/0.0.8',
  'rx-dimensions/0.0.9',
  'rx-fetch/0.0.11',
  'rx-downgrade/0.0.5',
  'rx-animated/0.1.1',
  'rx-panresponder/0.0.4',
  'rx-toast/0.0.9',
  'rx-alert/0.0.6',
  'rx-location/0.0.7',
  'rx-mtop/0.0.8',
  'rx-user/0.0.6',
  'rx-windvane/0.0.3',
  'rx-spm/0.0.6',
  'rx-goldlog/0.1.0',
  'rx-window/0.0.14',
  'rx-mounter/0.0.5',
  'rx-components/0.1.3'
];

const builtinModulesCode = {};

async.map(builtinModules, function(moduleName, callback){
  const url = 'http://g.alicdn.com/kg/' + moduleName + '/index.nv.js';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(`Success request "${moduleName}" (${body.substr(0, 30)}...)`)
      callback(null, body); // Show the HTML for the Google homepage.
    } else {
      console.error(`Failed request "${moduleName}": ${url}`);
      callback(error);
    }
  });
}, function(err, results){
  const code = results.join('\n');
  const moduleCode = 'module.exports = ' + JSON.stringify(code);

  const targetFile = path.join(__dirname, '../src/builtinModulesCode.js');
  easyfile.write(targetFile, moduleCode, {force: true});
  console.log(`Generate builtinModulesCode to ${targetFile}`);
});
