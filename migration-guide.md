# Migrating your Webpack-based React Router app to Remix

**⚠️You should not use this guide⚠️** if you have not customized your Webpack config with loaders and plugins.
Intead, use the official [Migrating your React Router app to Remix](https://remix.run/docs/en/v1/guides/migrating-react-router-app) guide.

However, if you need to keep functionality from your custom Webpack config when migrating to Remix (e.g. you're using some fancy CSS library/framework), then this guide is for you!

## 0 Follow normal RR migration guide

Follow the [Migrating your React Router app to Remix](https://remix.run/docs/en/v1/guides/migrating-react-router-app) until the **Replacing the bundler with Remix** step.

Skip installation of `@remix-run/dev`.

## 1 Install dev packages

If you didn’t skip installing `@remix-run/dev` in the previous step, uninstall it now:

```sh
npm rm @remix-run/dev
```

Then, install `@remix-run/compiler`, `@remix-run/compiler-webpack`, and `@remix-run/dev-server`

```sh
npm i -D @remix-run/compiler @remix-run/compiler-webpack @remix-run/dev-server
```

## 2 Setup `.remix/` scripts

Copy the `build.mjs` and `dev.mjs` scripts from the example into a `.remix/` directory at the root of your repo.

Add commands for those scripts in your `project.json`:

```json
{
  "scripts": {
    "build": "node .remix/build.mjs",
    "dev": "NODE_ENV=development node .remix/dev.mjs"
  }
}
```
## 3 Copy webpack configs for browser and server

Copy the `webpack.config.browser.js` and `webpack.config.server.js` from the example into your `.remix/` directory.

You can rename these if you want, but you’ll have to update the references to them in the `build.mjs` and `dev.mjs` scripts from the previous step.

## 4 Customize Webpack config

You can customize the Webpack configs from the previous step with any configuration settings, loaders, or plugins that you already use in your Webpack-based app.
