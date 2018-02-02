// usage:
//
// - `node .` = build only the top level resources, not the ignored ones (fastest, least reliable)
// - `node . force` = always build ejs and css, but try to avoid everything else (if not changed in the last 1sec)
// - `node . build` = build everything
//
const path = require('path')
const build = require('./build-tool/build')

/*
// example file name processor callback
function processFileName (sourceFn, targetFn) {
  const rules = {
    vendor: {from: /vendor\.ejs$/, to: 'vendor.js'},
    ejs: {from: /\.ejs$/, to: '.html'},
    less: {from: /\.less$/, to: '.css'}
  }
  return Object.values(rules).reduce((acc, rule) => {
    acc = acc.replace(rule.from, rule.to)
    return acc
  }, targetFn)
}
*/

// files ignored by the recursive iterator (and the watcher too!)
function ignoreFiles (fn) {
  const baseName = path.basename(fn)
  return baseName.startsWith('_')
}

// process ejs/css/less for plain replaces
// (copied resources are NOT processed)
function processContent (sourceFn, targetFn, content) {
  if (/\.(html)$/.test(targetFn)) {
    content = content.replace(/gorgonzola/g, 'camembert')
  }
  return content
}

build({
  // all of these props are optional
  ignoreFiles,
  processFileName: null,
  processContent,
  templateData: {
    version: Date.now(),
    title: 'A cheesy example'
  },
  strategy: {force: 'force', build: 'build'}[process.argv[2]] || 'lazy'
})
