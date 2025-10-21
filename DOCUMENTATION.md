# Brio.js Documentation

Welcome to the official documentation for Brio.js, a powerful JavaScript framework designed to simplify web development. This guide will help you get started with Brio.js, explore its features, and understand how to use it effectively in your projects.

## Table of Contents
- [Brio.js Documentation](#briojs-documentation)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
    - [Using npm](#using-npm)
    - [Including the Script](#including-the-script)
  - [Getting Started](#getting-started)
  - [Core Features](#core-features)
    - [Directives](#directives)
    - [Methods](#methods)

## Introduction
Brio.js is a simple, fast, and lightweight JavaScript framework for building dynamic web applications. It provides a set of directives and tools that make it easy to create interactive user interfaces.

## Installation
You can install Brio.js via npm or by including the script directly in your HTML file.

### Using npm
To install Brio.js via npm, run the following command:

```bash
npm install briojs
```

### Including the Script
Alternatively, you can include Brio.js directly in your HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Brio.js Example</title>
</head>
<body>
    <h1>Hello, Brio.js!</h1>
    <!-- Counter -->
    <div b-data="{ count: 0 }">
        <button on-click="count++">Increment</button>
        <button on-click="count--">Decrement</button>
        <p>Count: <span>{{ count }}</span></p>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/briojs/dist/brio.min.js"></script>
    <script>
        window.addEventListener('brio', () => {
            let app = brio.newApp();
            let {$dom} = app.gc;
            $dom.hydrate('body');
        });
    </script>
</body>
</html>
```

## Getting Started
To get started with Brio.js, create a new HTML file and include the Brio.js script as shown above. You can then start using Brio.js directives to build your application.

## Core Features

### Directives
Brio.js provides several directives to enhance your HTML elements:

- `b-save`: Saves template, script, and style assets from the node and its children to be reused globally. The element itself is removed from the DOM after processing.
- `b-ignore`: Prevents Brio.js from processing the element and its children.
- `b-if`: Hydrates or dehydrates the element based on an expression.
- `b-props`: Creates a new $props context object that inherits from the parent $props context, if any. An object can be passed as initial props, but it's optional.
- `b-data`: Creates a new $data context object for the element and its children not under another $data context. An object can be passed as initial data, but it's optional. This is equivalent to creating a component.
- `b-slot`: Saves the outer HTML of the element and places it in the $slots context object under the required slot name. The $slots context lives under a b-data context.
- `b-ref`: Saves a reference to the element in the $refs context object under the required ref name. The $refs context lives under a b-data context. It cannot be used alongside b-if, b-each, and b-template.
- `b-each`: Renders the element for each item in an array, object, or number.
- `b-uid`: Creates a new $uid context for the element and its children not under another $uid context. It requires an array of strings. Each string will be the key for a unique identifier stored in $uid.
- `b-template`: Hydrates the element and its children, but does not render the element in the DOM, only its children. It should not be used with self-closing elements. It cannot be used alongside b-show, b-html, b-text, b-style, bind-*, b-model, b-mask, b-transition, on-*, because these directives need to be hydrated on the element itself and not on its children.
- `b-show`: Shows or hides the element based on an expression.
- `b-teleport`: Moves the element to another place in the DOM, specified by a CSS selector or an Node. Alternatively, an array can be passed, where the first item is the target and the second item is where to insert the element: "before", "after", "prepend", or "append". The default is "after". The expression can be a rective value.
- `b-script`: Runs one or more scripts on the element. The scripts can be defined via b-save or $set.script(name, function | code). When b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed. For performance, it is recommended to write the code inside an undefined arrow function. ```<script b-script> () => { /* code here */ } </script> ```
- `b-html`: Sets the innerHTML of the element based on a saved template or an expression. The expression can be a rective value.
- `b-text`: Sets the textContent of the element based on a saved template or an expression. The expression can be a rective value.
- `b-style`: Scopes CSS styles to the element based on a saved style or an expression. The expression is not reactive, but the styles inside can use any reactive values.
- `b-bind-* or bind-*`: Binds any attribute to the element based on an expression. The expression can be a rective value.
- `b-model`: Creates a two-way data binding on form elements. It supports input, textarea, select. The expression must be reactive.
- `b-mask`: Applies an input mask to input and textarea elements. The expression can be a pattern string or a function that returns a pattern string. A pattern string can include the following special tokens:
  - `#`: Unicode digits
  - `&`: Unicode letters
  - `*`: Unicode alphanumeric characters
  - All other characters are treated as static characters and will be included in the input as-is.
  - Quantifiers:
    - `+` = all characters that match the regex until another token is found
    - `n` = for example 3 would test each character until 3 characters matching the regex are found, if a character matches another token before 3 characters are matched it would return.
    - Note: quantifiers only apply if the previous character is an unescaped token.
  - Escaping tokens and quantifiers:
    - Add `\` before a token or quantifier to escape it. It will be treated as a regular character.
  - Example:
    - The mask "(#3) #3-#4" would take 7773334444 and turn into this (777) 333-4444. Or this mask "&+ &4" would be able to take in two words like John Doe.
- `b-transition`: Applies a transition effect to the element with b-if or b-show directives. It requires an array with a "inSelector" and an "outSelector". The selectors can be the same or different. The selectors must be defined and have a CSS transition.
- `[b-on|on]-enter, [b-on|on]-exit`: Adds event listeners for when an element enters or exits the viewport. It is a wrapper for the Intersection Observer API. It receives the `entry` every time the event is triggered.
- `[b-on|on]-resize`: Adds an event listener for when the element is resized. It is a wrapper for the Resize Observer API. It receives an array containing `[inlineSize, blockSize]` every time the event is triggered.
- `[b-on|on]-[eventName]`: Adds event listeners to the element for the specified event name. It supports all standard DOM events and custom events. It receives the `event` object every time the event is triggered.
- `b-effect`: Runs a side effect function whenever the reactive values used inside the function change. Example: `<div b-effect="console.log(count)"></div>`

### Methods
Brio.js provides several methods to interact with the framework programmatically:

- `$cleanup()`: Registers a cleanup function to be called when the element is being dehydrated and removed from the DOM.