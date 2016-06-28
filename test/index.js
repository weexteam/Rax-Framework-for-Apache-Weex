import * as framework from '../src/'
import {Document, Element} from './__mocks__/document'
import * as modules from './__mocks__/modules'
import components from './__mocks__/components'

function sendTasks(...args) {
  console.log(...args)
}

framework.init({
  Document,
  Element,
  sendTasks,
})

framework.registerModules(modules)
framework.registerComponents(components)

let id = '1';
let code = `
  define("foo", function(require, exports, module){
    var modal = require("@weex-module/modal");
    modal.alert('hi', function(){ console.log('hi callback') });
    module.exports = "bar";
  });
  var foo = require("foo");
`
let options = {
  bundleUrl: 'http://example.com',
  debug: true
}
framework.createInstance(id, code, options)

framework.recieveTasks(id, [{
  method: 'callback',
  args: ['1', {a: 100, b: 200}, true]
}])
