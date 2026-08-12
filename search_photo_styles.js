import fs from 'fs';
const content = fs.readFileSync('D:/Boma_new/index.html', 'utf8');
const lines = content.split('\n');

const selectors = [
  'photo-grid', 'figure', 'figcaption'
];

lines.forEach((line, index) => {
  selectors.forEach(sel => {
    if (line.includes(`.${sel}`) || line.includes(`${sel} {`)) {
      console.log(`${index + 1}: ${line.trim()}`);
    }
  });
});
