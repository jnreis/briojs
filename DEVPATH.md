# Development Path

## Purpose

Be able to build web apps directly in the browser, without the need for overly complicated build tools. The goal is to create a simple, yet powerful, web development environment that, at its core, relies only on web standards and native JavaScript APIs. HTML5 as template language, bringing forth the power of JavaScript APIs through directives and methods.

## Brio.js Frontend Framework

A JavaScript frontend framework for building dynamic web applications using directives and methods that implement reactive programming and simplify JavaScript native APIs.
Business logic is written in external Javascript files, inline script, or directly in the HTML template using directives and methods that are executed by the framework. No special syntax or templating language is required.

## Brio.js App Builder

A visual tool for building Brio.js applications with no-code, low-code, and full-code options. The App Builder generates well-structured HTML, CSS, and JavaScript code. It can be used to edit any existing HTML file or create a new one from scratch.

### App Builder Features

- Basic look and feel will be a mix of Elementor and Framer. An "Advanced" mode will bring forth a Webflow-like experience.

- Elements left sidebar
- Properties right sidebar
- Styles right sidebar
- Code editor modal
- Screen size controls
- Preview mode
- Export to Standard (HTML, CSS, and JavaScript), Astro

### App Builder MVP

- Basic structure: Screen size controls, Elements sidebar, Properties sidebar, Preview mode
- Drag-and-drop functionality
- Standard export


lsicon:computer-filled
lsicon:computer-outline
ri:computer-fill
ri:computer-line

icon-park-outline:new-computer
icon-park-solid:new-computer

bi:tablet
bi:tablet-fill
bi:tablet-landscape
bi:tablet-landscape-fill

bi:phone
bi:phone-fill
bi:phone-landscape
bi:phone-landscape-fill


### Expression Types

- bind: expression
- props, data: asset name, object, expression
- each: expression (e.g. item, index in items). "items" can be an array, object, or number
- html, text: asset name, string, expression
- if: expression
- ignore: empty, expression
- on-enter, on-exit: expression
- mask: string, expression
- model: reactive reference
- on-[event]: expression (warn if not a function)
- ref: string
- on-resize: expression
- script: asset name, expression (multiple scripts allowed)
- show: expression
- style: asset name, expression
- teleport: string selector, [string selector, where]
- template: asset name, expression
- transition: expression (an valid animation object)
- uid: string[]
- NOTE: every "expression" can be a "reactive reference"