import path from 'path';
import { builtinModules } from 'module';

import { ESBuildMinifyPlugin } from 'esbuild-loader';
import type { RemixConfig } from '@remix-run/dev/dist/config';
import type { Configuration } from 'webpack';
import webpack from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';

import * as obj from '../utils/object';

const BROWSER_ROUTE_PREFIX = '__remix_browser_route__';
const BROWSER_ROUTE_REGEX = new RegExp('/' + BROWSER_ROUTE_PREFIX);
const getBrowserRoutes = (remixConfig: RemixConfig): [string, string][] =>
  obj
    .entries(remixConfig.routes)
    .map(([id, route]) => [
      id,
      path.resolve(
        remixConfig.appDirectory,
        path.dirname(route.file),
        BROWSER_ROUTE_PREFIX + path.basename(route.file)
      ),
    ]);

export const config = (remixConfig: RemixConfig): Configuration => {
  const browserRoutes = getBrowserRoutes(remixConfig);
  return {
    target: 'web',
    resolve: {
      fallback: obj.fromEntries(builtinModules.map((m) => [m, false] as const)),
    },
    entry: {
      'entry.client': path.resolve(
        remixConfig.appDirectory,
        remixConfig.entryClientFile
      ),
      ...obj.fromEntries(browserRoutes),
    },
    module: {
      rules: [
        {
          test: /\.server\./,
          loader: require.resolve(
            path.join(__dirname, './empty-module-loader')
          ),
        },
        {
          test: BROWSER_ROUTE_REGEX,
          loader: require.resolve(
            path.join(__dirname, './browser-routes-loader')
          ),
          options: { remixConfig, browserRouteRegex: BROWSER_ROUTE_REGEX },
        },
      ],
    },
    output: {
      path: remixConfig.assetsBuildDirectory,
      publicPath: remixConfig.publicPath,
      module: true,
      library: { type: 'module' },
      chunkFormat: 'module',
      chunkLoading: 'import',
      assetModuleFilename: '_assets/[name]-[contenthash][ext]',
    },
    optimization: {
      moduleIds: 'deterministic',
      runtimeChunk: 'single',

      // treeshake unused code in development
      // needed so that browser build does not pull in server code
      usedExports: true,
      innerGraph: true,
    },
    externalsType: 'module',
    experiments: {
      outputModule: true,
    },
    plugins: [
      new VirtualModulesPlugin(
        obj.fromEntries(browserRoutes.map(([, route]) => [route, ''] as const))
      ),

      new webpack.EnvironmentPlugin({
        REMIX_DEV_SERVER_WS_PORT: JSON.stringify(remixConfig.devServerPort),
      }),

      // shim react so it can be used without importing
      new webpack.ProvidePlugin({ React: ['react'] }),
    ],
  };
};

export const recommended = (mode: Configuration['mode']): Configuration => {
  return {
    optimization: {
      splitChunks: {
        // you should use
        // chunks(chunk) {
        //   look for and exclude federation chunks, so in chunk.find((module)=>module.type !== 'remote-module' || 'provde-module')
        //   return isNotFederationConrolledChunk()
        // },
        chunks: 'async', // not all, async as workaround
      },
      minimize: mode === 'production',
      minimizer: [new ESBuildMinifyPlugin({ target: 'es2019' })],
    },
    output: {
      filename: '[name]-[contenthash].js',
      chunkFilename: '[name]-[contenthash].js',
    },
  };
};
