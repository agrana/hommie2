import js from "@eslint/js";
import next from "eslint-plugin-next"; // ✅ Fix: Correctly import Next.js ESLint plugin
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    plugins: {
      next, // ✅ Fix: Ensures Next.js plugin is correctly applied
      react,
    },
    extends: ["plugin:next/recommended"], // ✅ Fix: Ensures Next.js ESLint rules are applied
    settings: {
      react: {
        version: "detect", // ✅ Fixes "React version not specified" warning
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // ✅ Next.js 15+ does not require React in scope
    },
  },
];
