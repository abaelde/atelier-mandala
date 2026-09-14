/* test.js — vérifications automatiques lancées par la CI (node test.js).
   1. les fichiers référencés par index.html existent
   2. chaque dessin du catalogue se construit sans erreur et contient des zones coloriables
   3. aucun identifiant de dessin en double
   4. manifest.json est un JSON valide qui pointe vers des icônes existantes            */
const fs = require('fs');
const path = require('path');
let failures = 0;
const check = (ok, msg) => { if (ok) console.log('  ok  ' + msg); else { failures++; console.log('  FAIL ' + msg); } };
const here = p => path.join(__dirname, p);

console.log('index.html');
const html = fs.readFileSync(here('index.html'), 'utf8');
for (const m of html.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"]*)?"/g)) {
  const ref = m[1];
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith('data:')) continue;
  check(fs.existsSync(here(ref)), `fichier référencé présent : ${ref}`);
}

console.log('manifest.json');
const manifest = JSON.parse(fs.readFileSync(here('manifest.json'), 'utf8'));
for (const icon of manifest.icons) check(fs.existsSync(here(icon.src)), `icône présente : ${icon.src}`);

console.log('catalogue de dessins');
global.window = {};
require(here('kit.js'));
global.Kit = window.Kit;
require(here('people.js'));
const count = list => list.reduce((n, e) => n + (e.t === 'g' ? count(e.children) : (e.decor ? 0 : 1)), 0);
const ids = new Set();
let total = 0;
for (const group of Kit.CATALOG) {
  for (const item of group.items) {
    total++;
    let regions = -1;
    try { regions = count(item.make()); } catch (err) { console.log('  erreur ' + item.id + ' : ' + err.message); }
    check(regions >= 8, `${group.group} / ${item.name} (${item.id}) : ${regions} zones`);
    check(!ids.has(item.id), `identifiant unique : ${item.id}`);
    ids.add(item.id);
  }
}
console.log(`${total} dessins vérifiés`);
check(total >= 60, 'au moins 60 dessins dans le catalogue');

if (failures) { console.log(`\n${failures} problème(s)`); process.exit(1); }
console.log('\nTout est bon.');
