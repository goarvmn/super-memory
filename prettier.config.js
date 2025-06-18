export default {
  // Consistent dengan .editorconfig
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',

  // String formatting
  singleQuote: true,

  // Trailing commas & semicolons
  trailingComma: 'es5',
  semi: true,

  // Bracket spacing
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow functions
  arrowParens: 'avoid',

  // Print width
  printWidth: 120,

  // Prose wrap for markdown
  proseWrap: 'preserve',

  // File-specific overrides
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.json',
      options: {
        trailingComma: 'none',
      },
    },
  ],
};
