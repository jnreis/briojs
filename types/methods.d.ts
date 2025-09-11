type InsertOptions = {
    /** A selector to query an element from the content */
    select?: string,
    /** Whether to hydrate the inserted nodes (default: true) */
    hydrate?: boolean,
    /** An async callback function to be called with the inserted nodes */
    then?: (nodes: Node[]) => Promise<void> | void
}

/**
 * The object that holds the saved routes.
 * 
 * Notes:
 * - It contains the routes, broken down into segments.
 * - Each segment is an object. The last segment is also an object that contains the routeSymbol key, which is the route function.
 * - Routes may be static or dynamic.
 * - Dynamic segments start with a colon, followed by the name of the parameter. E.g. :id
 * - Dynamic segments may also have a validation function separated by a colon.  E.g. :id:number
 */
type RoutesObject = {
    [segment: string]: RoutesObject;
    [routeFunction: symbol]: RouteFunction;
}

type RouteRulesObject = {
    [ruleName: string]: (value: string) => boolean,
    number: (value: string) => boolean,
}

type SetRoute = (routePath: string, routeFunction: RouteFunction) => void;

type RouteFunctionArgs = {
    params: ObjectType,
    path: string,
    remove: FunctionType
};
type RouteFunction = (args: RouteFunctionArgs) => void;

/**
 * Route to a path.
 * 
 * Notes:
 * - If the path matches a route, the route function is called with the params and path. Otherwise, the page is fetched and swapped.
 * - If the path is not on the same origin, a redirect is performed.
 * 
 * @returns `null` if redirected, `true` if the route was found, or `false` if the route was not found
 */
type Route = (routePath: string) => null | boolean;

/** The parser to use when parsing a HTTP response */
type ResponseParser = 'json'|'text'|'blob'|'arrayBuffer'|'formData';

/** The options to pass to a HTTP request */
interface HttpOptions extends RequestInit {
    parser?: ResponseParser;
    headers?: HeadersInit | { [key: string]: string };
}