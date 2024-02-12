import { evaluate } from "../eval"
import { isObject } from "../state/utils"

export type AnyFunction = (...args?: any) => any

export type StateCallback = (arg: { path: string, data: any, newData: any }) => void

export type ScopeRegistry = {
    [scopeName: string]: ScopeFn
}

export type ScopeFn = () => Scope

export type Scope = {
    [prop: string]: any
}

export type VNode = VElement | VText

export type VProp = {
    // The raw value of the prop
    value: string,
    // The value of the prop after interpolation
    evaluated: any,
    // The clean up functions
    cleanup: VoidFunction[],
}

export type VElement = {
    // The DOM node (e.g. div, span, input)
    node: HTMLElement,
    // The path to this node in the virtual DOM
    path: string,
    // The path to each scope available to this node
    // They are ordered from the closest to the furthest scope
    // If the virtual node references a state or method, the following happens:
    // - Each scope path is checked to see if the state or method exists
    // - An error is thrown if the state or method is `undefined` in all scopes
    scope: string[],
    // This is what makes the virtual DOM reactive
    props: {
        // The raw name of the prop (e.g. id, class, on-click)
        [name: string]: VProp
    },
    // The children of the virtual node, if any
    // Only element nodes can have children
    children: (VElement | VText)[],
}

export type VText = {
    node: Text | Comment,
    content: VProp,
}

export function frame() {
    const name = 'frame'

    const settings = {
        mode: 'init', // init, prod, dev
    }

    // These are the registered components.
    // They hold the data and logic and are used to spawn instances.
    const components = {}

    /**
     * These are the instances of the components.
     * They hold information about "where" and "when" they should be rendered.
     * They have their own "scope" and inherit the scope of their parent.
     * Their template is extracted from the DOM and stored in the "template" property.
     * Property list:
     * - name: the name of the component in the registry
     * - parentEl: the parent element of the component in the DOM
     * - nextEl: the next element of the component in the DOM
     * - scope: the scope of the component
     * - template: the source of the template (array).
     *   Each item in the array has the following structure:
     *   - type: the type of the node (e.g. div, #text, #comment) - string
     *   - props: the props of the node (e.g. class, id, on-click) - object
     *     - Structure:
     *       - name: the name of the prop (e.g. class) - string
     *       - value: the value of the prop (e.g. btn) - string
     *     - Notes:
     *       - the value of the prop can be an expression (e.g. {{ name }})
     *       - some props are special (e.g. component, if, each, on-*) 
     *         - these props don't show up in the DOM after rendering
     *   - children: the children of the node (e.g. text, comment, element) - array|string
     *   - node: the node of the template (DOM)
     *   - subscriptions: the data and events subscriptions of the node 
     *     (e.g. value, class, on-click, #text) - object
     *     - Structure:
     *       - name: the name of the subscription (e.g. value, class, #text) - string
     *         - Notes:
     *           - #text: the original text of the node containing the interpolation - string
     *           - [prop]: the name of the prop (e.g. class, value) - string
     *             - Notes: 
     *               - when the prop is referencing one piece of state without any additional logic 
     *                 this is considered a binding. If the bind is on a input element (value), it is a 
     *                 two-way binding, which means that an input event is added to the node.
     *                 Examples:
     *                 - value="{{ name }}"
     *                 - class="{{ myClass.name }}"
     *               - when the prop is referencing multiple pieces of state or has additional logic 
     *                 this is considered an expression to be evaluated and interpolated.
     *                 Examples:
     *                 - class="{{ myClass.name }} {{ myClass.isActive ? 'active' : '' }}"
     *                 - placeholder="{{ charCount }} characters"
     *       - cleanup: a clean up function - function
     *         - Notes: the clean up function is called when the node is removed from the DOM
     *           - when the component is destroyed
     *           - when an parent element is removed from the DOM (e.g. by an if directive)
     */
    const tree = state([])

    const register = () => {
        if (settings.mode == 'prod') {
            console.error('In production register can not run after initialization.')
            return
        }
        if (settings.mode == 'init') {
            settings.mode = 'prod'
        }
        const cleanup = emit(document.body, `${name}:register`, {
            detail: {
                settings,
                components,
            }
        })
        cleanup()
        // Get top level components.
        // These are the components that are not rendered by other components.
        // They are rendered by the UI framework.
        for (const ref of q('[component]')) {
            // Check if the component has a parent
            const parentRef = ref.closest('[component]')

            // If the component has a parent, it will be rendered by the parent
            if (parentRef) continue;

            const name = ref.getAttribute('component')

            // Check if the component is registered
            if (!components[name]) {
                throw new Error(`The component "${name}" is not registered.`)
            }

            // Get the template of the component
            const template = t(ref)

            // Add the component to the tree
            tree.value.push({
                name,
                parentEl: ref.parentElement,
                nextEl: ref.nextElementSibling,
                scope: components[name](),
                template,
            })
        }
    }
}

