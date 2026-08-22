const fs = require('fs');
const path = require('path');

const results = require('./migration_result.json');
const SRC_DIR = path.join(__dirname, '..', '..', 'frontend', 'src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(SRC_DIR, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // We look for: import varName from '../../assets/filename.ext';
    // or: import varName from '../assets/filename.ext';
    const importRegex = /import\s+([a-zA-Z0-9_]+)\s+from\s+['"](?:\.\.\/)+assets\/([^'"]+)['"];/g;
    
    content = content.replace(importRegex, (match, varName, fileName) => {
      if (results[fileName]) {
        modified = true;
        return `const ${varName} = "${results[fileName]}";`;
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in ${path.basename(filePath)}`);
    }
  }
});
