Brainstorming Ideas for Brio.js

Reactivity system:

- the stateObject now has a `refs` array that contains all the locations (proxiedTarget + propertyName) where the current proxiedTarget is used.
- - when a property is set:
- - - any property listeners for that proxiedTarget are called
- - - any state listeners for that proxiedTarget are called
- - - if the proxiedTarget is the same as any of the locations in the `refs` array, the proxiedTarget of the location is used to retrieve the stateObject and the property is used the retrieve and call the property listeners, if any

In other words, the `refs` array is used to track where the proxiedTarget is used, and when a property is set, the property listeners are called for all locations in the `refs` array.
