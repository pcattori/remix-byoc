import { mergeWithCustomize, customizeArray } from 'webpack-merge';

export const merge = mergeWithCustomize({
  customizeArray: customizeArray({
    'module.rules': 'prepend',
    plugins: 'append',
  }),
});
