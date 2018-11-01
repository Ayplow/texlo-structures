(new require('benchmark').Suite())
  .add('Baseline - Nothing Executed', () => {})
  .add('Certain | Defined', {
    fn:() => {
      source = { type: 'rich' }
      target = {}
      target.type = source.type
      fetched = target.type
    },
    minSamples: 100
  })
  .add('Certain | Undefined', {
    fn: () => {
      source = {}
      target = {}
      target.type = source.type
      fetched = target.type
    },
    minSamples: 100
  })
  .add('Uncertain | Defined', {
    fn:() => {
      source = { type: 'rich' }
      target = {}
      if (source.type) target.type = source.type
      fetched = target.type
    },
    minSamples: 100
  })
  .add('Uncertain | Undefined', {
    fn: () => {
      source = {}
      target = {}
      if (source.type) target.type = source.type
      fetched = target.type
    },
    minSamples: 100
  })
  .on('complete', results => console.log(results.currentTarget.map(target => `${target}`).join('\n')))
  .run({ async: true })