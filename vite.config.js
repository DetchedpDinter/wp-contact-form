import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [{ src: "src/blocks/block.json", dest: "blocks" }],
    }),
  ],
  build: {
    outDir: "build",
    rollupOptions: {
      external: (id) => id.startsWith("@wordpress/"), // Ignore all @wordpress/* modules
      input: {
        "blocks/index": resolve(__dirname, "src/blocks/index.jsx"), // Gutenberg Block
        "admin/formBuilder": resolve(__dirname, "src/admin/formBuilder.jsx"), // Form Builder Admin Panel
        "admin/editFormBuilder": path.resolve(
          __dirname,
          "src/admin/EditForm.jsx"
        ), // Edit Form Admin Panel
        "frontend/form-frontend": resolve(
          __dirname,
          "src/frontend/form-frontend.jsx"
        ), // Frontend Form Rendering
        "admin/entries": resolve(__dirname, "src/admin/entries.jsx"),
        "admin/entriesGraph": resolve(
          __dirname,
          "src/admin/EntriesGraphPage.jsx"
        ),
      },
      output: {
        dir: "build",
        entryFileNames: "[name].js",
        format: "esm",
        globals: {
          "@wordpress/blocks": "wp.blocks",
          "@wordpress/block-editor": "wp.blockEditor",
          "@wordpress/components": "wp.components",
          "@wordpress/element": "wp.element",
          "@wordpress/i18n": "wp.i18n",
        },
      },
    },
  },
});
