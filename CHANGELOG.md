# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.24.0] - 2024-09-20

- The Brio.js framework no longer automatically hydrates the HTML on load. One or more independent Brio apps must be created by calling brio.newApp('selector'|node).
- brio.newApp() returns the Global Scope (gc) object with all magic methods and properties and it can be used to add directives, methods, transition engines, stores, components, props, data, hooks, etc.
- A `brio` event is dispatched in the window object to indicate that Brio.js is ready. This event can be used to start the hydration process.
- A simple router was added to the core. It can be used to create single-page applications or to make a multi-page application feel like a single-page application.
- The evaluation module is no longer using `with()` to directly access the properties of $props. Properties now are accessed using the $props object. This change is more clear and performant.
- The `vnode` object was refactored to be more efficient and flexible. It now has the structure to handle the addition of local context during runtime.
- The `b-save` directive was added to register reusable HTML snippets (template, script, style). It run at the beginning of the hydration process. A `b-save` can be added to any html element, including `<template>` elements.
- `on-resize` directive was added to the core. It is a thin wrapper around the ResizeObserver API.
- The hydration of HTML elements is now a lot more robust and clear.
- Now the hydration function of a directive receives every hydration tool necessary to hydrate a directive. This gives developers all the tools necessary to create custom directives, even during runtime.
- A check was added to ensure Brio.js is not loaded more than once. This will prevent unecessary work and potential hydration issues when loading HTML via HTTP requests.
- A lot more was done, documentation is being written and tests are being created.

## [0.21.0] - 2024-08-31

- [REVERSED] The custom prototype chain/enheritance system was removed from the reactivity system due to unexpected behaviors, ever-growing complexity, and bundle size.
- Reactivity system: async listeners are now supported and will be awaited before the next listener is called.
- Bind directive: the "disabled" will not longer be forced. It will only be set if the value evaluates to true.
- Model directive: Quick fix on isCheckboxGroup.

## [0.20.0] - 2024-08-24

- Child $props were not reacting to changes when the prop belonged to a parent $props.
- State will no longer attempt to observe getters and setters.

## [0.19.0] - 2024-08-12

- The interceptor system was re-implemented. It is now called "hooks" and provide the additional features:
  - it was flattened to a single map. Now the priority system is more efficient and easier to maintain.
  - automatically calls the next hook in the chain. The developer can also call the next hook manually by pausing the execution of the hook chain and calling the `play` method to resume the execution later.
  - ability to handle async functions.
  - added a new `controls` object that allows the developer to `pause` and `play` the execution of the hooks, as well as a `remove` method to remove the current hook.
  - a `addHook` method was added to the API to add hooks before initialization.
- The reactivity system now can handle async functions if the dependencies function is synchronous.
- The `$before` an `$after` methods were replaced by the `$hook` method.
- The `root` property was replaced by the `$root` method. It is now possible for an element to get the root element of another element.
- The directives `b-effect`, `b-html`, and `b-init` can now take an async function as their expression.

## [0.18.0] - 2024-08-10

- A priority system was added to the reactivity system. Now the reactivity system will prioritize the notifications based on the priority of the listener. The default priority is 0. The higher the priority, the sooner the listener will be notified. Negative priorities are allowed.

## [0.17.0] - 2024-08-09

- Prepared Brio for becoming fully modular. The core is now a thin layer that can be extended with directives, methods, transition engines, and stores. With this change, even the core methods can be removed if they are not needed.
- Reserved names are now better tracked and handled.
- The b-if, b-show, and b-each directives are above the b-props directive in the hydration order.
- The framework was prepared to receive a new interceptor system that will allow the developer to place functions anywhere in the hydration and evaluation processes.

## [0.16.0] - 2024-07-29

- evaluation.ts and hydration.ts were moved to the tools folder.

## [0.15.0] - 2024-06-28

- The `bind` directive now has a shorthand syntax. E.g. b-name="name" can be written as b-name. It also force the binding of the "src", "value", "checked", "selected", and "disabled" attributes and set their DOM properties.
- The `model` directive went through a major refactoring. The reactive state is now trully the source of truth. The handling of multiple checkboxes and multiple select options is now very robust. In addition, null, number, and boolean strings are now automatically typecasted. The "raw" modifier was added to the directive to prevent the typecasting when needed. The validation is much more robust and error messages are more informative.
- The built-in methods are now being loaded using a loop. This makes it easier to add new methods, improves readability, and reduces the size of the code.
- A $type magic method was added. It is a more robust and reliable way to check the type of a value.
- The helper methods "size", "isNumber", "isNumeric", and "toNumber" have been adjusted and refined to be more reliable and robust, by handling more edge cases.
- The `bind` and `model` directives have been properly tested and documented.

## [0.14.0] - 2024-06-22

- Fixed a bug in the `getAccessedProps` function. Now it returns all the accessed properties. The code related to navigating to the accessed properties and filtering the duplicates, etc. was moved to the `getAccessedProp` function.

## [0.13.0] - 2024-06-22

- The `$http` magic property is now a magic method. It allows the use of the `get`, `post`, `put`, `patch`, and `delete` methods. As well as creating custom instances of $http with base URL and global options.

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