// HTML (h): Generate DOM tree from tree object
export function h(source, component = {}) {
    // Destructure array
    const {type, props, children} = source;

    // Create node
    let node;

    // Create text node
    if (['#text','#comment'].includes(type)) {
        node = type == '#text' 
            ? document.createTextNode(children) 
            : document.createComment(children);
        // Set interpolation
        interpolate(children, component.scope, (pathStr) => {
            // Get the name of the state
            subscribe(component, 'set', pathStr, (data) => {
                node.textContent = mustache(children, pathStr, data)
            })
        })
        return node;
    }

    // Create element
    node = document.createElement(type);
    // Set props
    if (props) {
        for (const key in props) {
            // Check if the prop is an event
            if (key.startsWith('on-')) {
                // Get the event name
                const eventName = key.slice(3)
                // Get the callback
                const callback = evaluate(props[key], component.scope)
                // Add event listener
                const listener = listen(node, eventName, callback)
                // Save the unsubscribe function
                component.listeners.add(listener)

                continue
            }

            // Check if the prop is bind
            // TODO: bind- is not longer needed. Refactor this.
            if (key.startsWith('bind-')) {
                // Get the attribute name
                const attrName = key.slice(5)
                // Subscribe to the data
                subscribe(component, 'set', props[key], (data) => {
                    if ([undefined,null,false].includes(data)) {
                        node.removeAttribute(attrName)
                    } else {
                        node.setAttribute(attrName, data)
                    }
                })

                continue
            }

            // Check if the prop is if
            // TODO: this just hides the node, it doesn't remove it from the DOM. Fix this.
            if (key == 'if') {
                // Subscribe to the data
                subscribe(component, 'set', props[key], (data) => {
                    node.hidden = !data
                })

                continue
            }

            // Check if the prop is each
            if (key == 'each') {
                // Get expression. e.g. "item in items" or "(item, index?, key?) in items"
                const expression = props[key]
                // Get alias from expression using regex
                const matches = expression.split(' in ')[0].match(/(\s*\w+\s*,?)+/g)[0].split(',').map(i => i.trim())
                // Check if the expression is valid
                if (matches.length == 0 || matches.length > 3) {
                    throw new Error('Invalid expression.')
                }
                // Get the name of the state
                const dataName = expression.split(' in ')[1].trim()

                // Make node an array to store the nodes
                node = []
                // Subscribe to the data
                subscribe(component, 'set', dataName, (data) => {
                    const isObject = (typeof data == 'object' && data !== null && !Array.isArray(data))
                    const alias = matches[0]
                    const d = (isObject)
                        ? Object.keys(data) // Object
                        : data // Array
                    // Copy source but remove each prop from the copy
                    const template = [type, {...props}, children]
                    delete template[1].each
                    // Render the node for each item
                    d.forEach((item, i) => {
                        // Create a new component
                        const newComponent = {
                            ...component,
                            scope: {
                                ...component.scope,
                                [alias]: isObject ? data[item] : item
                            }
                        }
                        // Add index to the scope
                        if (matches.length > 1) {
                            const index = matches[1]
                            newComponent.scope[index] = i
                        }
                        // Add key to the scope
                        if (isObject && matches.length > 2) {
                            const key = matches[2]
                            newComponent.scope[key] = item
                        }
                        // Create a new node
                        const newNode = h(template, newComponent)
                        // Append the new node
                        node.push(newNode)
                    })
                })

                continue
            }

            // Check if the prop is model
            // TODO: test this
            if (key == 'model') {
                // Get the attribute name
                const attrName = 'value'
                // Subscribe to the data
                subscribe(component, 'set', props[key], (data) => {
                    node[attrName] = data
                })
                // Add event listener
                const listener = listen(node, 'input', (event) => {
                    const value = event.target[attrName]
                    dataPath(props[key], component.scope, value)
                })
                // Save the unsubscribe function
                component.listeners.add(listener)

                continue
            }

            node.setAttribute(key, props[key]);
        }
    }
    // Append children to node
    // If the node is an array, it means the children have been generated from the "each" prop
    if (children && !Array.isArray(node)) {
        for (const child of children) {
            const c = h(child);
            // To handle each directive
            if (Array.isArray(c)) node.append(...c);
            else node.append(c);
        }
    }

    if (!Array.isArray(node)) {
        // Save the node to the component
        component.node = node
        // Save the source to the component
        component.source = source
    }

    return node;
}

