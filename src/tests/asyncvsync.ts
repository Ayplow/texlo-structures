import {readdir, readdirSync} from 'fs'
import {promisify} from 'util'
import { performance } from 'perf_hooks';
// const readdirAsync = (path, options?) => new Promise((s,f) => s(readdirSync(path, options)))
const readdirAsync = promisify(readdir)
setInterval(() => console.log('spam'), 1)
const start = performance.now()
readdirAsync('.').then(files => {
  const end = performance.now()
  console.log(end - start)
})
// readdirsync 0.3
// readdirasync 1.7