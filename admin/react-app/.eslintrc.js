module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    'jest/globals': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
    'react-app',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'import', 'jest', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
      webpack: {
        config: './webpack.config.js',
      },
    },
  },
  rules: {
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-use-before-define': ['error', { functions: false }],
    'no-debugger': 'warn',

    // React
    'react/prop-types': 'warn',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': ['warn', { extensions: ['.jsx', '.js'] }],
    'react/function-component-definition': [
      'warn',
      {
        namedComponents: 'function-declaration',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Import
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': ['error', { ignore: ['^@/'] }],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',

    // JSX Accessibility
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
      },
    ],

    // Prettier
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: true,
        trailingComma: 'es5',
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        bracketSpacing: true,
        jsxBracketSameLine: false,
        arrowParens: 'always',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
  globals: {
    wp: 'readonly',
    wdAppointments: 'readonly',
  },
};
