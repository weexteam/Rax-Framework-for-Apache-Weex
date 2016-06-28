import * as framework from '../src/'
import Document from './__mocks__/document'
import modules from './__mocks__/modules'

function sendTasks() {

}

framework.init({
  Document,
  sendTasks,
})

framework.registerModules(modules)