/**
 * Generates a virtual DOM from a DOM node
 * @param ctx The context of the vDOM. A instance of the state module.
 * @param node The DOM node
 * @param path The path of the vNode in the context
 * @param paths The paths of the parent scopes
 * @returns 
 */
export function vDOM(ctx: any, node: HTMLElement, path: string, scope: string[]): VNode {

    const vNode: VNode = {
        node,
        path,
        scope,
        props: {},
        children: [],
    };

    // Set the scope of the virtual node, if any
    if (scopeProp(ctx, vNode)) {
        // Subscribe to the scope
        vNode.props.scope.cleanup.push(
            ctx.on('updated', `${vNode.path}.props.scope.value`, () => {
                // Update the scope
                scopeProp(ctx, vNode)
            })
        )
    }

    // Set props
    for (let { name, value } of [...node.attributes]) {
        // Skip scope prop
        if (name == 'scope') continue

        // Trim the value
        value = value.trim()

        // TODO: Set event listener
        if (name.startsWith('on-')) {
            onProp(ctx, vNode, name, value)
        }

        // TODO: Bind or interpolate prop
        else if (value.startsWith('{') && value.endsWith('}')) {
            bindProp(ctx, vNode, name, value)
        }

        // TODO: if prop
        else if (name == 'if') {
            ifProp(ctx, vNode, name, value)
        }

        // TODO: show prop
        else if (name == 'show') {
            showProp(ctx, vNode, name, value)
        }

        // TODO: each prop
        else if (name == 'each') {
            eachProp(ctx, vNode, name, value)
        }

        // TODO: ref prop
        else if (name == 'ref') {
            refProp(ctx, vNode, name, value)
        }

        // TODO: html prop
        else if (name == 'html') {
            htmlProp(ctx, vNode, name, value)
        }

        // TODO: text prop
        else if (name == 'text') {
            textProp(ctx, vNode, name, value)
        }
    }

    // Set children
    vNode.children = []
    for (const [index, child] of Array.from(node.childNodes).entries()) {
        if (child instanceof Text || child instanceof Comment) {
            // Skip empty text nodes
            if (!child.textContent?.trim().length) continue
            // Create a virtual text node
            const c: VText = {
                node: child,
            }
            // Interpolate text
            // TODO: evaluate the expression, find state references, and subscribe to them with derived
            interpolate(child.textContent, vNode.paths, (pathStr) => {
                // Get the name of the state
                subscribe(ctx, 'set', pathStr, (data) => {
                    c.node.textContent = mustache(child.textContent, pathStr, data)
                })
            })
            vNode.children.push(c)
        }
        else if (child instanceof HTMLElement) {
            // Create a virtual element node
            const c = vDOM(ctx, child, `${path}.${index}`, vNode.paths)
            vNode.children.push(c)
        }
    }

    return vNode;
}

function getElement(node: Node) {
    return node instanceof HTMLElement && node
}

function getAttr(node: HTMLElement, attr: string) {
    return node.getAttribute(attr)
}

function setAttr(node: HTMLElement, attr: string, value: string) {
    node.setAttribute(attr, value)
}

function delAttr(node: HTMLElement, attr: string) {
    node.removeAttribute(attr)
}

