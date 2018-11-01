const proxy = new Proxy(new Map(), {
  get: (target, key) => {
    if (typeof key === 'symbol') return target.get(key)
    if (typeof key === 'string') {
      if (/[^0-9]/.test(key)) return target.get(key)
      return Array.from(target.values())[parseInt(key)]
    }
    return Array.from(target.values())[key]
  },
  set: (target, key, value) => !!target.set(key, value)
})
proxy['ID'] = 'DATA'
console.log(proxy['ID'])
console.log(proxy[0])