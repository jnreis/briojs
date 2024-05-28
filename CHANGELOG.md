# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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