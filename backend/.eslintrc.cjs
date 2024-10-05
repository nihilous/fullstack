module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint', 'node'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:node/recommended',
        'airbnb-base',
    ],
    rules: {
        'quotes': [
            'error',
            'single',
            { 'allowTemplateLiterals': true }
        ],
        '@typescript-eslint/no-unused-vars': ['error'],
        '@typescript-eslint/no-explicit-any': 'off',
        'node/no-unsupported-features/es-syntax': 'off',
        'node/no-missing-import': 'off',
        'node/no-extraneous-import': 'off',
        'camelcase': 'off',
        'no-plusplus': 'off',
        'import/no-unresolved': 'off',
        'import/extensions': 'off',
        'no-restricted-syntax': 'off',
        'no-await-in-loop': 'off',
        'no-console': 'off',
        'import/prefer-default-export': 'off',
        'class-methods-use-this': 'off',
        'consistent-return': 'off',
        'no-use-before-define': 'off',
        'no-param-reassign': 'off',
        'default-case': 'off',
        'max-len': 'off',

    },
    ignorePatterns: ['node_modules', 'dist'],
};