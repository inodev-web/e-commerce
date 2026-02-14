/**
 * Script to remove BOM (Byte Order Mark) from all JSX files
 * Run with: node fix-encoding.js
 */

const fs = require('fs');
const path = require('path');

// Remove BOM from file
function removeBOM(filePath) {
    const content = fs.readFileSync(filePath);

    // Check if file starts with UTF-8 BOM (EF BB BF)
    if (content.length >= 3 &&
        content[0] === 0xEF &&
        content[1] === 0xBB &&
        content[2] === 0xBF) {
        console.log(`Removing BOM from: ${filePath}`);
        // Remove first 3 bytes (BOM) and write back
        fs.writeFileSync(filePath, content.slice(3), 'utf8');
        return true;
    }

    return false;
}

// Recursively find all .jsx files
function findJsxFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findJsxFiles(filePath, fileList);
        } else if (file.endsWith('.jsx')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function main() {
    console.log('Scanning for JSX files with BOM...\n');

    const jsDir = path.join(__dirname, 'resources', 'js');

    if (!fs.existsSync(jsDir)) {
        console.error(`Directory not found: ${jsDir}`);
        process.exit(1);
    }

    // Find all JSX files
    const files = findJsxFiles(jsDir);

    console.log(`Found ${files.length} JSX file(s)\n`);

    let fixedCount = 0;

    for (const file of files) {
        if (removeBOM(file)) {
            fixedCount++;
        }
    }

    console.log(`\nFixed ${fixedCount} file(s)`);
    console.log('Done!');
}

main();
