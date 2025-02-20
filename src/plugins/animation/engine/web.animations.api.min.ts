import { webAnimationsApiAnimationEngine } from "./web.animations.api";

try {
    // @ts-ignore
    $set.animationEngine(webAnimationsApiAnimationEngine);
} catch {}