const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    app: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].[chunkhash].js',
    publicPath: '/wp-content/plugins/wd-appointments/admin/react-app/build/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { node: 'current' } }],
              '@babel/preset-react',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-runtime',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].[chunkhash].css',
    }),
    new DependencyExtractionWebpackPlugin({
      injectPolyfill: true,
      combineAssets: true,
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  performance: {
    hints: false,
  },
  stats: {
    children: false,
    modules: false,
  },
  externals: {
    // WordPress dependencies
    '@wordpress/element': 'wp.element',
    '@wordpress/components': 'wp.components',
    '@wordpress/i18n': 'wp.i18n',
    '@wordpress/api-fetch': 'wp.apiFetch',
    '@wordpress/url': 'wp.url',
    // React dependencies (if using WordPress's bundled React)
    // react: 'React',
    // 'react-dom': 'ReactDOM',
  },
};

// Development-specific settings
if (!isProduction) {
  module.exports.devServer = {
    contentBase: path.join(__dirname, 'build'),
    compress: true,
    port: 3000,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '/wp-json': {
        target: 'http://localhost:8888', // Your local WordPress URL
        changeOrigin: true,
      },
    },
  };
}

// Production-specific settings
if (isProduction) {
  module.exports.plugins.push(
    // Add any production-specific plugins here
  );
}
