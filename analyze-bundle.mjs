import fs from 'fs';

const txt = fs.readFileSync('./bundle-report.html', 'utf8');
const d = JSON.parse(txt);

// sizes by uid
const parts = d.nodeParts || {};
// module meta: uid -> full path
const metas = new Map();
for (const [key, meta] of Object.entries(d.nodeMetas || {})) {
  // key is a uid, meta.id is full path; but importedBy uses uid... simpler: meta.id
  if (meta && meta.id) metas.set(meta.id, meta);
}

// We need uid -> path. The tree nodes have uid+name. Build a map uid->aggregated path via tree traversal.
const uidPath = {};
const uidSize = {};
function walk(node, pathSegs) {
  const name = node.name || '';
  const full = pathSegs.concat(name).join('/');
  if (node.uid) {
    uidPath[node.uid] = full;
    const p = parts[node.uid];
    if (p) uidSize[node.uid] = p.gzipLength || 0;
    return; // leaf (uid nodes are leaves)
  }
  for (const c of node.children || []) walk(c, pathSegs.concat(name));
}
walk(d.tree, []);

// Aggregate gzip bytes by package (node_modules top-level scope)
const pkgSizes = {};
const firebaseDetail = {};
for (const [uid, path] of Object.entries(uidPath)) {
  const size = uidSize[uid] || 0;
  const m = path.match(/node_modules\/@?([^/]+)(?:\/[^/]+)?/);
  if (m) {
    const pkg = m[0].includes('/') && path.includes('node_modules/@') ? path.match(/node_modules\/(@[^/]+\/[^/]+)/)[1] : (path.match(/node_modules\/([^/]+)/)[1]);
    // For scoped and unscoped, capture full first segment(s)
    const scoped = path.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
    const pkgName = scoped ? scoped[1] : pkg;
    pkgSizes[pkgName] = (pkgSizes[pkgName] || 0) + size;
    if (pkgName.startsWith('@firebase')) firebaseDetail[pkgName + path.split('@firebase/')[1]] = (firebaseDetail[pkgName + path.split('@firebase/')[1]] || 0) + size;
  }
}

const sorted = Object.entries(pkgSizes).sort((a, b) => b[1] - a[1]);
console.log('=== Paquetes por tamaño (gzip bytes) ===');
for (const [pkg, size] of sorted) {
  console.log(`${(size / 1024).toFixed(1)} KB\t${pkg}`);
}

// Total of each chunk
console.log('\n=== Chunks ===');
const chunkTotals = {};
for (const [metaKey, meta] of Object.entries(d.nodeMetas || {})) {
  if (meta.moduleParts) {
    for (const [chunkName, uid] of Object.entries(meta.moduleParts)) {
      const size = parts[uid]?.gzipLength || 0;
      chunkTotals[chunkName] = (chunkTotals[chunkName] || 0) + size;
    }
  }
}
for (const [chunk, total] of Object.entries(chunkTotals).sort((a, b) => b[1] - a[1])) {
  console.log(`${(total / 1024).toFixed(1)} KB gzip\t${chunk}`);
}
