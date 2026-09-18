import { describe, expect, it, vi, beforeEach } from 'vitest';

const sample = {
  '1905': 'Հաց, ալյուրով պատրաստված հրուշակեղեն',
  '2201': 'Ջրեր՝ ներառյալ բնական կամ արհեստական հանքային ջրերը',
  '2202': 'Ջրեր՝ շաքարի կամ այլ քաղցրացնող կամ համային–բուրավետ նյութերի պարունակությամբ',
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => sample })));
  vi.resetModules();
});

describe('ATG classifier', () => {
  it('finds an exact code first', async () => {
    const { searchAtgClassifier } = await import('./atgClassifier');
    const result = await searchAtgClassifier('2202');
    expect(result[0].code).toBe('2202');
  });

  it('searches Armenian description text', async () => {
    const { searchAtgClassifier } = await import('./atgClassifier');
    const result = await searchAtgClassifier('հանքային ջրերը');
    expect(result.some(x => x.code === '2201')).toBe(true);
  });
});
