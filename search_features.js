import fs from 'fs';
const content = fs.readFileSync('D:/Boma_new/index.html', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('Why people choose') || line.includes('Real alignment, not luck') || line.includes('Trust before commitment')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
