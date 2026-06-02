import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".design-bundle/**",
  ]),

  // ── Clean Architecture: Domain layer ─────────────────────────────────────────
  // domain/ must not import infrastructure, framework, or outer layers.
  // Interface types from repositories/interfaces/ are allowed (dependency inversion).
  {
    files: ["src/domain/**/*.ts", "src/domain/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react/*"],
              message:
                "Domain layer must not import React. Move UI logic to components/ or hooks/.",
            },
            {
              group: ["next", "next/*"],
              message:
                "Domain layer must not import Next.js. Move framework logic to app/ or hooks/.",
            },
            {
              group: ["@supabase/*"],
              message:
                "Domain layer must not import Supabase. Use repository interfaces instead.",
            },
            {
              group: ["@/lib/supabase/*", "@/lib/supabase"],
              message:
                "Domain layer must not import Supabase clients. Use repository interfaces instead.",
            },
            {
              group: ["@/repositories/supabase/*", "@/repositories/supabase"],
              message:
                "Domain layer must not import repository implementations. Use @/repositories/interfaces/* instead.",
            },
            {
              group: ["@/hooks/*", "@/hooks"],
              message:
                "Domain layer must not import hooks (outer layer).",
            },
            {
              group: ["@/components/*", "@/components"],
              message:
                "Domain layer must not import components (outer layer).",
            },
            {
              group: ["@/app/*", "@/app"],
              message:
                "Domain layer must not import app/ (outer layer).",
            },
            {
              group: ["@/stores/*", "@/stores"],
              message:
                "Domain layer must not import Zustand stores (outer layer).",
            },
          ],
        },
      ],
    },
  },

  // ── Clean Architecture: Repository layer ────────────────────────────────────
  // repositories/ must not import UI, hooks, or app layers.
  // Supabase clients and domain entities are allowed.
  {
    files: ["src/repositories/**/*.ts", "src/repositories/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react/*"],
              message:
                "Repository layer must not import React. Move UI logic to components/ or hooks/.",
            },
            {
              group: ["next", "next/*"],
              message:
                "Repository layer must not import Next.js. Move framework logic to app/ or actions/.",
            },
            {
              group: ["@/hooks/*", "@/hooks"],
              message:
                "Repository layer must not import hooks (outer layer).",
            },
            {
              group: ["@/components/*", "@/components"],
              message:
                "Repository layer must not import components (outer layer).",
            },
            {
              group: ["@/app/*", "@/app"],
              message:
                "Repository layer must not import app/ (outer layer).",
            },
            {
              group: ["@/stores/*", "@/stores"],
              message:
                "Repository layer must not import Zustand stores (outer layer).",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
