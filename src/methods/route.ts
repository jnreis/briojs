import { symbol } from "../app";
import { logError, size } from "../tools";
import { arrayAdd, each, filter } from "../tools/array";
import { NULL, OUTER, PATHNAME, CANNOT__$CAP, FUNCTION, HTML, NEW_LINE, REMOVE, ROUTE } from "../tools/constants";
import { href } from "../tools/dom";
import { delProp, getKeys, L } from "../tools/object";
import { split, startsWith, trim } from "../tools/string";
import { isArray, isFunction } from "../tools/typeCheck";
import { http } from "./http";

export let newRouter = (routes: RoutesObject, routeRules: ObjectType, insert: FunctionType): [SetRoute, Route] => ([
    // Set a route
    (routePath: string, routeFunction: FunctionType) => {
        if (isFunction(routeFunction)) {

            routePath = href(routePath, PATHNAME);

            let segments = filter(split(routePath, '/'), trim);
            let lastIndex = size(segments) - 1;
            let routesAt = routes;

            each(segments, (segment: string, segmentIndex) => {
                // Create the segment if it does not exist
                if (!(segment in routesAt)) routesAt[segment] = {};

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
     * Route to a path.
     * 
     * Notes:
     * - If the path matches a route, the route function is called with the params and path. Otherwise, the page is fetched and swapped.
     * - If the path is not on the same origin, a redirect is performed.
     * 
     * @returns `null` if redirected, `true` if the route was found, or `false` if the route was not found
     */
    (routePath: string) => {

        // Redirect to the path if it is not on the same origin
        if (!startsWith(href(routePath), L.origin)) {
            L.href = routePath;
            return NULL;
        }

        routePath = href(routePath, PATHNAME);

        let segments = filter(split(routePath, '/'), trim) as string[];
        let routesAt = routes;
        let params: ObjectType = {};

        let found = 0;

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
                        if (param) {
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

        // The route was found, call the route function
        if (found) routesAt[symbol]({
            params,
            path: routePath,
            [REMOVE]: () => delProp(routesAt, symbol)
        });

        // Otherwise, fetch and swap the page
        else insert(http.get(routePath), OUTER, HTML);

        // Push the href to the history
        if (routePath != L[PATHNAME]) history.pushState(NULL, '', routePath);

        return !!found;
    }
])