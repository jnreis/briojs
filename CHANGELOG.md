# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.12.0] - 2024-06-21
- The `bind` directive now takes the initial value of the property as an argument. E.g. `class="container"` `b-class="$initial + ' mx-auto'"`. This will make it easier to bind attributes that need to be concatenated with the initial value.
- The `each` directive now can take any object or array as its argument. It does not need to be a reference anymore. It can also take a number as an argument to repeat the element n times. Note that only reactive state will trigger the reactivity system.
- The `wrapper` function now takes the evaluation array as an argument instead of calling the evaluated expression directly. This makes it more flexible and allows the evaluation to be called multiple times.
- A bug was fixed in the `if` and `show` directives regarding their reactivity. Their reactivity was being triggered inside a setTimeout function, which was causing the reactivity system to lose track of the reference.
- The `prop` directive was moved above the `each` directive in the hydration order. This was necessary because the `prop` directive may be set in the same element as the `each` directive, and the `each` directive may need to access a prop. Note: the `each` directive was also updated to pass the props to each element in the loop.
- A bug was fixed on the user-defined props. They are now being stringified and evaluated so they can have access to the "reserved names".
- A new `$http` magic property was added to the API. It is a thin wrapper around the Fetch API that allows the use of the `get`, `post`, `put`, `patch`, and `delete` methods.
- The first parameter of the interceptor function was renamed from `$ctx` to `$context` to make it more descriptive.
- The `sanitizeAttrValue` function now also removes single line comments from the expression string.
- The `$animate` method was removed.
- All transition engines were removed from the core to make the framework lighter, since no one would use them all at the same time. The developer can now choose which engine(s) to use and add them during initialization.
- The `getRefs` in the tracking system was renamed to `getAccessedProps` to make it more descriptive. The `getRef` is now `getAccessedProp`.
- The `computed` function now uses the `getAccessedProps` function to track the accessed properties.
- The `state` function now takes an optional `options` object as its second argument. It can be used to provide the observation `depth` (defaults to -1, which means unlimited depth) and to mark an object/array as `ignore`d (defaults to false), which means it will never be observed. Note that the `ignore` option does not prevent nested objects/arrays from being observed if the `state` function is called on them.
- A new `isState` function was added to the reactivity module. It checks if an object/array is being observed. It has also been added to the API.
- The directives `each`, `html`, `if`, `init`, `props`, `show`, and `uid` received a first round of tests. Many of the improvements made in this version were based on what was learned from these tests.

## [0.11.0] - 2024-06-14
- Fixed reactivity issue where the receiver was not always the observed state.
  This was creating undesired behaviors, where the object was receiving the keys of the prototype during assignment.

## [0.10.0] - 2024-06-14
- `emit` and `listen` methods were removed from the API since it was proven that they are not necessary.
- `uid`, `has`, and `size` methods were removed from the hydration tools object since they are not necessary.
- types have been updated to reflect the changes in the API.
- The `addComponent` method now takes N number of html string and sanitize them before registering the component.
- The `b-component` directive was removed. Now the `b-html` uses the components registered with the `addComponent` method.
- The `b-text` directive was removed. Now the `b-html` can handle text nodes.
- The `b-html` directive has suffered a major refactoring.
  - Now it can re-hydrate the html string passed to it and proccess the mustache syntax.
  - It can also uses the components registered with the `addComponent` method.
- The `evaluate` function now returns a number as its second value in the array.
  - 0 = not a reference;
  - 1 = reference;
  - 2 = reference is a function.
- The `hydrate` function will skip script and style tags.
- The `hydrateTextNode` function now handles the mustache syntax.
- Many comments were added to the code to make it easier to understand.

## [0.9.0] - 2024-06-11
- Every directive has been prefixed with a `b-` to avoid conflict with other frameworks and libraries, except for the directives that start with `on-`.
  This will also make it easier to identify the directives in the HTML.

## [0.8.0] - 2024-06-07
- Removed `$data` global store, since now it is possible to add global stores using the `addStore` method.
- Refactored the `$animate` method.
  - Now every option requires a value.
  - Any CSS property is accepted.
  - Support more shorthand properties:
    - tranform options: translate, scale, rotate, skew, perspective
    - filter options: blur, brightness, contrast, grayscale, hue-rotate (or just "hue"), saturate, sepia
- Added a gzip version of the library to the build process.

## [0.7.0] - 2024-06-06
- Added a new `addStore` magic method. It gives the ability to add global stores.
- Removed the `addStoreItem`, `addDataItem`, `isStorage`, `getItem`, and `setItem` methods from the API.
- Removed the `isStorage`, `getItem`, `setItem`, `getRefs`, and `getRef` exports from the reactivity module (index.ts) exports.
- Improved the way reserved names are handled.

## [0.6.0] - 2024-06-06
- Added a new `$animate` magic method. It is a thin wrapper around the Web Animations API that allows `opacity`, `blur`, and all `transforms`, as well as `duration`, `easing`, `delay`, `endDelay`, and `pause` properties.
- The `$in` and `$out` magic methods were updated to make the $ctx and $next parameters optional. This will facilitate the use of these methods in other contexts where programmatic transitions are needed.

## [0.5.0] - 2024-06-05
- Added a new `addComponent` method to the API to register components during initialization.
- Added a new `component` directive to load registered components.
- Removed `store` and `data` objects from the API and replaced them with `addStoreItem` and `addDataItem` methods that can be called during initialization.
- Standardized the error shown when adding things through the API after initialization.
- Standardized `addDirective` validation function.
- Fixed a hydration bug regard the order that the directives are hydrated.
- Fixed a hydration bug regard saving vnodes with no hydrated attributes.

## [0.4.0] - 2024-06-04
- Removed condition that prevented the "length" property of array from being notified.
- Renamed the "lifecycle" related code to "interceptor" to better reflect its purpose.
- Pass the "interceptor" function directly to the "wrapper" function to eliminate the need of an extra variable and implicitly type the function.

## [0.3.1] - 2024-05-29
- Functions `attr`, `lifecycle`, and `saveLifecycle` were added to the hydration tools object.

## [0.3.0] - 2024-05-28
- Major changes to the hydration and evaluation process. 
  - Hydration now has a robust lifecycle system based on middleware functions.
  - The `evaluate` function now always returns a function. The references now come from the tracking system of the reactivity. Expressions can now the void or any type.
- Added a `before` and `after` directive to run functions before and after the directive is executed. `$before` and `$after` methods were also added for programmatic use.
- Major improvements to the `model` directive.
  - Complete data type validation was added to make sure no invalid reference is used in the directive for a specific input type.
- A "logger" function was added to the tools. Now the logs are more standardized.
- Added a `ignore` directive to ignore the element and its children from being hydrated.
- Intersection directives are now called "on-enter" and "on-leave". They were also improved, and now all the options can be passed as modifiers.
- The `transition` directive now only takes an animation instance. The engine is automatically selected based on the animation instance.
  Animation instances created using the Web Animations API, Anime.js, or GSAP are supported out of the box. Other engines can be added using the `addTransitionEngine` method during initialization.
- The functions `computed` and `effect` of the reactivity module now can take an optional `deps` (dependecies) argument.
  This argument is used to track accessed properties when `fn` is not provided and greatly improves the performance, precision and flexibility of the reactivity system.
- A new `data` store was added to the API. It is a non-reactive global data store that can be used to store data that does not need to be tracked.