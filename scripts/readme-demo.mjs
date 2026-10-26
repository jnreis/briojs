// Records the README's animated creature-builder images from a running website.
// Usage: npm run site:build && npm run site:preview -- --port 4392
//        node scripts/readme-demo.mjs http://127.0.0.1:4392
// Requires img2webp from libwebp (for example, `brew install webp`).
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] ?? 'http://127.0.0.1:4392';
const output = fileURLToPath(new URL('../docs/assets/', import.meta.url));
const colors = ['#5b8cff', '#ff7aa8', '#ffb347', '#4fd1a5', '#a78bfa', '#ffd84d'];
const states = [
    { mood: 'sleepy', color: 4, size: 80, name: 'Bean' },
    { mood: 'mischievous', color: 1, size: 110, name: 'Mochi' },
    { mood: 'happy', color: 0, size: 100, name: 'Blip' },
];

const style = `
html, body, .demo-section { background: transparent !important; }
.mixer-workshop { box-shadow: none !important; }
.mixer-workshop *, .mixer-workshop *::before, .mixer-workshop *::after { animation: none !important; transition: none !important; }
.workshop-remix, .mixer-source { display: none !important; }
#readme-cursor { position: fixed; z-index: 10; width: 26px; height: 26px; pointer-events: none; translate: -6px -4px; }
#readme-cursor::before { content: ""; position: absolute; left: -12px; top: -12px; width: 30px; height: 30px; border-radius: 50%;
  background: #5b8cff40; border: 2px solid #5b8cff; opacity: 0; }
#readme-cursor.press::before { opacity: 1; }
#readme-cursor[hidden] { display: none; }
`;
const cursor = `<svg viewBox="0 0 26 26" width="26" height="26" aria-hidden="true"><path d="M3 2v19l5-5 3.5 8 3.5-1.5L11.5 15H18z"
  fill="#fff" stroke="#152238" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

async function record(theme) {
    const frames = mkdtempSync(join(tmpdir(), `brio-readme-${theme}-`));
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce' });
        await page.goto(`${base}/`);
        await page.locator('#creature-builder .creature').waitFor();
        await page.addStyleTag({ content: style });
        await page.evaluate(markup => {
            const pointer = document.createElement('div');
            pointer.id = 'readme-cursor';
            pointer.hidden = true;
            pointer.innerHTML = markup;
            document.body.append(pointer);
        }, cursor);
        const workshop = page.locator('.mixer-workshop');
        await workshop.scrollIntoViewIfNeeded();

        const timeline = [];
        const shoot = async duration => {
            const file = join(frames, `${String(timeline.length).padStart(3, '0')}.png`);
            await workshop.screenshot({ path: file, omitBackground: true, animations: 'disabled', caret: 'initial' });
            timeline.push([duration, file]);
        };
        const point = (x, y, press = false) => page.evaluate(([x, y, press]) => {
            const pointer = document.getElementById('readme-cursor');
            Object.assign(pointer.style, { left: `${x}px`, top: `${y}px` });
            pointer.hidden = false;
            pointer.classList.toggle('press', press);
        }, [x, y, press]);
        const center = async locator => {
            const box = await locator.boundingBox();
            return [box.x + box.width / 2, box.y + box.height / 2];
        };
        const click = async (locator, act) => {
            const [x, y] = await center(locator);
            await point(x, y);
            await shoot(280);
            await act();
            await point(x, y, true);
            await shoot(380);
        };
        const slider = page.locator('#creature-builder input[type="range"]');
        const thumb = async value => {
            const box = await slider.boundingBox();
            return [box.x + 8 + (box.width - 16) * (value - 70) / 60, box.y + box.height / 2];
        };
        const setSize = value => slider.evaluate((input, value) => {
            input.value = String(value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }, value);
        const nameInput = page.locator('#creature-builder input:not([type])');
        const setName = value => nameInput.evaluate((input, value) => {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }, value);

        await shoot(1400);
        for (const state of states) {
            const mood = page.locator(`#creature-builder input[value="${state.mood}"]`);
            await click(mood.locator('xpath=..'), () => mood.evaluate(input => input.click()));
            const swatch = page.locator('#creature-builder .swatch').nth(state.color);
            await click(swatch, () => swatch.evaluate(button => button.click()));

            let size = Number(await slider.inputValue());
            await point(...await thumb(size));
            await shoot(260);
            while (size !== state.size) {
                size += Math.sign(state.size - size) * Math.min(5, Math.abs(state.size - size));
                await setSize(size);
                await point(...await thumb(size), true);
                await shoot(70);
            }
            await point(...await thumb(size));
            await shoot(200);

            await point(...await center(nameInput));
            await nameInput.focus();
            await nameInput.evaluate(input => input.select());
            await shoot(360);
            for (let length = 1; length <= state.name.length; length++) {
                await setName(state.name.slice(0, length));
                await shoot(length === state.name.length ? 260 : 120);
            }
            await nameInput.blur();
            await page.evaluate(() => { document.getElementById('readme-cursor').hidden = true; });
            const color = await page.locator('#creature-builder .creature').evaluate(node => node.style.getPropertyValue('--body'));
            if (color !== colors[state.color]) throw new Error(`Expected ${colors[state.color]}, got ${color}`);
            await shoot(1400);
        }
        // The last state returns to Blip, which is the first frame, so the loop closes cleanly.
        timeline.pop();

        const file = join(output, `creature-builder-${theme}.webp`);
        const args = ['-loop', '0', '-lossy', '-q', '88', '-m', '6', '-o', file];
        for (const [duration, frame] of timeline) args.push('-d', String(duration), frame);
        execFileSync('img2webp', args, { stdio: 'inherit' });
        const seconds = timeline.reduce((total, [duration]) => total + duration, 0) / 1000;
        console.log(`${file}: ${timeline.length} frames, ${seconds.toFixed(1)}s, ${Math.round(statSync(file).size / 1024)} KB`);
    } finally {
        await browser.close();
        rmSync(frames, { recursive: true, force: true });
    }
}

for (const theme of ['light', 'dark']) await record(theme);
