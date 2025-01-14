export declare let newLocalContext: (objectName: string, object: ObjectType, validationFunction?: FunctionType, valueType?: string) => (contextName: string, contextValue: any) => void;
export declare let newGlobalContext: (object: ObjectType, validationFunction: FunctionType, valueType: string) => (contextName: string, contextValue: any) => void;
