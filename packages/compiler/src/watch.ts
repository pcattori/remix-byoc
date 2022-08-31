import path from "path";
import { readConfig } from "@remix-run/dev/dist/config";
import type { RemixConfig } from "@remix-run/dev/dist/config";
import chokidar from "chokidar";
import type {
  BrowserCompiler,
  CreateCompiler,
  ServerCompiler,
} from "./compiler";
import { makeRemixCompiler } from "./compiler";
import { build } from "./build";

const reloadConfig = async (config: RemixConfig): Promise<RemixConfig> => {
  try {
    return readConfig(config.rootDirectory);
  } catch (error) {
    // onBuildFailure(error as Error);
    console.error(error);
    throw error;
  }
};

export const watch = async (
  config: RemixConfig,
  createCompiler: {
    browser: CreateCompiler<BrowserCompiler>;
    server: CreateCompiler<ServerCompiler>;
  },
  callbacks: {
    onInitialBuild?: () => void;
    onRebuildStart?: () => void;
    onRebuildFinish?: (durationMs: number) => void;
    onFileCreated?: (file: string) => void;
    onFileChanged?: (file: string) => void;
    onFileDeleted?: (file: string) => void;
  } = {}
): Promise<() => Promise<void>> => {
  let compiler = makeRemixCompiler(config, createCompiler);

  // initial build
  await build(config, compiler);
  callbacks.onInitialBuild?.();

  // TODO debounce
  const restart = async () => {
    callbacks.onRebuildStart?.();
    const start = Date.now();
    compiler.dispose();

    config = await reloadConfig(config);
    compiler = makeRemixCompiler(config, createCompiler);
    await build(config, compiler);
    callbacks.onRebuildFinish?.(Date.now() - start);
  };

  // TODO debounce
  const rebuild = async () => {
    callbacks.onRebuildStart?.();
    const start = Date.now();
    await build(config, compiler);
    callbacks.onRebuildFinish?.(Date.now() - start);
  };

  // watch files
  const toWatch = [config.appDirectory];
  if (config.serverEntryPoint) {
    toWatch.push(config.serverEntryPoint);
  }
  config.watchPaths.forEach((watchPath) => toWatch.push(watchPath));

  const watcher = chokidar
    .watch(toWatch, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100,
      },
    })
    .on("error", (error) => console.error(error))
    .on("change", async (file) => {
      callbacks.onFileChanged?.(file);
      await rebuild();
    })
    .on("add", async (file) => {
      callbacks.onFileCreated?.(file);
      config = await reloadConfig(config);
      if (isEntryPoint(config, file)) {
        await restart();
      } else {
        await rebuild();
      }
    })
    .on("unlink", async (file) => {
      callbacks.onFileDeleted?.(file);
      if (isEntryPoint(config, file)) {
        await restart();
      } else {
        await rebuild();
      }
    });

  return async () => {
    await watcher.close().catch(() => undefined);
    compiler.dispose();
  };
};

function isEntryPoint(config: RemixConfig, file: string): boolean {
  const appFile = path.relative(config.appDirectory, file);
  const entryPoints = [
    config.entryClientFile,
    config.entryServerFile,
    ...Object.values(config.routes).map((route) => route.file),
  ];
  return entryPoints.includes(appFile);
}