function scopeProp(ctx: any, vNode: VElement): boolean {
    // Get the scope value
    const value = vNode.props.scope.value && getAttr(vNode.node, 'scope')

    // Check if the node has a scope
    if (!value) return false

    let scope: Scope

    // Check if the scope is registered
    if (ctx.get(`scopes[${value}]`)) {
        scope = ctx.scopes[value]()
    }
    // Evaluate the scope value
    else {
        scope = evaluate(vNode.paths, value)
        if (typeof scope == 'function') {
            scope = scope()
        }
    }

    // Check if the scope is an object
    if (isObject(scope)) {
        if (!vNode.props.scope) {
            // Save the scope to the virtual node
            vNode.props.scope = {
                value,
                evaluated: scope,
                cleanup: [],
            }
            // Add the scope to the paths
            vNode.paths = [vNode.path, ...vNode.paths]
        }
        // Remove the scope attribute
        if (ctx.settings.mode == 'prod') {
            delAttr(vNode.node, 'scope')
        }

        return true
    }

    console.error('The scope does not evaluate to an object.', value)
    return false
}

function onProp(ctx: any, vNode: VNode, name: string, value: string): void {
}

function bindProp(ctx: any, vNode: VNode, name: string, value: string): void {
    const el = getElement(vNode.node)

    if (!el) return

    // // Get the bind props
    // const props = [...el.attributes].filter(({ name }) => name.startsWith('bind-'))

    // // Check if the node has bind props
    // if (!props.length) return

    // // Add the props to the paths
    // props.map(({ name }) => name.slice(5)), ...vNode.paths]

    // // Add the props to the subscriptions
    // vNode.subscriptions = {
    //     ...vNode.subscriptions,
    //     ...props.reduce((acc, { name, value }) => ({ ...acc, [name.slice(5)]: value }), {}),
    // }
}

function ifProp(ctx: any, vNode: VNode, name: string, value: string): void {
}

function showProp(ctx: any, vNode: VNode, name: string, value: string): void {
}

function eachProp(ctx: any, vNode: VNode, name: string, value: string): void {
}

function refProp(ctx: any, vNode: VNode, name: string, value: string): void {
}

function htmlProp(ctx: any, vNode: VNode, name: string, value: string): void {
}

function textProp(ctx: any, vNode: VNode, name: string, value: string): void {
}

// Traverse DOM tree
export function walk(node: Node, callback: (node: Node) => boolean) {
    // Call the callback on the current node
    // If the callback returns false, stop traversing the tree
    if (!callback(node)) return

    // Recursively walk through child nodes
    for (const child of node.childNodes) {
        // Skip empty text nodes
        if (child instanceof Text && !child.textContent?.trim().length) continue
        // Recursively walk through child nodes
        walk(child, callback)
    }
}

// Render DOM tree
export function render(el, treeArr) {
    // Build DOM tree
    const domArr = treeArr.map(h);
    // Append to DOM
    domArr.forEach(node => el.append(node));
}

// Emit an event on a node with optional data and return a clean up function
export function emit(node: HTMLElement, eventName: string, eventData?: any) {
    const event = new CustomEvent(eventName, eventData)
    node.dispatchEvent(event)
    return () => {
        node.removeEventListener(eventName as keyof HTMLElementEventMap, event)
    }
}

// Listen to an event on a node with a callback and return a clean up function
export function listen(node: HTMLElement, eventName: string, callback: (event: Event) => void) {
    node.addEventListener(eventName, callback)
    return () => {
        node.removeEventListener(eventName, callback)
    }
}

export function q(selector: string, root: HTMLElement = document.body) {
    return root.querySelectorAll(selector)
}

// Get interpolated data from a string
export function getInterpolation(str) {
    const regex = "{{\\s*([\\w\\.]+)\\s*}}"
    const match = str.match(new RegExp(regex, 'g'))
    if (!match) {
        return []
    }
    return [...new Set(
        match.map(match => match.match(new RegExp(regex))[1])
    )]
}

// Check if scope has values for the interpolation
export function hasInterpolation(scope, interpolation) {
    return interpolation.every(path => dataPath(path, scope) !== undefined)
}

export function interpolate(str, scope, callback) {
    const interpolation = getInterpolation(str)
    // Check if has interpolation and if the scope has values for the interpolation
    if (interpolation.length && hasInterpolation(scope, interpolation)) {
        // Call the callback
        interpolation.forEach(callback)
    }
}

export function mustache(str, variable, data) {
    return str.replace(new RegExp(`{{\\s*${variable}\\s*}}`, 'g'), data)
}

