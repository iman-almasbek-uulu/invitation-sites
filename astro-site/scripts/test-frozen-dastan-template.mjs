import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const templatePath = new URL('../public/templates/dastan-nuriza/index.html', import.meta.url);

test('frozen Dastan/Nuriza template is a standalone static HTML document', async () => {
  await access(templatePath, constants.R_OK);
  const html = await readFile(templatePath, 'utf8');

  assert.match(html, /<title>Дастан & Нуриза<\/title>/);
  assert.match(html, /id="rec1437401093"/);
  assert.match(html, /id="rec1437420403"/);
  assert.doesNotMatch(html, /https?:\/\/(?:[^"'\s]*\.)?(?:tilda|tildacdn|tilda\.ws)\b/i);
});
