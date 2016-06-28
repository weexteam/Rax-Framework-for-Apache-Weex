'use strict'

let NativeComponents = {}
let NativeModules = {}

let Document
let Element
let Comment
let sendTasks

const instanceMap = {}

function getInstance(instanceId) {
  const instance = instanceMap[instanceId]
  if (!instance) {
    throw new Error(`Invalid instance id "${instanceId}"`)
  }
  return instance;
}

export function init (cfg) {
  Document = cfg.Document
  Element = cfg.Element
  Comment = cfg.Comment
  sendTasks = cfg.sendTasks
}

/**
 * register the name of each native component
 * @param  {array} components array of name
 */
export function registerComponents (components) {
  if (Array.isArray(components)) {
    components.forEach(function register (name) {
      /* istanbul ignore if */
      if (!name) {
        return
      }
      if (typeof name === 'string') {
        NativeComponents[name] = true
      }
      else if (typeof name === 'object' && typeof name.type === 'string') {
        NativeComponents[name.type] = name
      }
    })
  }
}

/**
 * register the name and methods of each api
 * @param  {object} apis a object of apis
 */
export function registerMethods (apis) {
  if (typeof apis === 'object') {
    // Noop
  }
}

/**
 * register the name and methods of each module
 * @param  {object} modules a object of modules
 */
export function registerModules (newModules) {
  if (typeof newModules === 'object') {
    NativeModules = newModules
  }
}

function genNativeModules(instanceId) {
  const prefix = '@weex-module/'
  let modules = {}

  if (typeof newModules === 'object') {
    for (let name in NativeModules) {
      name = prefix + name

      modules[name] = {
        module: {exports: {}},
        isInitialized: true,
      }

      NativeModules[name].forEach(method => {
        let defaultArgs = method.args

        modules[name].module.exports[method.name] = (...args) => {
          const finalArgs = []
          defaultArgs.forEach((arg, index) => {
            const value = args[index]
            finalArgs[index] = normalize(value, instance)
          })

          sendTasks(String(instanceId), [{ module: name, method: methodName, args: finalArgs }])
        }

      })
    }
  }

  return modules
}


/**
 * create a Weex instance
 *
 * @param  {string} instanceId
 * @param  {string} code
 * @param  {object} [options] option `HAS_LOG` enable print log
 * @param  {object} [data]
 */
export function createInstance (instanceId, code, options /* {bundleUrl, debug} */, data) {
  let instance = instanceMap[instanceId]

  if (!instance) {
    let document = new Document(instanceId, options.bundleUrl)
    let modules = genNativeModules(instanceId)
    instanceMap[instanceId] = {
      document,
      instanceId,
      modules,
      callbacks: [],
      callbackId: 1
    }

    function def(id, deps, factory) {

      if (deps instanceof Function) {
        factory = deps
        deps = []
      }

      modules[id] = {
        factory: factory,
        deps: deps,
        module: {exports: {}},
        isInitialized: false,
        hasError: false,
      }
    }

    function req(id) {

      var mod = modules[id]

      if (mod && mod.isInitialized) {
        return mod.module.exports
      }

      if (!mod) {
        throw new Error(
          'Requiring unknown module "' + id + '"'
        )
      }

      if (mod.hasError) {
        throw new Error(
          'Requiring module "' + id + '" which threw an exception'
        )
      }

      try {
        mod.isInitialized = true
        mod.factory(req, mod.module.exports, mod.module)

      } catch (e) {
        mod.hasError = true
        mod.isInitialized = false
        throw e
      }

      return mod.module.exports
    }

    let init = new Function(
      'define',
      'require',
      '__d',
      '__r',
      'document',
      code
    )

    init(
      def,
      req,
      def,
      req,
      document
    )
  } else {
    throw new Error(`Instance id "${instanceId}" existed when create instance`)
  }

}

/**
 * refresh a Weex instance
 *
 * @param  {string} instanceId
 * @param  {object} data
 */
export function refreshInstance (instanceId, data) {
  let instance = getInstance(instanceId)
  let document = instance.document
  document.documentElement.fireEvent('refresh', {
    timestamp: Date.now()
  })
}

/**
 * destroy a Weex instance
 * @param  {string} instanceId
 */
export function destroyInstance (instanceId) {
  let instance = getInstance(instanceId)
  let document = instance.document
  document.documentElement.fireEvent('destory', {
    timestamp: Date.now()
  })

  document.destroy()
  delete instanceMap[instanceId]
}

/**
 * get a whole element tree of an instance
 * for debugging
 * @param  {string} instanceId
 * @return {object} a virtual dom tree
 */
export function getRoot (instanceId) {
  let instance = getInstance(instanceId)
  let document = instance.document
  let body = document.body
  return body.toJSON ? body.toJSON() : {}
}


/**
 * accept calls from native (event or callback)
 *
 * @param  {string} instanceId
 * @param  {array} tasks list with `method` and `args`
 */
export function recieveTasks (instanceId, tasks) {
  let instance = getInstance(instanceId)
  if (Array.isArray(tasks)) {
    const { callbacks, document } = instance
    tasks.forEach(task => {
      if (task.method === 'fireEvent') {
        let [nodeId, type, e, domChanges] = task.args
        let el = document.getRef(nodeId)
        document.fireEvent(el, type, e, domChanges)
      }
      if (task.method === 'callback') {
        let [callbackId, data, ifKeepAlive] = task.args
        let callback = callbacks[callbackId]
        if (typeof callback === 'function') {
          callback(data)
          if (typeof ifKeepAlive === 'undefined' || ifKeepAlive === false) {
            callbacks[callbackId] = undefined
          }
        }
      }
    })

    sendTasks(String(instanceId), [{ module: 'dom', method: 'updateFinish', args: [] }])
  }
}

function normalize (v, instance) {
  const type = typof(v)

  switch (type) {
    case 'undefined':
    case 'null':
      return ''
    case 'regexp':
      return v.toString()
    case 'date':
      return v.toISOString()
    case 'number':
    case 'string':
    case 'boolean':
    case 'array':
    case 'object':
      if (v instanceof Element) {
        return v.ref
      }
      return v
    case 'function':
      instance.callbacks[++instance.callbackId] = v
      return instance.callbackId.toString()
    default:
      return JSON.stringify(v)
  }
}

function typof (v) {
  const s = Object.prototype.toString.call(v)
  return s.substring(8, s.length - 1).toLowerCase()
}
