import test from 'node:test';
import assert from 'node:assert/strict';

const sample = {
  '1905': 'Հաց, ալյուրով պատրաստված հրուշակեղեն',
  '2201': 'Ջրեր՝ ներառյալ բնական կամ արհեստական հանքային ջրերը',
  '2202': 'Ջրեր՝ շաքարի կամ այլ քաղցրացնող կամ համային–բուրավետ նյութերի պարունակությամբ',
};

globalThis.fetch = async () => ({ ok: true, json: async () => sample });
const { searchAtgClassifier } = await import('./atgClassifier.js');

test('finds an exact code first', async () => {
  const result = await searchAtgClassifier('2202');
  assert.equal(result[0].code, '2202');
});

test('searches Armenian description text', async () => {
  const result = await searchAtgClassifier('հանքային ջրերը');
  assert.equal(result.some(x => x.code === '2201'), true);
});
