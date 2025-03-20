import { createRequire } from 'module';
import globals from 'globals';
import pluginJs from '@eslint/js';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import jestPlugin from 'eslint-plugin-jest';

createRequire(import.meta.url);

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.browser, ...globals.node } // Define global variables
    }
  },

  // ESLint recommended settings for JavaScript
  pluginJs.configs.recommended,

  // Manually configuring Node.js specific settings (instead of eslint-config-node)
  {
    languageOptions: {
      globals: globals.node // Add Node.js global variables
    },
    rules: {
      'no-console': 'warn', // Warn on console usage
      'no-process-exit': 'error', // Disallow process.exit()
      strict: ['error', 'global'], // Enforce strict mode
      'linebreak-style': ['error', 'unix'] // Add Linebreak Rule: Enforce LF line endings
    }
  },

  prettier,
  {
    plugins: {
      prettier: prettierPlugin // Add Prettier as a plugin
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: true, // Use semicolons
          tabWidth: 2, // Indentation size
          printWidth: 100, // Line wrap limit
          singleQuote: true, // Use single quotes
          trailingComma: 'none', // No trailing commas
          jsxBracketSameLine: true, // JSX brackets stay on the same line
          endOfLine: 'lf' // Use Unix line endings
        }
      ],
      // Disable console.log() in production
      'no-console': [process.env.NODE_ENV === 'production' ? 'warn' : 'off'],
      // Allow unused variables starting with an underscore
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },

  // Jest support
  {
    files: ['__tests__/**/*.spec.js', 'jest.setup.js'],
    languageOptions: {
      globals: {
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly'
      }
    },
    plugins: {
      jest: jestPlugin
    },
    extends: ['plugin:jest/recommended'],
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error'
    }
  }
];
