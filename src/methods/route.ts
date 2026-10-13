import { symbol } from "../app";
import { logError, size } from "../tools";
import { arrayAdd, each, filter } from "../tools/array";
import { NULL, PATHNAME, CANNOT__$CAP, FUNCTION, NEW_LINE, REMOVE, ROUTE } from "../tools/constants";
import { href, sameOrigin } from "../tools/dom";
import { delProp, getKeys, hasProp, L } from "../tools/object";
import { split, startsWith, trim } from "../tools/string";
import { isArray, isFunction } from "../tools/typeCheck";

export let newRouter = (routes: RoutesObject, routeRules: ObjectType): [SetRoute, GetRoute] => ([
    // Set a route
    (routePath: string, routeFunction: FunctionType) => {
        if (isFunction(routeFunction)) {

            routePath = href(routePath, PATHNAME);

            let segments = filter(split(routePath, '/'), trim);
            let lastIndex = size(segments) - 1;
            let routesAt = routes;

            if (!size(segments)) {
                routesAt[symbol] = routeFunction;
                return;
            }

            each(segments, (segment: string, segmentIndex) => {
                // Create the segment if it does not exist
                if (!hasProp(routesAt, segment)) routesAt[segment] = {};

                // Navigate to the segment
                routesAt = routesAt[segment];

                // Set the route function, if it is the last segment
                if (segmentIndex == lastIndex) routesAt[symbol] = routeFunction;
            });
        }
        // Error: The route function must be a function
        else logError(CANNOT__$CAP, 'set route without a', ROUTE, FUNCTION, NEW_LINE, routePath);
    },

    /**
     * Get a route function by path.
     * 
     * @returns The route function, or `undefined` if not found, or `null` if not the same origin
     */
    (routePath: string) => {

        // Not the same origin, return null
        if (!sameOrigin(routePath)) {
            return NULL;
        }

        routePath = href(routePath, PATHNAME);

        let segments = filter(split(routePath, '/'), trim) as string[];
        let routesAt = routes;
        let params: ObjectType = {};

        let found = segments.length === 0 && routesAt[symbol] ? 1 : 0;

        // let route = '';

        // Loop through the segments
        for (let segment of segments) {

            // Reset the found flag
            found = 0;

            // Matches a non-dynamic route
            if (segment in routesAt && !startsWith(segment, ':')) {
                // Navigate to the segment
                routesAt = routesAt[segment];
                // route += '/' + segment;
                found = 1;
            }
            // Get dynamic routes at this level
            else for (let dynamicSegment of getKeys(routesAt)) {

                // Match a dynamic route
                if (startsWith(dynamicSegment, ':')) {

                    // Get the name of the parameter and the validation function
                    let [ paramName, ruleName ] = filter(split(dynamicSegment, ':'), trim);

                    // Check if the dynamic segment is valid
                    if (!ruleName || (ruleName && ruleName in routeRules && routeRules[ruleName](segment))) {

                        let param = params[paramName];

                        // Add the parameter to the params object
                        if (param !== undefined) {
                            // If the parameter is an array, add the segment to the array
                            if (isArray(param)) arrayAdd(param, segment);
                            // Otherwise, convert the parameter to an array
                            else params[paramName] = [param, segment];
                        }
                        // Add the parameter to the params object
                        else params[paramName] = segment;

                        // Navigate to the segment
                        routesAt = routesAt[dynamicSegment];

                        // Set the found flag
                        found = 1;

                        // route += '/' + dynamicSegment;

                        // Break the dynamic segment loop
                        break;
                    }
                }
            }

            // If the segment was not found, break the loop
            if (!found) break;
        }

        // The route was found if the last segment has a route function
        found = found && routesAt[symbol] ? 1 : 0;

        // If the route was found, return a function to call the route
        if (found) {
            return () => routesAt[symbol]({
                params,
                path: routePath,
                [REMOVE]: () => delProp(routesAt, symbol)
            });
        }
    }
]);

/** Go to a route or URL */
export let go = (routePath: string, routeFn: FunctionType | undefined | null) => {

    // Normalize the route path
    routePath = href(routePath);

    // Same origin and a route function exists
    if (routeFn && sameOrigin(routePath)) {

        // Call the route function
        routeFn();

        // Push the route to the history
        // Note: do not push the route to the history when the browser back/forward buttons are used. This is because the browser will handle the history automatically.
        if (routePath != L[PATHNAME]) history.pushState(NULL, '', routePath);
    }
    // Not same origin or no route function, go to the URL
    else {
        L.href = routePath;
    }
}