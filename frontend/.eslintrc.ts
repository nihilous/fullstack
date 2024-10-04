import { Linter } from 'eslint';

const config: Linter.Config = {
    env: {
        browser: true,
        es2021: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            typescript: {},
        },
    },
    extends: [
        'airbnb',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:prettier/recommended',
        'plugin:react-hooks/recommended',
    ],
    plugins: [
        'react',
        'react-hooks',
        '@typescript-eslint',
        'prettier',
    ],
    rules: {
        'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                ts: 'never',
                tsx: 'never',
                js: 'never',
                jsx: 'never',
            },
        ],
        'react/prop-types': 'off',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],
        'react/react-in-jsx-scope': 'off',
        'prettier/prettier': ['error'],
        'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
        'react-hooks/exhaustive-deps': 'off'
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                'no-undef': 'off',
                'react-hooks/exhaustive-deps': 'off',
            },
        },
    ],
};

export default config;