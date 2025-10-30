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

Brio.js is a simple, fast, and lightweight JavaScript framework for building dynamic web applications. It provides a set of directives, methods, and properties that make it easy to create interactive user interfaces right on the browser.

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

- `b-save`: Saves template, script, and style assets straight out the DOM to be reused globally. The element itself is removed from the DOM after processing.
- `b-ignore`: Prevents Brio.js from processing the element and its children.
- `b-if`: Hydrates or dehydrates the element based on an expression.
- `b-props`: Merges a new $props context object under a parent $props context, if any. An object can be passed as initial props, but it's optional.
- `b-data`: Creates a new $data context object for the element and its children not under another $data context. An object can be passed as initial data, but it's optional. This is equivalent to creating a component.
- `b-slot`: Saves the outer HTML of the element and places it in the $slots context object under the required slot name. The $slots context lives under a b-data context.
- `b-ref`: Saves a reference to the element in the $refs context object under the required ref name. The $refs context lives under a b-data context. It cannot be used alongside b-if, b-for, and b-template.
- `b-for`: Renders the element for each item in an array, object, or number.
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
  - `*`: Unicode digits and letters
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

- `$cleanup(fn)`: Registers a cleanup function to be called when the element is being dehydrated and removed from the DOM.
- `$clone(value)`: Clones a value. Cloning is done deeply for objects, arrays, sets, and maps. Primitive values are returned as-is.
- `$context(node)`: Retrieves the context object for the specified node.
- `$dehydrate(node, removeNode = true, removeBNode = true)`: Dehydrates the specified node and its children, cleaning up all associated data, effects, and event listeners. Optionally removes the node from the DOM and its corresponding BNode.
- `$effect(listenerFn, dependenciesFn?)`: Creates a reactive effect that runs the listener function whenever the dependencies change. If no dependencies function is provided, the effect will track all reactive values accessed during the listener function first run.
- `$emit(node, eventName, eventData?)`: Emits a custom event from the specified node, triggering any event listeners attached to that event name.
- `$getProp(object, propName, defaultValue?)`: Retrieves a property value from the specified object. If the property does not exist, it returns the default value if provided.
- `$hasProp(object, propName)`: Checks if the specified property exists on the given object.
- `$http[get|post|put|patch|delete](endpoint, body?, options?)`: Sends an HTTP request to the specified endpoint with an optional body and options. Supports GET, POST, PUT, PATCH, and DELETE methods. If the body is an object or array, it will be automatically be encoded to URLSearchParams for GET and DELETE requests or if the Content-Type is not specified, it will be stringified to JSON if the Content-Type is application/json, or FormData if the Content-Type is multipart/form-data. The response will be automatically parsed whenever possible. A `parser` can be specified in the options to override the default behavior, options are: arrayBuffer, blob, formData, json, and text.
- `$hydrate(node, contextNode?)`: Hydrates the specified node and its children, processing all Brio.js directives and initializing the necessary data, effects, and event listeners. An optional context node can be provided to inherit context from.
- `$insert(target, placement, content, options?)`: Inserts the specified content into the DOM at the specified location relative to the target node. The content can be a HTML string, Node, saved template name, or a promise that resolves to one of them. The `placement` parameter specifies the insertion point: before, after, prepend, append, replaceWith, replaceChildren, text. The options parameter can include `hydrate` (boolean) to indicate whether to hydrate the inserted content, and `selector` (string) to query an specific element from the parsed content. It returns an array of inserted nodes.
- `$listen(node, eventName, callback, options?)`: Adds an event listener to the specified node for the given event name. The callback function will be called whenever the event is triggered. The options parameter can include standard event listener options such as `capture`, `once`, `passive`, etc. It returns a function to remove the event listener.
- `$route(routePath)`: Route to a path. If the path matches a route, the route function is called with the params and path. Otherwise, the page is fetched and swapped. If the path is not on the same origin, a redirect is performed.
- `$set.data(name, fn)`: Saves a data function globally that can be used in any b-data directive by passing the name as a string. The function takes the parent context, if any, and must return an object.
- `$set.mask(tokenCharater, regex)`: Saves a custom mask token globally that can be used in any b-mask directive. The tokenCharacter is a single character string that will represent the regex in the mask pattern.
- `$set.props(name, fn)`: Saves a props function globally that can be used in any b-props directive by passing the name as a string. The function takes the parent context, if any, and must return an object.
- `$set.route(routePath, routeFn)`: Saves a route function globally that will be called whenever the specified route path is matched. The route function takes the params, path, and a remove function to remove the route.
- `$set.routeRule(ruleName, ruleFn)`: Saves a route rule function globally that can be used to validate the dynamic segments of a route. The rule function takes the segment value and must return true if the value is valid, or false otherwise.
- `$set.script(name, fnOrCode)`: Saves a script globally that can be used in any b-script directive by passing the name as a string. The script can be a function or a string of code.
- `$set.style(name, styleContent)`: Saves a style globally that can be used in any b-style directive by passing the name as a string. The styleContent may include dynamic values but must be a string that will evaluate to valid CSS.
- `$set.template(name, templateContent)`: Saves a template globally that can be used in any b-template, b-html, or b-text directive by passing the name as a string. The templateContent may include dynamic values but must be a string that will evaluate to valid HTML or text.
- `$setProp(object, propName, value = undefined, descriptor = {})`: Sets a property on the specified object with an optional value and property descriptor. The descriptor can include standard property attributes such as `writable` (can not be changed), `enumerable` (can not be listed or iterated over), `configurable` (can not be deleted), etc. or a negative descriptor shorthand string `w` (not writable), `e` (not enumerable), `c` (not configurable). Example: 'wc' would set the property as not writable and not configurable.
- `$state(objectOrArray, parent?)`: Creates a reactive state object for the specified object or array, with an optional parent state object (must be object, array is not supported). The returned state object/array is a Proxy that tracks changes and notifies listeners.
- `$sync(target, source)`: Performs a in-place deep sync from `source` to `target`. Supports objects, arrays, sets, and maps.
- `$validator(dataObject)`: Creates a validator for the specified data object. It returns an object with `prop(name, rulesStringOrObject)`, `rule(name, ruleFn, messageString)`, and `validate()` methods and a `errors` object. The `prop` method defines the rules for a property, the `rule` method defines a rule, and the `validate` method performs the validation and returns true if valid, or false otherwise. The `errors` object contains any validation errors. Default rules include: required, min, max, email, same, in, matches, type. Defining a rule with the same name as a default rule will override it for this validator instance.
- `$watch(stateObjectOrArray, propName, listenerFn)`: Watches for changes on the specified property, if string or number, of a state object or array. If the property is null or undefined it will watch the state itself. The listener function will be called whenever changes occur. It returns a function to remove the watcher.
