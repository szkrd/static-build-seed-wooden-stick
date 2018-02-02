const fs = require('fs')
const fse = require('fs-extra')
const ejs = require('ejs')
const less = require('less')
const {promisify} = require('util')

const ejsRenderFile = promisify(ejs.renderFile)
const fsReadFile = promisify(fs.readFile)
const fsWriteFile = promisify(fs.writeFile)

const NOW = Date.now()
const nop = id => id
const saveTarget = (from, to) => (s, t) => t.replace(new RegExp(`\.${from}$`), `.${to}`)
const touch = fn => fse.ensureFile(fn)

// safe file write with mkdir -p
function writeFile (target, content) {
  return touch(target)
    .then(() => fsWriteFile(target, content))
}

// common options:
//
// - processFileName: fn(sourceFileName, targetFileName, id)
// - processContent: fn(sourceFileName, targetFileName, renderedContent)
//
// ---------

// process ejs template
// @returns promise
function processEjs (source, target, options) {
  const id = 'ejs'
  const toExt = 'html'

  const getTemplateData = options.getTemplateData || (() => (options.templateData || options.data || {}))
  const processFileName = options.processFileName || saveTarget(id, toExt)
  const processContent = options.processContent || nop
  target = processFileName(source, target, id)

  const data = getTemplateData(source, target)
  if (!data.version) { // let me help
    data.version = NOW
  }

  return ejsRenderFile(source, data, {}).then(s => {
    s = processContent(source, target, s)
    return writeFile(target, s)
  })
}

// process plain css
// @returns promise
function processCss (source, target, options) {
  const id = 'css'

  const processFileName = options.processFileName || ((s, t) => t)
  const processContent = options.processContent || nop
  target = processFileName(source, target, id)

  return fsReadFile(source, 'utf-8')
    .then(s => {
      s = processContent(source, target, s)
      return writeFile(target, s)
    })
}

// process less
// @returns promise
function processLess (source, target, options) {
  let id = 'less'
  const toExt = 'css'

  const processFileName = options.processFileName || saveTarget(id, toExt)
  const processContent = options.processContent || nop
  target = processFileName(source, target, id)

  return fsReadFile(source, 'utf-8')
    .then(s => less.render(s, {sourceMap: {sourceMapFileInline: true}}))
    .then(s => {
      s = processContent(source, target, s.css)
      return writeFile(target, s)
    })
}

module.exports = {
  processEjs,
  processCss,
  processLess
}
