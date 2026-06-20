module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@shared-types': './src/types/shared-types.ts',
        },
        extensions: [
          '.web.js',
          '.web.ts',
          '.web.tsx',
          '.ios.js',
          '.android.js',
          '.js',
          '.ts',
          '.tsx',
          '.json',
        ],
      },
    ],
  ],
};
