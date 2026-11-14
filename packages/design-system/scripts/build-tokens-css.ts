// Escribe styles/tokens.css a partir de src/tokens.ts.
import { writeFileSync } from 'node:fs';
import { renderTokensCss } from '../src/css-variables.ts';

const target = new URL('../src/styles/tokens.css', import.meta.url);
writeFileSync(target, renderTokensCss());
console.log(`Escrito ${target.pathname}`);
