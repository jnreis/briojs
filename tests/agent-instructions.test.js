import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Repo-maintenance instructions for AI agents (AGENTS.md and .github/skills) must point at real files.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Generated outputs (for example, site reference pages) are git-ignored and absent in a fresh checkout.
const generated = file => spawnSync('git', ['check-ignore', '-q', file], { cwd: root }).status === 0;
const skillsDir = resolve(root, '.github/skills');
const skills = readdirSync(skillsDir, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
const documents = [['AGENTS.md', resolve(root, 'AGENTS.md')],
    ...skills.map(name => [`.github/skills/${name}/SKILL.md`, resolve(skillsDir, name, 'SKILL.md')])];
const roots = /^(?:src|tests|scripts|site|ai|templates|packages|lab|bench|\.github)\/|^[A-Z]+\.md$|^(?:index\.html|package\.json|tsconfig\.json)$/;

for (const name of skills) test(`${name} skill has valid discovery metadata`, () => {
    const content = readFileSync(resolve(skillsDir, name, 'SKILL.md'), 'utf8');
    const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(content);
    assert.ok(frontmatter, 'missing frontmatter');
    assert.ok(frontmatter[1].split('\n').includes(`name: ${name}`), 'name must match its folder');
    const description = /^description: (".*")$/m.exec(frontmatter[1]);
    assert.ok(description, 'description must be a quoted string');
    const parsed = JSON.parse(description[1]);
    assert.ok(parsed.length >= 60 && parsed.length <= 1024);
    assert.match(parsed, /\bUse (?:when|for)\b/);
});

for (const [label, path] of documents) test(`${label} refers only to existing files and skills`, () => {
    const content = readFileSync(path, 'utf8');
    for (const [, token] of content.matchAll(/`([^`\s]+)`/g)) {
        const file = token.replace(/[),.:]+$/, '');
        if (!roots.test(file) || /[<>*{}]|x\.y\.z/.test(file)) continue;
        assert.ok(existsSync(resolve(root, file)) || generated(file), `${label} mentions missing ${file}`);
    }
    for (const [, target] of content.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
        if (/^[a-z]+:/.test(target)) continue;
        assert.ok(existsSync(resolve(dirname(path), target)), `${label} links to missing ${target}`);
    }
    for (const [, skill] of content.matchAll(/`(brio-[a-z0-9-]+)`/g)) {
        if (!skill.includes('/') && !skill.endsWith('.js')) assert.ok(skills.includes(skill), `${label} mentions unknown skill ${skill}`);
    }
});

test('AGENTS.md lists every repo skill', () => {
    const agents = readFileSync(resolve(root, 'AGENTS.md'), 'utf8');
    for (const name of skills) assert.ok(agents.includes(`\`${name}\``), `AGENTS.md does not mention ${name}`);
});
