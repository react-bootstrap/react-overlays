
function exampleLoader(source){
  if (this.cachable) {
    this.cachable();
  }

  source = source
    .replace(/import.+$/gm, '') //remove imports
    .replace(/export default (\w+)/g, (_, name) => `React.render(<${name}/>, mountNode)`)
    .trim(); //transform export

  return source;
}

exampleLoader.pitch = function(remainingRequest){
  if (this.cachable) {
    this.cachable();
  }

  console.log('start', this.loaders)
  this.loaders.splice(this.loaderIndex + 1, this.loaders.length - this.loaderIndex);

  console.log('after', this.loaders)
  this.loaders.splice(this.loaderIndex, 0, {
    request: require.resolve('raw-loader'),
    path: require.resolve('raw-loader'),
    module: require('raw-loader')
  });

  console.log('end', this.loaders)
};

module.exports = exampleLoader;
