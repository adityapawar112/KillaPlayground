import { describe, it, expect } from 'vitest';
import { TRANSLATIONS } from './translations';

function getLeafStrings(obj: any, path = ''): { path: string; value: string }[] {
  const leaves: { path: string; value: string }[] = [];
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const currentPath = path ? `${path}.${key}` : key;
    if (typeof val === 'string') {
      leaves.push({ path: currentPath, value: val });
    } else if (Array.isArray(val)) {
      val.forEach((item, idx) => {
        if (typeof item === 'string') {
          leaves.push({ path: `${currentPath}[${idx}]`, value: item });
        } else if (typeof item === 'object' && item !== null) {
          leaves.push(...getLeafStrings(item, `${currentPath}[${idx}]`));
        }
      });
    } else if (typeof val === 'object' && val !== null) {
      leaves.push(...getLeafStrings(val, currentPath));
    }
  }
  return leaves;
}

function getKeySet(obj: any, prefix = ''): Set<string> {
  const keys = new Set<string>();
  for (const k of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    keys.add(full);
    const val = obj[k];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      for (const sub of getKeySet(val, full)) {
        keys.add(sub);
      }
    }
  }
  return keys;
}

describe('Translations i18n Verification', () => {
  it('should have complete and identical key coverage across en, mr, and hi', () => {
    const enKeys = getKeySet(TRANSLATIONS.en);
    const mrKeys = getKeySet(TRANSLATIONS.mr);
    const hiKeys = getKeySet(TRANSLATIONS.hi);

    const missingInMr = [...enKeys].filter((k) => !mrKeys.has(k));
    const missingInHi = [...enKeys].filter((k) => !hiKeys.has(k));
    const extraInMr = [...mrKeys].filter((k) => !enKeys.has(k));
    const extraInHi = [...hiKeys].filter((k) => !enKeys.has(k));

    expect(missingInMr, `Missing keys in mr: ${missingInMr.join(', ')}`).toEqual([]);
    expect(missingInHi, `Missing keys in hi: ${missingInHi.join(', ')}`).toEqual([]);
    expect(extraInMr, `Extra keys in mr: ${extraInMr.join(', ')}`).toEqual([]);
    expect(extraInHi, `Extra keys in hi: ${extraInHi.join(', ')}`).toEqual([]);
  });

  it('should not contain any Devanagari characters in English translations', () => {
    const enLeaves = getLeafStrings(TRANSLATIONS.en);
    const devanagariRegex = /[\u0900-\u097F]/;

    const violating = enLeaves.filter((leaf) => devanagariRegex.test(leaf.value));
    expect(
      violating,
      `Devanagari text found in English locale: ${JSON.stringify(violating, null, 2)}`
    ).toEqual([]);
  });

  it('should not contain redundant Marathi transliterations in brackets in English mode', () => {
    const enLeaves = getLeafStrings(TRANSLATIONS.en);
    const transliterationBracketRegex = /\((Kangare|Buruj|Zenda|Mavala|Maha Darwaza|Sinhasan|Jate|Ukhal|Machi)\)/i;

    const violating = enLeaves.filter((leaf) => transliterationBracketRegex.test(leaf.value));
    expect(
      violating,
      `Redundant transliterated Marathi found in English locale: ${JSON.stringify(violating, null, 2)}`
    ).toEqual([]);
  });

  it('should not contain redundant English words in brackets in Marathi or Hindi modes', () => {
    const mrLeaves = getLeafStrings(TRANSLATIONS.mr);
    const hiLeaves = getLeafStrings(TRANSLATIONS.hi);
    const englishBracketRegex = /\((Proceed|Finish|Default|Clean|Vertex Mode|Solidify|Stamps|Inspector|Vault)\)/i;

    const violatingMr = mrLeaves.filter((leaf) => englishBracketRegex.test(leaf.value));
    const violatingHi = hiLeaves.filter((leaf) => englishBracketRegex.test(leaf.value));

    expect(
      violatingMr,
      `Redundant English in brackets found in Marathi locale: ${JSON.stringify(violatingMr, null, 2)}`
    ).toEqual([]);
    expect(
      violatingHi,
      `Redundant English in brackets found in Hindi locale: ${JSON.stringify(violatingHi, null, 2)}`
    ).toEqual([]);
  });

  it('should not contain empty strings in any translations', () => {
    const enLeaves = getLeafStrings(TRANSLATIONS.en);
    const mrLeaves = getLeafStrings(TRANSLATIONS.mr);
    const hiLeaves = getLeafStrings(TRANSLATIONS.hi);

    const emptyEn = enLeaves.filter((l) => l.value.trim() === '');
    const emptyMr = mrLeaves.filter((l) => l.value.trim() === '');
    const emptyHi = hiLeaves.filter((l) => l.value.trim() === '');

    expect(emptyEn, 'Empty strings found in en').toEqual([]);
    expect(emptyMr, 'Empty strings found in mr').toEqual([]);
    expect(emptyHi, 'Empty strings found in hi').toEqual([]);
  });
});

