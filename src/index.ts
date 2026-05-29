/**
 * TODO:
 * - Compare tools.reactivity.ts to the current implementation of the reactivity system.
 *   The only advantage may be that the new implementation re-evaluates the dependencies of an effect when it is triggered, 
 *   which allows for dynamic dependencies.
 *   However, I could do this by re-evaluating the dependencies when assigning an object/array with a new object/array, 
 *   which would be more efficient than re-evaluating the dependencies every time an effect is triggered.
 */

/**
 * Before each release:
 * - Test each feature to make sure it works as expected.
 * - Write documentation for each feature.
 * - Publish to GitHub and npm.
 * - Promote on social media (X, LinkedIn, etc.), forums, and other platforms (Reddit, Hacker News).
 */

export { newApp, setup } from "./app";
export { setAllDirectives } from "./directives";
export { ignoreDirective } from "./directives/ignore";
export { ifDirective } from "./directives/if";
export { dataDirective } from "./directives/data";
export { forDirective } from "./directives/for";
export { idDirective } from "./directives/id";
export { scriptDirective } from "./directives/script";
export { templateDirective } from "./directives/template";
export { showDirective } from "./directives/show";
export { transitionDirective } from "./directives/transition";
export { teleportDirective } from "./directives/teleport";
export { htmlDirective, textDirective } from "./directives/html";
export { styleDirective } from "./directives/styles";
export { bindDirective } from "./directives/bind";
export { modelDirective } from "./directives/model";
export { maskDirective } from "./directives/mask";
export { intersectionDirectives } from "./directives/intersection";
export { mutationDirectives } from "./directives/mutation";
export { resizeDirectives } from "./directives/resize";
export { onDirective } from "./directives/on";
export { effectDirective } from "./directives/effect";