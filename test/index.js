import assert from 'assert'
import * as framework from '../src/'
import {Document, Element} from './__mocks__/document'
import * as modules from './__mocks__/modules'
import components from './__mocks__/components'

let id = '1'
let code = `
  define("foo", function(require, exports, module){
    var modal = require("@weex-module/modal");
    var Rx = require("kg/rx/index");
    console.log('rx', typeof Rx.Component === 'function');

    var Components = require("kg/rx-components/index");
    console.log('rx-compnents', typeof Components.Image === 'function');

    var Animated = require('kg/rx-animated/index');
    console.log('rx-animated', typeof Animated.createAnimatedComponent === 'function');

    var Env = require('kg/rx-env/index');
    console.log('rx-env', Env.isWeb === false);

    var Dimensions = require('kg/rx-dimensions/index');
    console.log('rx-dimensions', typeof Dimensions.get === 'function');

    var PanResponder = require('kg/rx-panresponder/index');
    console.log('rx-panresponder', typeof PanResponder.create === 'function');

    var Fetch = require('kg/rx-fetch/index');
    console.log('rx-fetch', typeof Fetch === 'function');

    var Location = require('kg/rx-location/index');
    console.log('rx-location', typeof Location === 'object');

    var Downgrade = require('kg/rx-downgrade/index');
    console.log('rx-downgrade', typeof Downgrade.setting === 'function');

    var Toast = require('kg/rx-toast/index');
    console.log('rx-toast', typeof Toast.show === 'function');

    var User = require('kg/rx-user/index');
    console.log('rx-user', typeof User === 'object');

    var Spm = require('kg/rx-spm/index');
    console.log('rx-spm', typeof Spm === 'object');

    var goldlog = require('kg/rx-goldlog/index');
    console.log('rx-goldlog', typeof goldlog === 'object');

    var mtop = require('kg/rx-mtop/index');
    console.log('rx-mtop', typeof mtop === 'object');

    var mounter = require('kg/rx-mounter/index');
    console.log('rx-mounter', typeof mounter === 'object');

    // var Windvane = require('kg/rx-windvane/index');
    // console.log('rx-windvane', typeof Windvane.call === 'function');

    // var Window = require('kg/rx-window/index');
    // console.log('rx-window', typeof Window === 'object');

    modal.alert('hi', function(data){ console.log('alert callback data', data) });
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
    modal.alert('hi', function(data){ console.log('alert callback data', data) });
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
