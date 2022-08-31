import fs from "fs";
import path from "path";
import type { AssetsManifest } from "@remix-run/dev/dist/compiler/assets";
import type { RemixConfig } from "@remix-run/dev/dist/config";

import { makeChannel } from "@remix-run/channel";
import type { RemixCompiler } from "./compiler";

export const build = async (
  config: RemixConfig,
  compiler: RemixCompiler
): Promise<void> => {
  const manifestChannel = makeChannel<AssetsManifest>();
  const browser = compiler.browser.build(manifestChannel);

  // write manifest
  manifestChannel.read().then((manifest) => {
    fs.mkdirSync(config.assetsBuildDirectory, { recursive: true });
    fs.writeFileSync(
      path.resolve(config.assetsBuildDirectory, path.basename(manifest.url!)),
      `window.__remixManifest=${JSON.stringify(manifest)};`
    );
  });

  const server = compiler.server.build(manifestChannel);
  return await Promise.all([browser, server]).then(() => undefined);
};
