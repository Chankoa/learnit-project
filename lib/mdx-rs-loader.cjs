const { loadBindings } = require("next/dist/build/swc");

// Local equivalent of the @next/mdx Rust loader for network-restricted builds.
module.exports = function mdxRsLoader(source) {
  const callback = this.async();
  const options = this.getOptions();

  loadBindings()
    .then((bindings) => bindings.mdx.compile(source.toString(), options))
    .then((code) => callback(null, code))
    .catch((error) => callback(error));
};
