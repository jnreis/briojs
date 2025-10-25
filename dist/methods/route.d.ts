export declare let newRouter: (routes: RoutesObject, routeRules: ObjectType) => [SetRoute, GetRoute];
/** Go to a route or URL */
export declare let go: (routePath: string, routeFn: FunctionType | undefined | null) => void;
