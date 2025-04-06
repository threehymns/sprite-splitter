import { FlatCompat } from "@eslint/eslintrc";
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
		ignores: ['.next']
	},
  ...compat.extends("next/core-web-vitals"),
  {
    files: ['**/*.ts', '**/*.tsx'],
		extends: [
			...tseslint.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			...tseslint.configs.stylisticTypeChecked
		],
      rules: {
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      { checksVoidReturn: { attributes: false } },
    ],
  },
  },
   {
     files: ['src/components/ui/**/*.ts', 'src/components/ui/**/*.tsx'],
     rules: {
       "@typescript-eslint/prefer-nullish-coalescing": "off",
       "@typescript-eslint/no-unnecessary-type-assertion": "off",
       "@typescript-eslint/no-unsafe-assignment": "off",
       "@typescript-eslint/no-unsafe-member-access": "off",
       "@typescript-eslint/no-unsafe-argument": "off",
       "@typescript-eslint/restrict-template-expressions": "off",
       "@typescript-eslint/consistent-type-imports": "off",
       "@typescript-eslint/consistent-indexed-object-style": "off"
     }
   },
  {
		linterOptions: {
			reportUnusedDisableDirectives: true
		},
		languageOptions: {
			parserOptions: {
				projectService: true
			}
		}
	}
)
