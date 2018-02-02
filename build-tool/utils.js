const fs = require('fs')

// checks if two files' modification times are different
// returns promise, only resolve bool
function areFileTimesDifferent (source, target, graceDivider = 1000) {
  return new Promise((resolve, reject) =>
    fs.stat(source, (err, sSt) => {
      return err ? reject(err) : fs.stat(target, (err, tSt) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve(false) // target doesn't exist
          }
          return reject(err)
        }
        let trunc = t => Math.floor(t / graceDivider)
        let mSame = trunc(sSt.mtime) === trunc(tSt.mtime)
        return resolve(mSame)
      })
    }))
}

module.exports = {
  areFileTimesDifferent
}