export function dataNamePath(pathStr) {
    const pathArray = splitPath(pathStr)
    const name = pathArray[0]
    const path = pathArray.slice(1).join('.')
    return {name, path}
}

export function splitPath(path) {
    // Check if the path is a string
    if (typeof path !== 'string') {
        throw new Error('The path of the state must be a string.')
    }
    // Split the path
    path = path.trim()
    return ['','.'].includes(path) ? [] : path.split('.')
}

/**
 * @param {string} path 
 * @param {*} data
 */
export function dataPath(path, data, newData = undefined) {
    // Split the path
    path = splitPath(path)

    let current = data

    if (!path.length) {
        if (newData !== undefined) {
            // This assignment won't affect the original data.
            // Use the returned data to update the original data.
            data = newData
        }
        return data
    }
    for (let i = 0; i < path.length - 1; i++) {
        // Create the path if new data is provided
        if (!current[path[i]]) {
            // Path does not exist and no new data is provided
            if (newData === undefined) {
                return undefined
            }
            // Check if the next path is an array or an object
            if (isNaN(path[i + 1])) {
                current[path[i]] = {}
            } else {
                current[path[i]] = []
            }
        }
        current = current[path[i]]
    }
    if (newData !== undefined) {
        // This assignment will affect the original data.
        current[path[path.length - 1]] = newData
    }
    // Return the data of the path
    return current[path[path.length - 1]]
}

export function state(initialData) {
    let data = initialData
    let listeners = {}
    let events = [
        'beforeCreate', 'created',
        'beforeRead',   'read',
        'beforeUpdate', 'updated',
        'beforeDelete', 'deleted'
    ]

    // Adds an event listener to a path
    function on(event, path, callback) {
        // Check if the event exists
        if (!event.includes(event)) {
            throw new Error(`The event "${event}" does not exist.`)
        }
        // Check if the callback is a function
        if (typeof callback !== 'function') {
            throw new Error('The listener of the event must be a function.')
        }
        // Check if the path already has events
        if (!listeners[path]) {
            listeners[path] = {}
        }
        // Check if the event already has listeners
        if (!listeners[path][event]) {
            listeners[path][event] = new Set()
        }
        // Add the listener to the path
        listeners[path][event].add(callback)
        // Return a clean up function
        return () => {
            listeners[path][event].delete(callback)
        }
    }

    // Notifies the listeners of an event on a path
    async function notify(event, path) {
        // Check if path exists
        if (typeof path != 'string' || !listeners[path]) {
            return
        }
        // Check if the event exists
        if (!event || !events.includes(event) || !listeners[path][event]) {
            return
        }
        // Notify every listener of the event on the path
        for (const callback in listeners[path][event]) {
            await callback(get(path, false))
        }
    }

    // Get the data of a path
    async function get(path = '', notify = true) {
        // Notify the listeners
        if (notify) {
            await notify('beforeRead', path);
        }
        const d = dataPath(path, data)
        // Notify the listeners
        if (notify) {
            notify('read', path);
        }
        return d
    }

    // Set the data of a path
    function set(newData, path = '') {
        // Check if the path exists
        const isNew = dataPath(path, data) === undefined
        // Notify the listerners
        if (isNew) {
            notify('beforeCreate', path);
        } else {
            notify('beforeUpdate', path);
        }
        // Update the data
        if (path == '') {
            data = dataPath(path, data, newData)
        } else {
            dataPath(path, data, newData)
        }
        // Notify the listeners
        if (isNew) {
            notify('created', path);
        } else {
            notify('updated', path);
        }
    }

    return {
        get value() {
            return data
        },
        set value(newData) {
            set(newData)
        },
        on,
        get,
        set,
        notify,
        subscribe,
        isReactive: true,
    }
}

export function derive(dependencies, callback) {
    // TODO: analyze the dependencies within the callback function and subscribe to them include their specific paths
    const derived = state(callback())
    dependencies.forEach(dependency => {
        dependency.on('set', '', () => {
            derived.value = callback()
        })
    })
    return derived
}

function subscribe(component, event, pathStr, callback) {
    // Get the name of the state
    const {name, path} = dataNamePath(pathStr)
    // Subscribe to the data
    const unsubscribe = component.scope[name].on(event, path, callback)
    // Save the unsubscribe function
    component.subscriptions.add(unsubscribe)
}