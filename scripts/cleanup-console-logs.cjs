const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, '..', 'src');

// Get all JS and JSX files
const files = execSync(`find "${srcDir}" -name "*.jsx" -o -name "*.js"`, { encoding: 'utf-8' })
  .split('\n')
  .filter(f => f && !f.includes('logger.js'));

let modifiedCount = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf-8');
    const original = content;

    // Remove console.log, console.error, console.warn, console.info, console.debug
    // Handle both with and without semicolons
    content = content.replace(/console\.(log|error|warn|info|debug)\([^)]*\);?\s*\n?/g, '');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf-8');
      modifiedCount++;
      console.log(`Modified: ${file}`);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
});

console.log(`\nTotal files modified: ${modifiedCount}`);
