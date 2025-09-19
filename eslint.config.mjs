import expoConfig from 'eslint-config-expo/flat.js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';

export default [
    ...expoConfig,
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-unused-vars': 'off',
        },
    },
];
