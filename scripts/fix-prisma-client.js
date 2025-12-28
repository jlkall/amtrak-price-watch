// Script to create a working Prisma client default export
const fs = require('fs');
const path = require('path');

const defaultDir = path.join(__dirname, '../node_modules/.prisma/client/default');
const indexFile = path.join(defaultDir, 'index.js');

// Create directory if needed
if (!fs.existsSync(defaultDir)) {
  fs.mkdirSync(defaultDir, { recursive: true });
}

// Create a JavaScript file that webpack can process
// This uses a lazy getter that will be resolved by webpack at build time
const content = `// Auto-generated Prisma client export
// Webpack will process the TypeScript client and make it available here
'use strict';

// Export PrismaClient - webpack will resolve this at build time
// The actual client.ts is processed by webpack's TypeScript loader
let _PrismaClient = null;

function getPrismaClient() {
  if (!_PrismaClient) {
    // Webpack will replace this with the actual bundled client
    // For now, we use a require that webpack can process
    const clientModule = __webpack_require__ ? 
      __webpack_require__('../client') : 
      require('../client');
    _PrismaClient = clientModule.PrismaClient;
  }
  return _PrismaClient;
}

module.exports = {
  get PrismaClient() {
    return getPrismaClient();
  }
};

// Export other properties from client
const client = __webpack_require__ ? 
  __webpack_require__('../client') : 
  require('../client');
  
for (const key in client) {
  if (key !== 'PrismaClient' && !module.exports[key]) {
    Object.defineProperty(module.exports, key, {
      get() {
        return client[key];
      },
      enumerable: true
    });
  }
}
`;

fs.writeFileSync(indexFile, content);
console.log('✅ Created Prisma client default export');
