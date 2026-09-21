import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "work/**",
      "outputs/**",
      "artifacts/**",
      ".tmp/**",
      "**/.tmp/**",
      "pytest-runtime*/**",
      "py-temp-check/**",
      "mode700-check/**",
      "py-single-tmp/**",
      ".pytest_cache/**",
      "workers/rfb_cnpj/.pytest_cache/**",
      "public/assets/renovera-legado/**",
    ],
  },
];

export default eslintConfig;
