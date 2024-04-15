//1. Terser for compilating in the browser

import { defineConfig } from "vite";

export default defineConfig({
  base: "./", //Tworzymy base aby wiedział czego używać na starcie
  build: { minify: "terser" }, // Jest bug w Kaboom na defaulcie kodu który nie pracuje dlatego terser do pomniejszania kodu i zwiększenia czytelności
});
