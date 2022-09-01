# Remix: Bring Your Own Compiler

Define your own [Remix](https://remix.run/) compiler.

- Use any compiler (`esbuild`, `webpack`, etc...) under-the-hood.
- Customize compiler config and add plugins

## Packages

- `compiler`: Compiler-agnostic core to coordinate browser and server builds
- `compiler-webpack`: Utilities for defining a Remix compiler using [Webpack](https://webpack.js.org/)
- `dev-server`: Remix dev server that watches for app changes and live reloads in your browser when changes are detected

## Build

```sh
npm run build
```

Each package will have its build output written to `packages/<package>/dist/`.