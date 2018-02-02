const path = require('path')
const fs = require('fs')
const {promisify} = require('util')
const recursive = require('recursive-readdir')
const fse = require('fs-extra')
const {areFileTimesDifferent} = require('./utils')
const {processCss, processEjs, processLess} = require('./processors')

const fsStat = promisify(fs.stat)
const fsUtimes = promisify(fs.utimes)
const fsWriteFile = promisify(fs.writeFile)

const outputStats = {ejs: 0, css: 0, less: 0, other: 0}

// options:
// - processFileName: fn(sourceFileName, targetFileName, id)
// - processContent: fn(sourceFileName, targetFileName, renderedContent)
// - getTemplateData: fn(sourceFileName, targetFileName) - will work with .templateData or .data
//
// @returns promise
function processAny (source, options) {
  let target = source.replace('src', 'dist')

  if (source.endsWith('.ejs')) {

    outputStats.ejs++
    return processEjs(source, target, options)

  } else if (source.endsWith('.css')) {

    outputStats.css++
    return processCss(source, target, options)

  } else if (source.endsWith('.less')) {

    outputStats.less++
    return processLess(source, target, options)

  } else {

    // add other file handlers here...

    return areFileTimesDifferent(source, target)
      .then(same => {
        if (same) {
          return Promise.resolve()
        }
        outputStats.other++
        return fse.ensureFile(target)
          .then(() => fse.copy(source, target, {preserveTimestamps: true}))
      })

  }
}

function getLastStats (prettyString) {
  if (prettyString) {
    return Object.keys(outputStats).map(key => `${key}: ${outputStats[key]}`).join(', ')
  } else {
    return outputStats
  }
}

module.exports = {
  processAny,
  getLastStats
}
