class DeepArray extends Array {
  size() { return this.expand().length }
  expand() { return DeepArray.Expand(this) }
  static Expand(arr) { return arr.reduce((flat, toFlatten) => flat.concat(Array.isArray(toFlatten) ? DeepArray.Expand(toFlatten) : toFlatten), []) }
}
console.log(new DeepArray(["a", "b"], [1, 2], 5).size())