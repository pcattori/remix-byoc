import path from 'path';

import type { RemixConfig } from '@remix-run/dev/dist/config';
import webpack from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import nodeExternals from 'webpack-node-externals';

export const config = (remixConfig: RemixConfig): webpack.Configuration => {
  const entryPoint = path.resolve(remixConfig.rootDirectory, 'server.ts');

  const isModule = remixConfig.serverModuleFormat === 'esm';
  return {
    context: remixConfig.rootDirectory,
    target: 'node',
    optimization: {
      moduleIds: 'deterministic',
    },
    experiments: isModule ? { outputModule: true } : undefined,
    externalsType: isModule ? 'module' : undefined,
    externalsPresets: { node: true },
    externals: [
      nodeExternals({
        allowlist: [
          /@remix-run\/dev\/server-build/,
          // https://github.com/liady/webpack-node-externals#how-can-i-bundle-required-assets-ie-css-files-from-node_modules
          /\.(?!(?:jsx?|json)$).{1,5}$/i,
        ],
      }),
    ],
    entry: entryPoint,
    output: {
      filename: path.basename(remixConfig.serverBuildPath),
      library: { type: isModule ? 'module' : 'commonjs' },
      chunkFormat: isModule ? 'module' : 'commonjs',
      chunkLoading: isModule ? 'import' : 'require',
      module: isModule,
      path: path.dirname(remixConfig.serverBuildPath),
      publicPath: remixConfig.publicPath,
      assetModuleFilename: '_assets/[name]-[contenthash][ext]',
    },
    plugins: [
      new VirtualModulesPlugin({
        [entryPoint]: remixConfig.serverBuildTargetEntryModule,
      }),
      new webpack.EnvironmentPlugin({
        REMIX_DEV_SERVER_WS_PORT: JSON.stringify(remixConfig.devServerPort),
      }),
      new webpack.ProvidePlugin({ React: ['react'] }),
    ],
  };
};
