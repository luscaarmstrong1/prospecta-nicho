const jestWorker = require("next/dist/compiled/jest-worker");

const OriginalWorker = jestWorker.Worker;

function stripFunctions(value, seen = new WeakMap()) {
  if (typeof value === "function") {
    return undefined;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (value instanceof Date || value instanceof RegExp || value instanceof URL) {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value);
  }

  if (Array.isArray(value)) {
    const arrayClone = [];
    seen.set(value, arrayClone);

    for (const item of value) {
      arrayClone.push(stripFunctions(item, seen));
    }

    return arrayClone;
  }

  const objectClone = {};
  seen.set(value, objectClone);

  for (const [key, item] of Object.entries(value)) {
    const sanitizedItem = stripFunctions(item, seen);

    if (sanitizedItem !== undefined) {
      objectClone[key] = sanitizedItem;
    }
  }

  return objectClone;
}

class StaticExportThreadSafeWorker extends OriginalWorker {
  constructor(workerPath, options = {}) {
    super(workerPath, options);

    if (!options.enableWorkerThreads) {
      return;
    }

    for (const method of options.exposedMethods || []) {
      if (typeof this[method] !== "function") {
        continue;
      }

      const originalMethod = this[method].bind(this);
      this[method] = (...args) => originalMethod(...args.map((arg) => stripFunctions(arg)));
    }
  }
}

jestWorker.Worker = StaticExportThreadSafeWorker;
