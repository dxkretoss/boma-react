import fs from 'fs';
const content = fs.readFileSync('D:/Boma_new/index.html', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('Cedar Grove') || line.includes('Willow Creek') || line.includes('Harbor View')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
