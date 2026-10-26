# Brio.js Documentation

> Historical reference for the private v3 runtime. This is not the documentation
> for the npm package. Use the [current documentation](../../DOCUMENTATION.md) for current APIs.

Welcome to the official documentation for Brio.js, a powerful JavaScript framework designed to simplify web development. This guide will help you get started with Brio.js, explore its features, and understand how to use it effectively in your projects.

## Table of Contents

- [Brio.js Documentation](#briojs-documentation)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
  - [Directives](#directives)
    - [`b-options`](#b-options)
    - [`b-save`](#b-save)
    - [`b-ignore`](#b-ignore)
    - [`b-if`](#b-if)
    - [`b-props`](#b-props)
    - [`b-data`](#b-data)
    - [`b-slot`](#b-slot)
    - [`b-ref`](#b-ref)
    - [`b-for`](#b-for)
    - [`b-id`](#b-id)
    - [`b-template`](#b-template)
    - [`b-show`](#b-show)
    - [`b-teleport`](#b-teleport)
    - [`b-script`](#b-script)
    - [`b-html`](#b-html)
    - [`b-text`](#b-text)
    - [`b-style`](#b-style)
    - [`b-bind-* or bind-*`](#b-bind--or-bind-)
    - [`b-model`](#b-model)
    - [`b-mask`](#b-mask)
    - [`b-transition`](#b-transition)
    - [`b-on-* or on-*`](#b-on--or-on-)
    - [`on-enter`, `on-exit`](#on-enter-on-exit)
    - [`on-added-nodes`, `on-removed-nodes`, `on-attrs`, `on-text`](#on-added-nodes-on-removed-nodes-on-attrs-on-text)
    - [`on-resize`](#on-resize)
    - [`b-effect`](#b-effect)
  - [Methods](#methods)
    - [Reactivity API](#reactivity-api)
      - [`$state(objectOrArray, parent?)`](#stateobjectorarray-parent)
      - [`$effect(listenerFn, dependenciesFn?)`](#effectlistenerfn-dependenciesfn)
      - [`$watch(stateObjectOrArray, propName, listenerFn)`](#watchstateobjectorarray-propname-listenerfn)
      - [`$computed(fn)`](#computedfn)
      - [`$persist(value, alias?)`, `$session(value, alias?)`](#persistvalue-alias-sessionvalue-alias)
    - [Steps API](#steps-api)
      - [`$setStep(stepName, stepObject)`](#setstepstepname-stepobject)
      - [`$isStepActive(stepName)`](#isstepactivestepname)
      - [`$nextStep(currentStepName)`](#nextstepcurrentstepname)
      - [`$backStep(currentStepName)`](#backstepcurrentstepname)
      - [`$originStep(currentStepName)`](#originstepcurrentstepname)
    - [Assets Methods](#assets-methods)
      - [`$set.data(name, fn)`](#setdataname-fn)
      - [`$set.script(name, fnOrCode)`](#setscriptname-fnorcode)
      - [`$set.style(name, styleContent)`](#setstylename-stylecontent)
      - [`$set.template(name, templateContent)`](#settemplatename-templatecontent)
    - [Hydration and DOM Methods](#hydration-and-dom-methods)
      - [`$insert(target, placement, content, options?)`](#inserttarget-placement-content-options)
      - [`$hydrate(node|selector, contextNode?)`](#hydratenodeselector-contextnode)
      - [`$dehydrate(node, removeNode?, removeBNode?)`](#dehydratenode-removenode-removebnode)
      - [`$cleanup(fn)`](#cleanupfn)
      - [`$context(node|selector)`](#contextnodeselector)
      - [`$listen(node|selector, eventName, callback, options?)`](#listennodeselector-eventname-callback-options)
      - [`$emit(node|selector, eventName, eventData?)`](#emitnodeselector-eventname-eventdata)
    - [HTTP Methods](#http-methods)
      - [`$http.get(endpoint, body?, options?)`](#httpgetendpoint-body-options)
      - [`$http.post(endpoint, body?, options?)`](#httppostendpoint-body-options)
      - [`$http.put(endpoint, body?, options?)`](#httpputendpoint-body-options)
      - [`$http.patch(endpoint, body?, options?)`](#httppatchendpoint-body-options)
      - [`$http.delete(endpoint, body?, options?)`](#httpdeleteendpoint-body-options)
    - [Helper Methods](#helper-methods)
      - [`$validate(data, schema, customRules?, customMessages?)`](#validatedata-schema-customrules-custommessages)
      - [`$sync(target, source)`](#synctarget-source)
      - [`$clone(value)`](#clonevalue)
      - [`$uid(length?)`](#uidlength)
      - [`$go(to)`](#goto)
      - [`$getType(value)`](#gettypevalue)
      - [`$hasProp(object, propName)`](#haspropobject-propname)
      - [`$getProp(object, propName, defaultValue?)`](#getpropobject-propname-defaultvalue)
      - [`$setProp(object, propName, value?, descriptor?)`](#setpropobject-propname-value-descriptor)


## Introduction

Brio.js is a simple, fast, and lightweight JavaScript framework for building dynamic web applications. It provides a set of directives, methods, and properties that make it easy to create interactive user interfaces right on the browser.

## Installation

You can install Brio.js by including the script directly in your HTML file.

```html
<!-- Include Brio.js -->
<script src="https://cdn.jsdelivr.net/npm/briojs/dist/brio.min.js"></script>

<!-- Initialize Brio.js -->
<script>
  window.addEventListener('brio', () => {
    const app = brio.newApp();
    const {$hydrate} = app.gc;
    $hydrate('body');
  });
</script>
```

## Getting Started

To get started with Brio.js, create a new HTML file and include the Brio.js script as shown above. You can then start using Brio.js directives to build your application. Here's a simple example that demonstrates how to use Brio.js to create a counter:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brio.js Counter Example</title>
</head>
<body>
  <h1>Hello, Brio.js!</h1>

  <!-- Counter -->
  <div b-data="{ count: 0 }">
    <button on-click="$data.count++">Increment</button>
    <button on-click="$data.count--">Decrement</button>
    <p>Count: ${ $data.count }</p>
  </div>

  <!-- Include Brio.js -->
  <script src="https://cdn.jsdelivr.net/npm/briojs/dist/brio.min.js"></script>

  <!-- Initialize Brio.js -->
  <script>
    window.addEventListener('brio', () => {
      let app = brio.newApp();
      let {$hydrate} = app.gc;
      $hydrate('body');
    });
  </script>
</body>
</html>
```

## Directives

Brio.js provides a variety of directives that you can use to add functionality to your HTML elements. Below is a list of the available directives along with examples of how to use them.

---

### `b-options`
Provides a way to pass options to directives on the same element. The options must be an object where the keys are the exact directive names and the values are an object with the options for that directive.

These are the directives that currently support options:
- `b-bind-* or bind-*`
- `b-model`
- `b-html`
- `b-text`
- `b-template`
- `b-on-* or on-*`

```html
<!-- Example of using b-options to pass options to multiple directives -->
<div b-template="myTemplate"
     on-click-prevent="handleClick"
     b-options="{
       'b-template': { selector: '.item' },
       'on-click-prevent': { debounce: 300 }
     }">
     <!-- Note that the on-click-prevent directive is used instead of on-click. 
          When using b-options, always use the full directive name, even if it contains boolean modifiers. -->
</div>
```

---

### `b-save`

Saves template, script, and style assets straight out of the DOM to be reused globally. The element itself is removed from the DOM after processing.
```html
<!-- Saving a template. 
     See b-template, b-html, b-text for usage. -->
<h1 b-save="myTemplate">Hello, World!</h1>

<!-- Saving a script. 
     See b-script for usage. -->
<script b-save="myScript">
  () => {
    console.log('This is a saved script', $props, $data);
  }
</script>

<!-- Saving a style. 
     See b-style for usage. -->
<style b-save="myStyle">
  p {
    color: red;
  }
</style>
```

---

### `b-ignore`

Prevents Brio.js from processing the element and its children.
```html
<!-- Ignoring an element and its children -->
<div b-ignore b-effect="console.log('This will not run')">
  <p>This will not be processed by Brio.js</p>
  <p>The name "${ $data.name }" will not be interpolated.</p>
</div>
```

---

### `b-if`

Hydrates or dehydrates the element based on an expression.
```html
<!-- Conditional rendering -->
<div b-if="isVisible">
  <p>This will only be visible if isVisible is true</p>
  <p>The element and its children will be removed from the DOM when isVisible is false, and re-hydrated and re-inserted when isVisible is true again. Every time the element is re-inserted it will be treated as a new element, so any state not stored outside the element will be lost.</p>
</div>
```

---

### `b-props`

Defines the expected properties for a component, including their types, whether they are required, default values, custom validators, and whether they should be treated as pure text. All required properties must be passed or have a default value, otherwise an error will be thrown. The expression can be a reactive value. All properties can be accessed by the element and its children not under another component with valid $props.
```html
<!-- Defining props for a component -->
<div b-props="{
  name: 'string',
  age: ['number', 'string'],
  phone: {
    type: 'string', // ['string'] would also work
    required: true,
    default: 'N/A',
    isText: false,
    warn: (value, propName) => value.length < 10 ? `The ${propName} is too short` : null,
  }
}">
... component content ...
</div>
```

---

### `b-data`

Creates a new $data context object for the element and its children not under another $data context. An object can be passed as initial data, but it's optional. This is equivalent to creating a component.
```html
<!-- Creating a inline data context -->
<div b-data="{ count: 0 }">
  <button on-click="$data.count++">Increment</button>
  <button on-click="$data.count--">Decrement</button>
  <p>Count: ${ $data.count }</p>
</div>

<!-- Using a saved data function -->
<div b-data="myDataFunction">
  <button on-click="$data.count++">Increment</button>
  <button on-click="$data.count--">Decrement</button>
  <p>Count: ${ $data.count }</p>
</div>
```

---

### `b-slot`

Saves the outer HTML of the element and places it in the $slot context object under the required slot name. The $slot context lives under a b-data context.
```html
<!-- How to use the saved slots in a component template -->
<template b-template id="simple-card" b-save="mySimpleCard">
  <h2 b-template="$slot.title || $el.outerHTML">
    Title goes here
  </h2>

  <h3 b-for="n in 5" b-template="$slot.content || $el.outerHTML">
    Content goes here
  </h3>

  <h4 b-template="$slot.footer || $el.outerHTML">
    Footer goes here
  </h4>
</template>

<!-- How to pass content to the slots -->
<div b-html="mySimpleCard">
  <h2 b-slot="title">The title</h2>
  <div b-slot="content">
    <p>The content</p>
  </div>
  <div b-slot="footer">The footer</div>
</div>
```

---

### `b-ref`

Saves a reference to the element in the $ref context object under the required ref name. The $ref context lives under a b-data context. It cannot be used alongside b-if, b-for, and b-template.
```html
<!-- Saving a reference to an element -->
<div b-ref="myRef"></div>

<!-- Accessing the reference -->
<button on-click="console.log($ref.myRef)">Log the element reference</button>
```

---

### `b-for`

Renders the element for each item in an array, object, or number.
```html
<!-- Rendering a list of items -->
<ul>
  <li b-for="item in $data.items">${ $for.item }</li>
</ul>

<!-- Rendering a list of items with index -->
<ul>
  <li b-for="item, myIndex in $data.items">${ $for.myIndex }: ${ $for.item }</li>
</ul>

<!-- Note that the index is called `index` when not provided as an argument. -->
<ul>
  <li b-for="item in $data.items">${ $for.index }: ${ $for.item }</li>
</ul>
```

---

### `b-id`

Creates a new $id context for the element and its children not under another $id context. It requires an array of strings. Each string will be the key for a unique identifier stored in $id.
```html
<!-- Creating a new $id context with two unique identifiers: userId and postId. The value of each identifier is a unique string that can be used to bind attributes or for any other purpose. -->
<div b-id="['userId', 'postId']">
  <p>User ID: ${ $id.userId }</p>
  <p>Post ID: ${ $id.postId }</p>
</div>

<!-- Using b-id with b-for to generate unique identifiers for each item in a list. This is useful for binding attributes like id and name in form elements. -->
<div b-for="option in $data.options" b-id="['checkbox']">
    <input type="checkbox" bind-id="$id.checkbox" bind-name="$id.checkbox" bind-value="$for.option">
    <label bind-for="$id.checkbox">${ $for.option }</label>
    <br>
</div>
```

---

### `b-template`

Hydrates the element and its children, but does not render the element in the DOM, only its children. The template will only be hydrated once. It should not be used with self-closing elements. It cannot be used alongside b-html, b-text, b-style, bind-*, b-model, b-mask, b-transition, on-*, because these directives need to be hydrated on the element itself and not on its children.
```html
<!-- Using a saved template -->
<template b-template="myTemplate"></template>

<!-- b-template does not render the element itself. You will not see the div, only the content of the template. -->
<div b-template="myTemplate"></div>

<!-- Using an inline template -->
<template b-template>
  <div>This is an inline template</div>
</template>
```

---

### `b-show`

Shows or hides the element based on an expression.
```html
<!-- Conditional visibility -->
<div b-show="$data.isVisible">
  <p>This will be visible if isVisible is true, and hidden if isVisible is false. The element is replaced with a comment node placeholder when hidden, and the element is re-inserted in the same place when shown again. Any state on the element will be preserved when toggling visibility.</p>
</div>
```

---

### `b-teleport`

Moves the element to another place in the DOM, specified by a $ref name or a Node. Alternatively, an array can be passed, where the first item is the target and the second item specifies where to insert the element: "before", "after", "prepend", or "append". The default is "after". The expression can be a reactive value.

```html
<!-- Teleporting an element to a specified $ref -->
<div b-teleport="myTargetRef">
  <p>This element will be teleported to the target element.</p>
</div>

<!-- Teleporting an element to a specified Node -->
<div b-teleport="document.getElementById('target')">
  <p>This element will be teleported to the target element.</p>
</div>

<!-- Teleporting an element with a specified insertion point -->
<div b-teleport="['myTargetRef', 'prepend']">
  <p>This element will be teleported to the target element and inserted as the first child.</p>
</div>
```

---

### `b-script`

Runs one or more scripts on the element. The scripts can be defined via b-save or $set.script(name, function | code). When b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed. For performance, it is recommended to write the code inside an undefined arrow function. ```<script b-script> () => { /* code here */ } </script> ```
```html
<!-- Using a saved script -->
<div b-script="myScript"></div>

<!-- Using and array of saved scripts -->
<div b-script="['myScript', 'anotherScript']"></div>

<!-- Using an inline script -->
<script b-script>
    () => {
        console.log('This is an inline script', $props, $data);
    }
</script>

<!-- Fetching script from an external file -->
<script b-script src="path/to/script.js"></script>
```

---

### `b-html`

Sets the innerHTML of the element based on a saved template or an expression. The expression can be a reactive value.

```html
<!-- b-html and b-text can be reactive when using an expression. e.g. b-html="isValid ? 'success-template' : 'error-template'" -->
<div b-html="myTemplate"></div>
```

---

### `b-text`

Sets the textContent of the element based on a saved template or expression. The expression can be a reactive value.

```html
<!-- Common use of b-text -->
<span b-text="$data.myValue"></span>

<!-- b-text can also render the template as text, even if the template contains HTML. -->
<div b-text="myTemplate"></div>
```

---

### `b-style`

Scopes CSS styles to the element based on a saved style or an expression. The expression is not reactive, but the styles inside can use any reactive values.
```html
<!-- Saving a style -->
<style b-save="myStyle">
  /* Each selector will be prefixed with a unique class to scope the styles to the b-style element.
  e.g. if the unique class is .b2h4 the selectors "p, h5" will be transformed to ".b2h4 p, .b2h4 h5" */
  p, h5 {
    color: red;
  }

  /* The & character can be used to explicitly specify where the prefix should be placed in the selector. This is useful for combinators and pseudo selectors, as well as for classes that are in the same element as the b-style directive. For example, if the selector is "&.my-class" and the unique class is .b2h4, the resulting selector will be ".b2h4.my-class" instead of ".b2h4 .my-class". */
  & {
    color: blue;
  }

  /* Since the style element holds a Text Node the interpolation works like with any other Text Node, but it must evaluate to valid CSS. */
  .title {
    font-size: ${ titleSize }px; /* dynamic value in style */
  }
</style>

<!-- Using a saved style -->
<div b-style="myStyle" class="my-class">
  This text will be blue.
  <p>This text will be red.</p>
</div>

<!-- Using an array of saved styles -->
<div b-style="['myStyle', 'anotherStyle']"></div>
```

---

### `b-bind-* or bind-*`

Binds any attribute to the element based on an expression. The expression can be a reactive value.

```html
<!-- Simple attribute binding with full syntax -->
<div b-bind-id="$data.myId"></div>

<!-- Shorthand syntax for attribute binding -->
<div bind-id="$data.myId"></div>

<!-- Special inline style binding takes an object where the keys are the CSS properties in kebab-case and the values are the CSS values. The values can include the !important flag. -->
<div bind-style="$data.myReactiveStyleObject">
  myReactiveStyleObject example:
  { color: 'red', 'background-color': 'blue !important' }
</div>

<!-- Special class binding takes an object where the keys are the class names and the values are booleans indicating whether the class should be applied or not. -->
<div bind-class="$data.myReactiveClassObject">
  myReactiveClassObject example:
  { 'my-class': true, 'another-class': false }
</div>
```

---

### `b-model`

Creates a two-way typecasted data binding on input, textarea, and select elements. The expression must be a reactive value. The raw modifier disables typecasting. The trim modifier removes whitespace from the beginning and end of the input. The lazy modifier updates the model on change instead of input.
```html
<!-- Basic usage -->
<input b-model="$data.myValue">

<!-- Using modifiers -->
<input b-model="$data.myValue" b-options="{ 'b-model': { raw: true, trim: true, lazy: true } }">
```

---

### `b-mask`

Applies a mask to input and textarea elements using an array of strings and patterns.

Here are some examples of using b-mask with patterns:
```html
<!-- Phone number mask example.
     This would take an input like "7773334444" and format it as "(777) 333-4444" -->
<input type="tel" b-model="$data.phone" b-mask="['(', number(3), ') ', number(3), '-', number(4)]">

<!-- Date mask example.
     This would take an input like "01012023" and format it as "01/01/2023" -->
<input type="text" b-model="$data.date" b-mask="[number(2), '/', number(2), '/', number(4)]">

<!-- Credit card mask example.
     This would take an input like "4111111111111111" and format it as "4111 1111 1111 1111" -->
<input type="text" b-model="$data.creditCard" b-mask="[number(4), ' ', number(4), ' ', number(4), ' ', number(4)]">

<!-- HEX color mask example.
     This would take an input like "ff&g#0000" and format it as "#ff0000" -->
<input type="text" b-model="$data.color" b-mask="['#', char(/[0-9a-fA-F]/, 6)]">
```

The number(3) function above is a helper function that creates a pattern for matching 3 digits.
A pattern is an array with 3 items:
- A function that should match one character and return a boolean indicating whether the character is valid or not.
- A minimum number of characters that should match the pattern. At least one character is required.
- A maximum number of characters that should match the pattern. Must be greater than or equal to the minimum number of characters.

The phone number mask above would look like this without using the helper function:
```html
<input type="tel" b-model="$data.phone" b-mask="['(', [c => /\d/.test(c), 3, 3], ') ', [c => /\d/.test(c), 3, 3], '-', [c => /\d/.test(c), 4, 4]]">
```

Writing patterns would be cumbersome, so Brio.js provides some helper functions to create common patterns.
Here are the available helper functions:
  - `number(min = 1, max = 1)`: Unicode digits
  - `letter(min = 1, max = 1)`: Unicode letters
  - `alpha(min = 1, max = 1)`: Unicode digits and letters
  - `char(string[]|RegExp, min = 1, max = 1)`: a simple way to create custom patterns. You may provide an array of characters or a regular expression that matches one character. For example, char(['a', 'b', 'c'], 1, 3) would match between 1 and 3 characters that are either a, b, or c. char(/[abc]/, 1, 3) would do the same using a regular expression.

The static strings in the mask will be split into individual characters and included in the input as-is.

The `money()` function is a more complex helper function that creates a mask for currency input. It takes an optional configuration object with the following properties:
- thousands: the character to use as a thousands separator. Default is `,`
- decimal: the character to use as a decimal separator. Default is `.`
- precision: the number of decimal places to allow. Default is `2`
```html
<!-- Basic money mask example -->
<input type="text" b-model="$data.amount" b-mask="money()">

<!-- Money mask with custom configuration -->
<input type="text" b-model="$data.amount" b-mask="money({ thousands: '.', decimal: ',', precision: 3 })">
```

You can also **create your own custom helper functions** for handling complex patterns like the money mask above. Such helper functions are called every time the input changes and receive a $mask object with the following properties:
- `value`: the current value of the input
- `cursor`: the current position of the cursor in the input
- `updateCursor($mask, valueIndex)`: a function to update the cursor position. It receives the $mask object and the index of the character in the `value` that was just processed. This is useful for handling cases where the mask adds or removes characters from the input, which would affect the cursor position.
- `char()`, `letter()`, `number()`, and `alpha()` helper functions to create patterns, as described above.
- `output`: the final masked output that your helper generated. This is the value that will be set in the input. You can modify the value as needed to create the desired mask effect.

Your function must return the $mask object with the updated output and cursor properties. You may want to take a look at the money mask implementation in the source code for reference.

The b-mask also emits a custom "mask" event on the element every time the input changes, with the $mask object in the event detail. This allows you to perform additional actions or updates based on the masked value.
```html
<!-- Listening to the mask event -->
<input type="text" b-model="$data.amount" b-mask="money()" on-mask="console.log('Masked value:', $event.detail.output)">
```

---

### `b-transition`

Applies a transition effect to an element with the b-if or b-show directive. It requires either an inOutStyles object or an array containing inStyles and outStyles objects. The styles must include a CSS transition.

```html
<!-- Using the same styles object for in and out -->
<div b-show="$data.isVisible" b-transition="{
  opacity: 0, 
  transform: 'scale(0.9)', 
  transition: 'opacity 1s, transform 1s'
}">
  This element will fade and scale in and out when toggling visibility.
</div>

<!-- Using separate inStyles and outStyles -->
<div b-show="$data.isVisible" b-transition="[
  { opacity: 0, transform: 'scale(0.9)', transition: 'opacity 1s, transform 1s' }, // inStyles
  { opacity: 0, transform: 'scale(1.1)', transition: 'opacity 0.5s, transform 0.5s' } // outStyles
]">
  This element will fade and scale in when showing, and fade and scale out with a different effect when hiding.
</div>
```

---

### `b-on-* or on-*`

Adds event listeners to the element for the specified event name. It supports all standard DOM events and custom events. It receives the `event` object every time the event is triggered.

The following options can be set for these directives via b-options:
- `capture` If true, the event will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
- `once` If true, the observer will only execute the callback once.
- `passive` If true, the listener will never call preventDefault().
- `prevent` If true, the event's default action will be prevented.
- `stop` If true, the event's propagation will be stopped.
- `self` If true, the event will only be dispatched if the target is the same as the currentTarget.
- `outside` If true, the event will only be dispatched if the target is outside the element.
- `document` If true, the event will only be dispatched if the target is the document.
- `window` If true, the event will only be dispatched if the target is the window.
- `repeat` If false, the event will not be dispatched if the event is a key event and the key is being held down (i.e. the event is being repeated).

- `keys` If the event is a keyboard event, this option can be used to specify which keys should trigger the event. The value is an array of key names, e.g. `['control', 'enter']`. The event will only be dispatched if all the specified keys are pressed. Key names are case-insensitive and can be found in the `event.key` property of a keyboard event.
- `signal` If AbortSignal to use to cancel the event listener.
- `debounce` If time in milliseconds to wait before executing the callback.
- `throttle` If time in milliseconds to wait before executing the callback.

For convenience, all the boolean options above can also be defined after the event name in the directive name using kebab-case. The only options that cannot be defined in the directive name are `signal`, `debounce`, and `throttle`, since they require a value. The options defined in the directive name will take precedence over the options defined in b-options.
```html
<!-- Using kebab-case to set boolean options -->
<div on-click-outside-stop="console.log('Element clicked', $event)">
  Click this element to see the event object in the console.
</div>

<!-- Another common use -->
<button on-click-prevent="submitForm">Submit</button>
```

```html
<!-- Listening to a click event using inline code -->
<div on-click="console.log('Element clicked', $event)">
  Click this element to see the event object in the console.
</div>

<!-- Listening to a click event using a function stored in $data -->
<div
  b-data="{
    handleClick(event) {
      console.log('handleClick:', event);
    }
  }"
  on-click="handleClick">
  Click this element to see the event object in the console.
</div>
```

Note that in the second example above, we pass the function reference `handleClick` to the `on-click` directive without invoking it. However, you can also invoke the function directly. Also note that we do not need to reference the $data context object when using the function name, though we can if desired. Here are some variations of how to use the function with the `on-*` directive:

```html
<!-- Just the function name in one of the following context objects: $for, $data, $store  -->
<button on-click="handleClick">Click me</button>

<!-- Explicitly referencing the context object -->
<button on-click="$data.handleClick">Click me</button>

<!-- Using the function with the $event object -->
<button on-click="handleClick($event)">Click me</button>
<!-- Using the function with a custom argument -->
<button on-click="$data.handleClick('custom argument')">Click me</button>
```
Note that Brio.js will look for the function in the following context objects in this order: $for, $data, $store. This means that if there are functions with the same name in different context objects, the closest one will be used. Being able to omit the context object is a convenient feature, but writing the context object explicitly can be useful for readability and to avoid confusion when there are multiple functions with the same name in different contexts.

---

### KEYBOARD EVENTS

Brio.js makes it easy to work with keyboard events by providing a special syntax for listening to multiple keys.

---

Here's an example of how to listen to the "Enter" key on an input element:
```html
<input type="text"
       on-keyup="console.log('Enter key released', $event)" 
       b-options="{ 'on-keyup': { keys: ['enter'] } }">
```

You can also listen to multiple keys at the same time. For example, to listen to both the "Shift" and "Enter" keys, you can do the following:
```html
<input type="text" 
       on-keyup="console.log('Shift + Enter keys released', $event)" 
       b-options="{ 'on-keyup': { keys: ['shift', 'enter'] } }">
```

Aliases for common keys are also supported, so you can use "ctrl" instead of "control", "esc" instead of "escape", etc. Here's a list of the supported key aliases and their corresponding key names in `event.key`:
| Key Alias | Key Name in event.key |
|-----------|-----------------------|
| ctrl      | Control               |
| cmd       | Meta                  |
| super     | Meta                  |
| esc       | Escape                |
| del       | Delete                |
| up       | ArrowUp               |
| down     | ArrowDown             |
| left     | ArrowLeft             |
| right    | ArrowRight            |

---

### `on-enter`, `on-exit`

Adds event listeners for when an element enters or exits the viewport. It is a wrapper for the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). It receives the `entry` every time the event is triggered.

The following options can be set for these directives via b-options:
- `once` If true, the observer will only execute the callback once.
- `debounce` The time in milliseconds to wait before executing the callback.
- `root` The element that is used as the viewport for checking visibility of the target.
- `rootMargin` Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left).
- `threshold` Either a single number or an array of numbers which indicate at what percentage of the target's visibility the observer's callback should be executed. For example, a value of 0.5 means the callback will be executed when the target is 50% visible in the viewport.
```html
<!-- Listening to enter and exit events -->
<div
  on-enter="console.log('Element entered the viewport', $entry)"
  on-exit="console.log('Element exited the viewport', $entry)"
  b-options="{
    'on-enter': {once: true, debounce: 1000},
    'on-exit': {threshold: 1}
  }"
  style="height: 100px; border: 3px solid black; margin: 50px; padding: 10px;"
>
  This element will log messages when it enters and exits the viewport.
</div>
```

---

### `on-added-nodes`, `on-removed-nodes`, `on-attrs`, `on-text`

Adds an event listener for when nodes are added to or removed from the element, or when attributes or text content change. It is a wrapper for the [Mutation Observer API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver). It receives an array of added or removed nodes, or the changed attributes or text content every time the event is triggered.

The following options can be set for these directives via b-options:
- `debounce` The time in milliseconds to wait before executing the callback.
- `target` The target element to observe. If not provided, the element being hydrated will be observed.
- `subtree` If true, the observer will also observe mutations in the subtree of the element.
- `attributeOldValue` If true, the old value of the changed attribute will be included in the mutation record. Default is true. Only applicable for on-attrs.
- `attributeFilter` An array of attribute names to observe. If not provided, all attributes will be observed. Only applicable for on-attrs.
- `characterDataOldValue` If true, the old value of the changed text content will be included in the mutation record. Default is true. Only applicable for on-text.

```html
<!-- Listening to added and removed nodes -->
<div on-added-nodes="console.log('Nodes added:', $addedNodes)"
     on-removed-nodes="console.log('Nodes removed:', $removedNodes)"
     on-attrs="console.log('Attributes changed:', $attrs)"
     on-text="console.log('Text changed:', $text)"
     b-options="{
       'on-added-nodes': {
          debounce: 500, 
          subtree: true, 
          target: document.getElementById('myTarget')
        },
        'on-attrs': {
          attributeFilter: ['class', 'style']
        },
        'on-text': {
          characterDataOldValue: false
        }
     }"
     style="height: 100px; border: 3px solid black; margin: 50px; padding: 10px;">
  This element will log messages when nodes are added or removed, attributes change, or text content changes.
</div>
```

---

### `on-resize`

Adds an event listener for when the element is resized. It is a wrapper for the [Resize Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API). It receives an array containing `[inlineSize, blockSize]` every time the event is triggered.

The following options can be set for this directive via b-options:
- `document` If true, the observer will observe the document instead of the element.
- `debounce` The time in milliseconds to wait before executing the callback.
- `box` The box type to observe:
  - "content-box" - Observes the size of [content area](https://drafts.csswg.org/css-box-3/#content-area) of the element, excluding padding and border. Default value.
  - "border-box" - Observes the size of [border area](https://drafts.csswg.org/css-box-3/#border-area) of the element, including padding and border.
  - "device-pixel-content-box" - Observes the size of [content area](https://drafts.csswg.org/css-box-3/#content-area) in device pixels, before applying any CSS transforms on the element or its ancestors. This size must contain integer values.
```html
<!-- Listening to resize events -->
<div
  on-resize="console.log('Element resized', $size)"
  b-options="{
    'on-resize': {box: 'border-box'}
  }"
  style="width: 200px; height: 100px; border: 3px solid black; margin: 50px; padding: 10px; resize: both; overflow: auto;"
>
  Resize this element to see the new size in the console.
</div>
```

---

### `b-effect`

Runs a side effect function whenever the reactive values used inside the function change.
```html
<!-- Using b-effect to run a side effect whenever a reactive value changes -->
<div b-data="{ count: 0 }" b-effect="console.log('The count is now', $data.count)">
  <button on-click="$data.count++">Increment</button>
  <button on-click="$data.count--">Decrement</button>
  <p>Count: ${ $data.count }</p>
</div>

<!-- You can also use a function stored in the context -->
<div b-effect="myEffectFunction">...</div>
```
Note that if the function does not use any reactive values, it will only run once when the element is hydrated.


## Methods

Brio.js provides a set of methods that can be used in scripts and directives. These methods are available in the context of the element they are called on, so you can access them directly.

They cover a wide range of use cases and were carefully designed to be simple and intuitive, while also providing powerful and helpful functionality for building reactive applications.

---

### Reactivity API

These methods are used to create and manage reactive state in your application. They allow you to create reactive objects and arrays, define computed properties, watch for changes, and persist state across page reloads.

---

### `$state(objectOrArray, parent?)`

Creates a reactive state object for the specified object or array, with an optional parent state object (must be object, array is not supported). The returned state object/array is a Proxy that tracks changes and notifies listeners.
```js
// Creating a reactive state object
$data.john = $state({ name: 'Jhonathan', age: 35 });

console.log($data.john.name); // "Jhonathan"

// Creating a reactive state array with a parent state
$data.addresses = $state([
  { city: 'Detroit', country: 'USA' },
  { city: 'Florianopolis', country: 'Brazil' }
], $data.john);

console.log($data.addresses.name); // "Jhonathan" (inherited from parent state)
```

---

### `$effect(listenerFn, dependenciesFn?)`

Creates a reactive effect that runs the listener function whenever the dependencies change.

Parameters:
- `listenerFn`: The function to run whenever the dependencies change. It receives the ListenerFunctionContext object as an argument.
- `dependenciesFn`: An optional function that returns an array of reactive values to track as dependencies. If not provided, the effect will automatically track any reactive value accessed during the first run of the listener function.

```js
type ListenerFunctionContext = {
    operation: "create" | "delete" | "update";
    state: any; // the Proxy state object/array being watched
    target: any; // the non-Proxy original object/array being watched
    prop: string; // the property name that was changed
    newValue: any; // the new value of the property
    oldValue: any; // the old value of the property
}

/**
 * This effect will run whenever $data.count changes, and it will log the current name and count values.
 * 
 * NOTE: the listener function will always run at least once when the effect is created, so you will see the 
 *       log message in the console immediately after this code runs, and then every time $data.count changes.
 */
$effect(({ newValue }) => {
  console.log('Hi', $data.name, 'The count is now', newValue);
}, () => [$data.count]);

// This effect will run whenever any reactive value accessed during the first run changes. In this case, it will track both $data.name and $data.count.
$effect(() => {
  console.log('Hi', $data.name, 'The count is now', $data.count);
});
```

---

### `$watch(stateObjectOrArray, propName, listenerFn)`

Watches a property of a state or an entire state for changes and calls the listener function whenever changes occur.

Parameters:
- `state`: The state object/array to watch.
- `propName`: The name of the property to watch. If `propName` is a string or number, it will watch that specific property. Otherwise, it will watch the entire state object/array.
- `listenerFn`: The function to call whenever changes occur. It receives the ListenerFunctionContext object as an argument.

```js
type ListenerFunctionContext = {
    operation: "create" | "delete" | "update";
    state: any; // the Proxy state object/array being watched
    target: any; // the non-Proxy original object/array being watched
    prop: string; // the property name that was changed
    newValue: any; // the new value of the property
    oldValue: any; // the old value of the property
}

$watch($data.john, 'name', ({ newValue, oldValue }) => {
  console.log(`John's name changed from ${oldValue} to ${newValue}`);
});
```

---

### `$computed(fn)`

Creates a computed property in a state object/array that automatically updates whenever the reactive values used inside the function change. The function must return the computed value.
```js
$data.fullName = $computed(() => `${$data.firstName} ${$data.lastName}`);
```

---

### `$persist(value, alias?)`, `$session(value, alias?)`

Persists a reactive value across page reloads using localStorage or sessionStorage. The value will be automatically rehydrated when the page loads. An optional alias can be provided to use a custom key in localStorage or sessionStorage instead of the default one.
```js
// Persisting a value in localStorage with the default key
$data.username = $persist('JohnDoe'); // localStorage key: "_b_username"

// Persisting a value in sessionStorage with a custom key
$data.username = $session('JohnDoe', 'customKey'); // sessionStorage key: "customKey"
```

---

### Steps API

The Steps API allows you to define and manage unique steps in your application, which can be useful for creating tutorials, onboarding flows, multi-step forms, or any other scenario where you want to guide the user through a series of steps.

It is composed of the `$steps` object and the following methods to manage the steps:

---

### `$setStep(stepName, stepObject)`

The `$setStep` method defines a unique step in the global `$steps` object. It takes a unique `stepName` and a `stepObject` as parameters. The `stepName` is a string that identifies the step and must be unique across the entire application. The `stepObject` can have the following optional properties:

- `next`: The name of the next step to go to when calling `$nextStep(currentStepName)`.
- `back`: The name of the back step to go to when calling `$backStep(currentStepName)`.
- `origin`: The name of the step from which the current step originated. This is automatically set when navigating between steps. It is useful for handling cases where the user can navigate to the same step from different paths, and you want to be able to go back to the correct previous step based on the origin. Call `$originStep(currentStepName)` to go back to the origin step.
- `active`: Whether the step is currently active. This will be automatically set when navigating between steps. It can be used to conditionally show/hide, enable/disable, highlight, or perform any other action on elements based on the current step. It can be checked by calling `$isStepActive(stepName)`.
- `keep`: Whether to keep the current step active when going to the next step. The default behavior is to deactivate the current step when navigating between steps, but if `keep` is set to true, the current step will remain active when navigating away from it. This can be useful for cases where you want to allow multiple steps to be active at the same time, or when you want to create a non-linear navigation flow between steps.

---

### `$isStepActive(stepName)`

The `$isStepActive` method checks if a step is currently active. It takes a `stepName` as a parameter and returns a boolean indicating whether the step is active or not.

---

### `$nextStep(currentStepName)`

The `$nextStep` method navigates to the next step defined in the current step's `next` property. It takes the `currentStepName` as a parameter, looks up the next step in the `$steps` object, and activates it while deactivating the current step (unless `keep` is set to true).

---

### `$backStep(currentStepName)`

The `$backStep` method navigates to the previous step defined in the current step's `back` property. It takes the `currentStepName` as a parameter, looks up the previous step in the `$steps` object, and activates it while deactivating the current step (unless `keep` is set to true).

---

### `$originStep(currentStepName)`

The `$originStep` method navigates back to the origin step defined in the current step's `origin` property. It takes the `currentStepName` as a parameter, looks up the origin step in the `$steps` object, and activates it while deactivating the current step (unless `keep` is set to true).

---

Here's an example of how to use the Steps API to create a simple three-step tutorial:
```html
<script b-script>
  () => {
    // Defining steps in a tutorial
    $setStep('step1', { next: 'step2', active: true});
    $setStep('step2', { next: 'step3', back: 'step1'});
    $setStep('step3', { next: 'step1', back: 'step2'});
  }
</script>

<!-- Step 1 -->
<template b-template b-if="$isStepActive('step1')">
  <h2>Step 1</h2>
  <p>Get Brio.js up and running!</p>
  <button on-click="$originStep('step1')">Origin</button>
  <button on-click="$backStep('step1')">Back</button>
  <button on-click="$nextStep('step1')">Next</button>
</template>

<!-- Step 2 -->
<template b-template b-if="$isStepActive('step2')">
  <h2>Step 2</h2>
  <p>Explore the documentation and learn about the core concepts and features of Brio.js.</p>
  <button on-click="$originStep('step2')">Origin</button>
  <button on-click="$backStep('step2')">Back</button>
  <button on-click="$nextStep('step2')">Next</button>
</template>

<!-- Step 3 -->
<template b-template b-if="$isStepActive('step3')">
  <h2>Step 3</h2>
  <p>Build something amazing and share it with the community!</p>
  <button on-click="$originStep('step3')">Origin</button>
  <button on-click="$backStep('step3')">Back</button>
  <button on-click="$nextStep('step3')">Next</button>
</template>
```

---

### Assets Methods

These methods allow you to save and manage reusable assets such as data functions, scripts, styles, and templates that can be used across your application. They provide a convenient way to define and organize your assets in a central location, making it easier to maintain and reuse them throughout your application.

---

### `$set.data(name, fn)`

Saves a data function globally that can be used in any b-data directive by passing the name as a string. The function takes the parent context, if any, and must return an object.
```js
// Example of a data function that uses the parent context
$set.data('myData', (context, parentContext) => {
  return {
    message: 'Hello from myData!',
    parentMessage: parentContext ? parentContext.message : 'No parent context'
  };
});
```

---

### `$set.script(name, fnOrCode)`

Saves a script globally that can be used in any b-script directive by passing the name as a string. The script can be a function or a string of code.
```js
// Example of a script function
$set.script('myScript', ({ $props, $data }) => {
  console.log('This is myScript function', $props, $data);
});

// Example of a script string
$set.script('myScript', `console.log('This is myScript code', $props, $data)`);
```

---

### `$set.style(name, styleContent)`

Saves a style globally that can be used in any b-style directive by passing the name as a string. The styleContent may include interpolation values but must evaluate to valid CSS.
```js
// Example of styleContent with interpolation values
$set.style('myStyle', `
.title {
  font-size: \${ titleSize }px;
}`);
```

---

### `$set.template(name, templateContent)`

Saves a template globally that can be used in any b-template, b-html, or b-text directive by passing the name as a string. The templateContent may be a string of HTML or any string which may include interpolation values.
```js
// HTML template example
$set.template('myTemplate', `
<div class="card">
  <h2>\${ title }</h2>
  <p>\${ description }</p>
</div>`);

// String template example
$set.template('myStringTemplate', `Hello, \${ name }!`);
```

---

### Hydration and DOM Methods

These methods allow you to interact with the DOM, insert content, and manage the hydration state of your application. They provide a convenient way to manipulate the DOM while maintaining the reactive and declarative nature of Brio.js.

---

### `$insert(target, placement, content, options?)`

Inserts the specified content into the DOM at the specified location relative to the target node. It returns an array of inserted nodes.

Parameters:
- `target`: The target node or a selector string to query the target node.
- `placement`: A string indicating where to insert the content relative to the target. Possible values are:
  - "before": Inserts the content before the target node.
  - "after": Inserts the content after the target node.
  - "prepend": Inserts the content as the first child of the target node.
  - "append": Inserts the content as the last child of the target node.
  - "replaceWith": Replaces the target node with the content.
  - "replaceChildren": Replaces the children of the target node with the content.
  - "text": Sets the textContent of the target node to the content.
- `content`: The content to insert. It can be a HTML string, a Node, a saved template name, or a promise that resolves to one of them.
- `options`: An optional object with the following properties:
  - `hydrate` (boolean): Indicates whether to hydrate the inserted content. Default is true.
  - `selector` (string): A selector string to query a specific element from the parsed content. If not provided, the entire parsed content will be inserted.

```js
// Insert a saved template as the last child of the target element and hydrate it
$insert(targetNode, 'append', 'myTemplate');

// Insert a paragraph from an HTML string as the first child of the target element and hydrate it
$insert(targetNode, 'prepend', '<div><p id="myParagraph">Hello there!</p></div>', { selector: '#myParagraph' });

// Insert a Node after the target element without hydrating it
$insert(targetNode, 'after', document.querySelector('#someElement'), { hydrate: false });
```

---

### `$hydrate(node|selector, contextNode?)`

Hydrates the specified node and its children, processing all Brio.js directives and initializing the necessary data, effects, and event listeners. An optional context node can be provided to inherit context from.

```js
// Hydrate an element with the id "myElement"
$hydrate('#myElement');

// Hydrate an element with the id "myElement" and inherit context from the body element
$hydrate('#myElement', document.body);
```

---

### `$dehydrate(node, removeNode?, removeBNode?)`

Dehydrates the specified node and its children, cleaning up all associated data, effects, and event listeners. Optionally removes the node from the DOM and its corresponding BNode.

Parameters:
- `node`: The node to dehydrate.
- `removeNode`: If true, the node will be removed from the DOM after dehydration. Default is true.
- `removeBNode`: If true, the corresponding BNode will be removed from the internal BNode tree after dehydration. Default is true.

```js
// Dehydrate an element and remove it from the DOM
$dehydrate(document.querySelector('#myElement'));

// Dehydrate an element but keep it in the DOM and the BNode
$dehydrate(document.querySelector('#myElement'), false, false);
```

---

### `$cleanup(fn)`

Registers a cleanup function to be called when the element is being dehydrated and removed from the DOM.

```js
// Registering a cleanup function
$cleanup(() => {
  console.log('Cleaning up resources...');
  // Perform any necessary cleanup here, such as removing custom event listeners, canceling timers, etc.
});
```

---

### `$context(node|selector)`

Retrieves the context object for the specified node.

```js
// Get the context object for an element
const myElementContext = $context('#myElement');
console.log('Context for #myElement:', myElementContext);
```

---

### `$listen(node|selector, eventName, callback, options?)`

Adds an event listener to the specified node for the given event name. The callback function will be called whenever the event is triggered. The options parameter can include standard event listener options such as `capture`, `once`, `passive`, etc. It returns a function to remove the event listener.
```js
// Listen to a click event on a button
const removeListener = $listen('#myButton', 'click', (event) => {
  console.log('Button clicked', event);
});

// To remove the event listener later
removeListener();

// Or remove when the element is dehydrated using $cleanup(fn)
$cleanup(removeListener);
```

---

### `$emit(node|selector, eventName, eventData?)`

Emits a custom event with the specified name and data on the given node. The event will bubble up through the DOM tree, allowing parent elements to listen for it.
```js
// Emit a custom event with some data
$emit('#myElement', 'hello', { message: 'Hello, world!' });
```

---

### HTTP Methods

Sends an HTTP request to the specified endpoint with optional `body` and `options`. 

If the `body` is an object or array, it will be automatically be encoded to URLSearchParams for GET and DELETE requests or if the Content-Type is not specified. If the Content-Type is application/json it will be stringified to JSON, or FormData if the Content-Type is multipart/form-data. 

The response will be automatically parsed to JSON whenever possible. A `parser` can be specified in the options to override the default behavior, options are: arrayBuffer, blob, formData, json, and text. Default is "text".

#### Options example:
```js
const options = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  // parser: 'text', // Default is "text". When not set, after getting the response as text, it will attempt to parse it as JSON, and if it fails, it will return the text. You can set the parser to "json" to always parse the response as JSON, or to any of the other options to get the response in that format directly.
};
```

---

### `$http.get(endpoint, body?, options?)`
```js
// GET request example
const response = await $http.get('/api/data');
```

---

### `$http.post(endpoint, body?, options?)`
```js
// POST request example with JSON body
const response = await $http.post('/api/data', { name: 'John', age: 30 });
```

---

### `$http.put(endpoint, body?, options?)`
```js
// PUT request example with custom options
const response = await $http.put('/api/data/1', { name: 'Jane' }, { headers: { 'Content-Type': 'application/json' } });
```

---

### `$http.patch(endpoint, body?, options?)`
```js
// PATCH request example with automatic form encoding
const response = await $http.patch('/api/data/1', { name: 'Jane' }, { headers: { 'Content-Type': 'multipart/form-data' } });
```

---

### `$http.delete(endpoint, body?, options?)`
```js
// DELETE request example with `parser` option
const response = await $http.delete('/api/data/1', null, { parser: 'blob' }); // Default is "text".
```

---


### Helper Methods

These methods provide various helper functions for validating data, synchronizing objects, cloning values, generating unique identifiers, navigating routes, and more. They are designed to bring convenience and efficiency to common tasks in your application.

---

### `$validate(data, schema, customRules?, customMessages?)`

Validates a data object against a schema of rules.

Parameters:
- `data`: The data object to validate.
- `schema`: An object where the keys are the property names in the data object and the values are arrays of rules to apply to the corresponding property.
- `customRules`: An object where the keys are custom rule names and the values are functions that determine whether the rule is satisfied.
- `customMessages`: An object where the keys are custom rule names and the values are functions that return a message when the rule is not satisfied.

The function returns `true` or an object with error messages for each property that failed validation.

#### Built-in rules:

| Rule Name | Description | Default Message |
|-----------|-------------|----------------|
| required  | The property must be present and not empty. | {propName} is required. |
| min       | The property must be greater than or equal to a specified minimum value (for numbers) or length (for strings and arrays). | {propName} must be at least {ruleValue}. For strings it says: {propName} must be at least {ruleValue} characters long. |
| max       | The property must be less than or equal to a specified maximum value (for numbers) or length (for strings and arrays). | {propName} must be at most {ruleValue}. For strings it says: {propName} must be at most {ruleValue} characters long. |
| email     | The property must be a valid email address. | Email must be valid. |
| same      | The property must have the same value as another specified property. | {propName} must be the same as the {ruleValue}. |
| in        | The property must be one of the specified values. | {propName} must be equal to {ruleValue}. |
| matches   | The property must match a specified regular expression. | {propName} is invalid. |
| type      | The property must be of a specified type (e.g. string, number, boolean, array, object). Multiple types can be specified as an array (e.g. ['string', 'number']). | {propName} must be of type {ruleValue}. |
---

#### Example usage:
```js
const userData = {
  email: 'john@doe.com', 
  password: '123qw23a', 
  confirmPassword: '123qw23a',
  createdAt: '2026-01-01'
};

const userSchema = {
  email: [
    { name: 'required' },
    { name: 'email' },
  ],
  password: [
    { name: 'required' },
    { name: 'type', value: 'string' },
    { name: 'min', value: 8 },
    { name: 'max', value: 128 },
  ],
  confirmPassword: [
    { name: 'required' },
    { name: 'same', value: 'password' },
  ],
  createdAt: [
    { name: 'before', value: '2026-01-02' }, // Custom rule example
  ],
};

// Here's an example of a custom rule and custom message:
const customRules = {
  before: (value, ruleValue, data) => {
    const dateValue = new Date(value);
    const dateRuleValue = new Date(ruleValue);
    return dateValue < dateRuleValue;
  },
};
const customMessages = {
  before: (propName, ruleValue, data) => `${propName} must be a date before ${ruleValue}.`
};

const validationResult = $validate(userData, userSchema, customRules, customMessages);
console.log('Validation result:', validationResult); // true
```

---

### `$sync(target, source)`

Performs an in-place deep sync from `source` to `target`, making the target match the source exactly without losing the target reference. Supports objects, arrays, sets, and maps.

```js
const target = { name: 'Jack', hobbies: ['reading', 'gaming'], age: 30 };
const source = { name: 'John', hobbies: ['traveling'], city: 'New York' };
$sync(target, source);
console.log(target); // The target is now identical to the source but retains the same reference, including the hobbies array reference.
```

---

### `$clone(value)`

Clones a value. Cloning is done deeply for objects, arrays, sets, and maps. Primitive values are returned as-is.

```js
const original = { name: 'John', hobbies: ['reading', 'gaming'], age: 30 };
const cloned = $clone(original);
console.log(cloned); // A deep clone of the original object
console.log(cloned === original); // false (different reference)
console.log(cloned.hobbies === original.hobbies); // false (different reference for the hobbies array)
```

---

### `$uid(length?)`

Generates a unique identifier string of the specified length. If no length is provided, a default length of 8 characters is used.
```js
const id1 = $uid(); // e.g. "b1f2w7d4"
const id2 = $uid(12); // e.g. "b8c3e9f1b6g4"
```

---

### `$go(to)`

Navigates to a different route or goes back/forward in history. The `to` parameter can be a string representing the path to navigate to, or a number representing how many steps to go back (negative) or forward (positive) in the history stack.

```js
// Go back one step in history
$go(-1);

// Go forward two steps in history
$go(2);

// Navigate to a different route
$go('/about');

// Navigate to a different website
$go('https://www.example.com');
```

---

### `$getType(value)`

Returns a string representing the type of the value. e.g. "string", "number", "array", "object", "set", "map", etc.
```js
console.log($getType('Hello')); // "string"
console.log($getType(123)); // "number"
console.log($getType([1, 2, 3])); // "array"
console.log($getType({ name: 'John' })); // "object"
console.log($getType(new Set([1, 2, 3]))); // "set"
console.log($getType(new Map([['key', 'value']]))); // "map"

// Any type
console.log($getType(document.querySelector('body'))); // "htmlbodyelement"
```

---

### `$hasProp(object, propName)`

Checks if the specified property exists on the given object.

```js
const user = { name: 'John' };
console.log($hasProp(user, 'name')); // true
console.log($hasProp(user, 'age')); // false
```

---

### `$getProp(object, propName, defaultValue?)`

Retrieves a property value from the specified object. If the property does not exist, it returns the default value if provided.
```js
const logName = (user) => {
  const name = $getProp(user, 'name', 'John'); // If user.name does not exist, it will default to "John".
  console.log(`Hello, ${name}!`);
}
```

---

### `$setProp(object, propName, value?, descriptor?)`

Sets a property on the specified object with an optional value and property descriptor. The descriptor can include standard property attributes such as:
- `writable`: can reassign the value. Default is false.
- `configurable`: can delete the property or change its descriptors (like switching enumerable). Default is false.
- `enumerable`: appears in `for...in` loops and `Object.keys()`. Default is false.
- `value`: the value of the property. Default is undefined.
- `get`: a getter function for the property. Default is undefined.
- `set`: a setter function for the property. Default is undefined.

You can also use the descriptor shorthand string to set the boolean attributes. The shorthand string can include any combination of the following characters:
- `w` for writable (if not included, the property will not be writable)
- `c` for configurable (if not included, the property will not be configurable)
- `e` for enumerable (if not included, the property will not be enumerable)

```js
// Simple usage with default descriptor
$setProp(myObject, 'myProp', 'myValue'); // the property will be writable, enumerable, and configurable

// Usage with a custom descriptor
$setProp(myObject, 'myProp', 'myValue', 'wc'); // the property will be writable and configurable, but not enumerable

// Usage with regular descriptor object. The value must be included in the descriptor when using this syntax, otherwise it will be set to undefined.
$setProp(myObject, 'myProp', null, { writable: false, configurable: false, enumerable: true, value: 'myValue' });
```