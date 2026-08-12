import fs from 'fs';

const content = fs.readFileSync('src/data/chavaraIndoorNodes.js', 'utf8');
const nodes = [];
let currentId = null;
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // More robust matching for node keys (some are indented, some might not be)
  const idMatch = line.match(/^\s*([a-zA-Z0-9_]+):\s*\{/);
  if (idMatch) currentId = idMatch[1];
  
  if (line.includes('floor: "2"') && currentId) {
    for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 5); j++) {
      if (lines[j] && lines[j].includes('position:')) {
        const posMatch = lines[j].match(/position:\s*\[([\d\.]+),\s*([\d\.]+)\]/);
        if (posMatch) {
          nodes.push({ id: currentId, lat: parseFloat(posMatch[1]), lng: parseFloat(posMatch[2]) });
        }
        break;
      }
    }
  }
}

nodes.sort((a,b) => a.lng - b.lng);
console.table(nodes);
