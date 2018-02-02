const path = require('path')
const fs = require('fs')
const {promisify} = require('util')
const recursive = require('recursive-readdir')
const fse = require('fs-extra')
const {processAny, getLastStats} = require('./process-any')
const fsStat = promisify(fs.stat)
const fsWriteFile = promisify(fs.writeFile)

const META = path.resolve('./.mtimes.json')

// options:
//
// - ignoreFiles: fn(fileName); returns bool
// - processFileName: fn(sourceFileName, targetFileName, id)
// - processContent: fn(sourceFileName, targetFileName, renderedContent)
// - getTemplateData: fn(sourceFileName, targetFileName) - will work with .templateData or .data
//
async function build (options = {}) {
  let mtimes = {}
  const startTime = process.hrtime()
  const isForce = options.strategy === 'force' // always ignore cache
  const isBuild = options.strategy === 'build' // ignore cache and flush dist

  // read file mtime "db" if exists, otherwise it is
  // either a first run or a forced rebuild
  try {
    if (isForce || isBuild) {
      throw new Error()
    }
    mtimes = require(META)
  } catch (e) {
    if (isBuild) {
      fse.removeSync('./dist')
    }
  }

  let files = await recursive('./src', options.ignoreFiles ? [options.ignoreFiles] : null)
  let stats = await Promise.all(files.map(fn => fsStat(fn)))
  let changed = []
  files.forEach((fn, i) => {
    if (~~mtimes[fn] !== ~~stats[i].mtime) {
      changed.push(fn)
      mtimes[fn] = stats[i].mtime * 1
    }
  })

  // store file modification times
  await fsWriteFile(META, JSON.stringify(mtimes))

  await Promise.all(changed.map(fn => processAny(fn, options)))

  // statistics
  const endTime = Math.floor(process.hrtime(startTime)[1] / 1000000)
  console.info(`(${endTime}ms) ${getLastStats(true)}`)
}

module.exports = build
