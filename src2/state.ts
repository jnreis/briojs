// /**
//  * Name: micro-observer
//  * About: Utilizes ES6 Proxies to easily observe and validate changes on nested objects.
//  * Source: https://github.com/tannerntannern/micro-observer
//  * Author: Tanner Nielsen
//  * License: MIT
//  */

// /**
//  * Describes the shape of the ChangeReports that are passed to Validators.
//  */
// export type BaseReport = {
// 	target: any
// 	path: string[]
// 	property: string
// }

// export type EventType = 'create' | 'created' | 'update' | 'updated' | 'delete' | 'deleted' | 'call' | 'called'

// export type ChangeReport = {
// 	type: EventType
// 	newValue: any
// } & BaseReport

// export type CallReport = {
// 	type: 'call'
// 	function: string
// 	arguments: any[]
// } & BaseReport

// export type CalledReport = {
// 	type: 'called'
// 	function: string
// 	arguments: any[]
// 	result: any
// } & BaseReport

// export type ReportType = ChangeReport | CallReport | CalledReport

// /**
//  * Describes the format of a Validator.  Each one must accept a ChangeReport and return whether or not the change should
//  * be accepted.
//  */
// export type Validator = (change: ReportType) => boolean;

// export type Validators = {
// 	create?: Validator
// 	created?: Validator
// 	update?: Validator
// 	updated?: Validator
// 	delete?: Validator
// 	deleted?: Validator
// 	call?: Validator
// 	called?: Validator
// }

// /**
//  * Simple utility function to add a new property to an existing object path.  Examples:
//  *
//  * - getPath('obj.nested', 'prop') => 'obj.nested.prop'
//  * - getPath('', 'prop') => 'prop'
//  */
// function getPath(path: string[], prop: string) {
// 	if (path.length) return [...path, prop]
// 	else return [prop];
// }

// /**
//  * Provides simple way to "proxify" nested objects and validate the changes.
//  */
// export let Observer = (function() {

// 	// Stores the validators
// 	const _on: Validators = {
// 		create: undefined,
// 		created: undefined,
// 		update: undefined,
// 		updated: undefined,
// 		delete: undefined,
// 		deleted: undefined,
// 		call: undefined,
// 		called: undefined
// 	};

// 	function _create(target: any, path: string[], lastInPath: string) {
// 		// Keeps track of the proxies we've already made so that we don't have to recreate any.
// 		let proxies: {[prop: string]: any} = {};

// 		let proxyHandler = {
// 			get: function get(target: any, prop: string) {
// 				// Special properties
// 				if (prop === '__target') return target;
// 				if (prop === '__isProxy') return true;

// 				// Cache target[prop] for performance
// 				let value = target[prop];

// 				// Functions
// 				if (typeof value === 'function') {
// 					return function(...args: any[]) {
// 						let change: CallReport | CalledReport = {
// 							type: 'call',
// 							path,
// 							target,
// 							property: lastInPath,
// 							function: prop,
// 							arguments: args
// 						};
// 						// Validate the call before running it
// 						if (_on.call && !_on.call(change)) return;

// 						// Run the function
// 						// ! If `this` is a proxy, be sure to apply to __target instead
// 						const result = value.apply(this.__isProxy ? this.__target : this, args);

						
// 						// Notify the validator that the function was called
// 						if (_on.called) {
// 							_on.called({...change, type: 'called', result})
// 						}

// 						return result;
// 					};
// 				}

// 				// Objects
// 				else if (typeof value === 'object' && value !== null && target.hasOwnProperty(prop)) {
// 					// Return existing proxy if we have one, otherwise create a new one
// 					let existingProxy = proxies[prop];
// 					if (existingProxy && existingProxy.__target === value){
// 						return existingProxy;
// 					} else {
// 						let proxy = _create(value, getPath(path, prop), prop);
// 						proxies[prop] = proxy;
// 						return proxy;
// 					}
// 				}

// 				// All else
// 				else {
// 					return value;
// 				}
// 			},
// 			set: function set(target: any, prop: string, value: any) {

// 				let change: ChangeReport = {
// 					path: getPath(path, prop),
// 					target: target,
// 					type: 'create',
// 					property: prop,
// 					newValue: value
// 				}

// 				// Create a new prop
// 				if (!target.hasOwnProperty(prop)) {
// 					// Validate the change before making it
// 					if (_on.create && !_on.create(change)) return false;
// 					// Add the new prop
// 					target[prop] = value;
// 					// Notify the validator that the prop was created
// 					if (_on.created) {
// 						_on.created({...change, type: 'created'})
// 					}
// 				}
// 				// Update an existing prop
// 				else {
// 					// Validate the change before making it
// 					if (_on.update && !_on.update({...change, type: 'update'})) return false;
// 					// Update the prop
// 					target[prop] = value;
// 					// Notify the validator that the prop was updated
// 					if (_on.updated) {
// 						_on.updated({...change, type: 'updated'})
// 					}
// 				}

// 				return true;
// 			},
// 			deleteProperty: function deleteProperty(target: any, prop: string) {

// 				let change : ChangeReport = {
// 					path: getPath(path, prop),
// 					target: target,
// 					type: 'delete',
// 					property: prop,
// 					newValue: null
// 				}

// 				// Validate the change before making it
// 				if (_on.delete && !_on.delete(change)) return false;
// 				// Delete the prop
// 				delete target[prop];
// 				// Notify the validator that the prop was deleted
// 				if (_on.deleted) {
// 					_on.deleted({...change, type: 'deleted'})
// 				}

// 				return true;
// 			}
// 		};

// 		return new Proxy(target, <any>proxyHandler);
// 	}

// 	return {
// 		create: function(target: any, validators: Validators = {}) {
// 			// Store the validators
// 			for (let key in validators) {
// 				if (key in _on) {
// 					_on[key as keyof Validators] = validators[key as keyof Validators];
// 				}
// 			}
// 			return _create(target, [], '');
// 		}
// 	};
// })();
