const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace tailwind colors
      content = content.replace(/indigo-/g, 'zinc-');
      content = content.replace(/violet-/g, 'zinc-');
      content = content.replace(/slate-/g, 'zinc-');
      
      // Replace hardcoded RGBAs for backgrounds
      // rgba(15, 23, 42, X) -> rgba(9, 9, 11, X)
      content = content.replace(/15,\s*23,\s*42/g, '9, 9, 11');
      // rgba(2, 6, 23, X) -> rgba(0, 0, 0, X)
      content = content.replace(/2,\s*6,\s*23/g, '0, 0, 0');

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(srcDir);
console.log('Replaced colors successfully!');
