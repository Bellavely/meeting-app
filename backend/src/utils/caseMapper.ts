
export const toCamelCase = (str: string): string =>
    str.replace(/([-_][a-z])/gi, ($1) =>
        $1.toUpperCase().replace('-', '').replace('_', '')
    );

    
/**
 * Recursively converts object keys from snake_case to camelCase.
 */
export const keysToCamel = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map((v) => keysToCamel(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (acc, key) => ({
                ...acc,
                [toCamelCase(key)]: keysToCamel(obj[key]),
            }),
            {}
        );
    }
    return obj;
};
