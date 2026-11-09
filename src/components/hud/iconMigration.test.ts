import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Iconography Migration to Lucide', () => {
  it('ensures zero imports of react-icons/tb across all UI components', () => {
    const componentDirs = [
      path.resolve(process.cwd(), 'src/components/hud'),
      path.resolve(process.cwd(), 'src/components/modals'),
      path.resolve(process.cwd(), 'src/components/3d'),
    ];

    const violations: { file: string; line: string }[] = [];

    for (const dir of componentDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
        if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue;
        const fullPath = path.join(dir, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((l) => {
          if (l.includes("from 'react-icons/tb'") || l.includes('from "react-icons/tb"')) {
            violations.push({ file, line: l.trim() });
          }
        });
      }
    }

    expect(
      violations,
      `Found ${violations.length} files still importing from react-icons/tb:\n${violations.map((v) => `${v.file}: ${v.line}`).join('\n')}`
    ).toEqual([]);
  });
});
