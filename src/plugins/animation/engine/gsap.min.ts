import { gsapAnimationEngine } from "./gsap";

try {
    // @ts-ignore
    $set.animationEngine(gsapAnimationEngine);
} catch {}