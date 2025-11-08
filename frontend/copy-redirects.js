const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'src', 'assets', '_redirects');
const dest = path.join(__dirname, 'dist', 'frontend', 'browser', '_redirects');

try {
  fs.copyFileSync(source, dest);
  console.log('✅ _redirects copiado correctamente');
} catch (error) {
  console.error('❌ Error copiando _redirects:', error.message);
  process.exit(1);
}
