import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const testsDirectory = resolve(process.cwd(), "tests");
const testFiles = (await readdir(testsDirectory))
  .filter((fileName) => fileName.endsWith(".test.mjs"))
  .sort();

for (const testFile of testFiles) {
  await import(pathToFileURL(resolve(testsDirectory, testFile)).href);
}
