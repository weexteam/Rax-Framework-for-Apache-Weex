import assert from 'assert'
import * as framework from '../src/'
import {Document, Element} from './__mocks__/document'
import * as modules from './__mocks__/modules'
import components from './__mocks__/components'

let id = '1'
let code = `
  define("foo", function(require, exports, module){
    var modal = require("@weex-module/modal");
    modal.alert('hi', function(data){ console.log(data) });
    module.exports = "bar";
  });
  var foo = require("foo");
`
let options = {
  bundleUrl: 'http://example.com',
  debug: true
}

let taskList = [
  [ { module: 'modal', method: 'alert', args: [ 'hi', '1' ] } ],
  [ { module: 'dom', method: 'updateFinish', args: [] } ]
]

let counter = 0;
let sendTasks = (instanceId, tasks) => {
  assert.equal(instanceId, id)
  assert.deepEqual(tasks, taskList[counter])
  counter++
};

framework.init({
  Document,
  Element,
  sendTasks,
})

framework.registerModules(modules)
framework.registerComponents(components)

framework.createInstance(id, code, options)

framework.recieveTasks(id, [{
  method: 'callback',
  args: ['1', {foo: 1}]
}])

let instance = framework.getInstance(id)

assert.equal(instance.instanceId, id)

assert.deepEqual(instance.callbacks, [ , null])

assert.deepEqual(framework.getRoot(id), {})

let id2 = 2
let code2 = `
  define("foo", function(require, exports, module){
    var modal = require("@weex-module/modal");
    modal.alert('hi', function(data){ console.log(data) });
    module.exports = "bar";
  });
  var foo = require("foo");
`
let counter2 = 0;
let sendTasks2 = (instanceId, tasks) => {
  assert.equal(instanceId, id2)
  assert.deepEqual(tasks, taskList[counter2])
  counter2++
};

framework.init({
  Document,
  Element,
  sendTasks: sendTasks2,
})

framework.registerModules(modules)
framework.registerComponents(components)

framework.createInstance(id2, code2, options)

framework.recieveTasks(id2, [{
  method: 'callback',
  args: ['1', {bar: 1}, true]
}])
