var withMDX = require('@next/mdx')({
  extention: /\.mdx?$/
})

module.exports = withMDX({
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.(ico|svg|png|gif|jpe?g)$/,
        exclude: /node_modules/,
        use: [{
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]"
          }
        }]
      },
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: [],
      },
      {
        test: /\.md$/,
        use: [{
          loader: "raw-loader"
        }]
      },)

      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();

        if (
          entries['main.js'] &&
          !entries['main.js'].includes('./client/polyfills.js')
        ) {
          entries['main.js'].unshift('core-js/stable', 'regenerator-runtime/runtime')
        }
        return entries
      }
      return config
    }
  })
  