import { getArgs, processExpression } from './utils'

/**
 * Evaluates an expression and returns a function
 * @param expression the expression to be evaluated
 * @param scope data to be used by the expression
 * @returns a function to execute the expression
 */
export function evaluate(expression: string, scope: any): () => any {

    const args = getArgs(expression)

    console.log('args', args)

    // Outter function arguments
    const outterArgs = args.length > 0 ? args[0] : []

    // Inner function arguments
    const innerArgs = args.length > 1 ? args[1] : []

    // Get scope variables
    const scopeVars = Object.keys(scope)

    // Process the expression
    expression = processExpression(expression, scope)

    // Create the function body
    const body = `return (${outterArgs.join(', ')}) => {
        const {${scopeVars.join(', ')}} = scope;
        let expression = ${expression}
        if (typeof expression === 'function') {
            return expression(${innerArgs.join(', ')})
        } else {
            return expression
        }
    }`

    console.log(body)

    // Create a function using the Function constructor
    const f = new Function('scope', body)
    // Call the function and return the result
    return f(scope)
}