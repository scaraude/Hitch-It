import typescriptEslint from '@typescript-eslint/eslint-plugin';
import expoConfig from 'eslint-config-expo/flat.js';

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
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'error',
            'no-unused-vars': 'off',
        },
    },
];
