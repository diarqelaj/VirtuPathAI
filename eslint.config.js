module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn", // was "error"
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // was "error"
  },
};
