// Polyfill pour require si nécessaire
if (typeof require === 'undefined') {
  global.require = function require(id) {
    throw new Error(`Cannot require '${id}' - require is not supported in this environment`);
  };
}

// Polyfill pour import.meta - sans utiliser import.meta lui-même
if (typeof globalThis !== 'undefined') {
  if (!globalThis.import) {
    globalThis.import = {};
  }
  if (!globalThis.import.meta) {
    globalThis.import.meta = {
      env: {
        MODE: process.env.NODE_ENV || 'development'
      }
    };
  }
}

// Alternative avec global
if (typeof global !== 'undefined') {
  if (!global.import) {
    global.import = {};
  }
  if (!global.import.meta) {
    global.import.meta = {
      env: {
        MODE: process.env.NODE_ENV || 'development'
      }
    };
  }
}