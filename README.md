# Static build seed wooden stick

Build static resources without gulp or webpack for projects as complex as a wooden stick.

- Requires node v9+
- The build tool has _no watcher_ use _nodemon_, _chokidar_ or whatever you want for watching
- It uses _mtimes_ for change detection
- Supports `ejs` and `less` out of the box
- Source folder is `src`, target folder is `dist` (hardcoded)
- Hooks:
  - ignore filename: [recursive-readdir](https://www.npmjs.com/package/recursive-readdir)'s ignore function
  - inject template data (ejs): `getTemplateData(source, target)`
  - postprocess content (html, css, less): `processContent(source, target, content)`
  - process file naming: `processFileName(source, target, context)`
- Build strategies:
  - `lazy`: build changed files (not exactly useful with template includes of course), this is the default
  - `force`: ignore mtimes for editable content (so images won't be copied needlessly for example)
  - `build`: bust cache, destroy dist, rebuild everything
- See [index.js](./index.js) for examples

## Tips and tricks

- `npm run serve` to serve the dist folder (or just use WebStorm's builtin seerver)
- Use script links and style links
- Use `<%= version %>` for a build timestamp
- To use a `vendor.js`: create a vendor.ejs, include whatever you need and then hook into the file renamer
  (or just use an external CDN)
- No minification, no js transpilation, no polyfills, no postcss
