import type { AssetsManifest } from "@remix-run/dev/dist/compiler/assets";
import { RemixConfig } from "@remix-run/dev/dist/config";
import { ReadChannel, WriteChannel } from "./utils/channel";

export interface BrowserCompiler {
  // produce ./public/build/
  build: (manifestChannel: WriteChannel<AssetsManifest>) => Promise<void>;
  dispose: () => void;
}
export interface ServerCompiler {
  // produce ./build/index.js
  build: (manifestChannel: ReadChannel<AssetsManifest>) => Promise<void>;
  dispose: () => void;
}
export type CreateCompiler<T extends BrowserCompiler | ServerCompiler> = (
  config: RemixConfig
) => T;

export interface RemixCompiler {
  browser: BrowserCompiler;
  server: ServerCompiler;
  dispose: () => void;
}
export const makeRemixCompiler = (
  config: RemixConfig,
  createCompiler: {
    browser: CreateCompiler<BrowserCompiler>;
    server: CreateCompiler<ServerCompiler>;
  }
): RemixCompiler => {
  const browser = createCompiler.browser(config);
  const server = createCompiler.server(config);
  const dispose = () => {
    browser.dispose();
    server.dispose();
  };
  return {
    browser,
    server,
    dispose,
  };
};
