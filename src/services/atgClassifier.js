// Local ATGAA classifier search helpers.
// Classifier data is loaded from local JSON files.

let classifierPromise = null;

const normalize = value => String(value || '')
  .toLocaleLowerCase()
  .replace(/և/g, 'եւ')
  .replace(/[.,:;()\[\]{}«»"'՝․–—-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export async function loadAtgClassifier() {
  if (!classifierPromise) {
    classifierPromise = Promise.all([
      fetch('/data/goods-classifier-hy.json').then(response => {
        if (!response.ok) throw new Error(`ATG classifier load failed: ${response.status}`);
        return response.json();
      }),
      fetch('/data/goods-classifier-tobacco.json').then(response => response.ok ? response.json() : {}),
    ]).then(([base, tobacco]) => ({ ...base, ...tobacco }))
      .then(data => Object.entries(data).map(([code, name]) => ({
        code: String(code),
        name: String(name || ''),
        search: normalize(`${code} ${name}`),
      })));
  }
  return classifierPromise;
}

export async function searchAtgClassifier(query, limit = 30) {
  const rows = await loadAtgClassifier();
  const q = normalize(query);
  if (!q) return rows.slice(0, limit);

  const tokens = q.split(' ').filter(Boolean);
  return rows
    .filter(row => tokens.every(token => row.search.includes(token)))
    .sort((a, b) => {
      const aExact = a.code === q ? 0 : a.code.startsWith(q) ? 1 : a.search.startsWith(q) ? 2 : 3;
      const bExact = b.code === q ? 0 : b.code.startsWith(q) ? 1 : b.search.startsWith(q) ? 2 : 3;
      return aExact - bExact || a.code.localeCompare(b.code);
    })
    .slice(0, limit)
    .map(({ search, ...row }) => row);
}

export async function getAtgByCode(code) {
  const rows = await loadAtgClassifier();
  const key = String(code || '').trim();
  const row = rows.find(item => item.code === key);
  if (!row) return null;
  return { code: row.code, name: row.name };
}
