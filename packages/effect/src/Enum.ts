export type StringKeyOf<T> = Extract<keyof T, string>;

const enumWrapperInstancesCache = new WeakMap<object, EnumWrapper>();
export function isNonNumericKey(key: string): boolean {
    return key !== String(parseFloat(key));
}

export const getOwnEnumerableNonNumericKeys = function getOwnEnumerableNonNumericKeysES6<
    T extends Record<string, any>
>(obj: T): StringKeyOf<T>[] {
    return Object.getOwnPropertyNames(obj).filter((key) => {
        return obj.propertyIsEnumerable(key) && isNonNumericKey(key);
    }) as StringKeyOf<T>[];
}

export function wrapEnum<
    V extends string,
    T extends Record<StringKeyOf<T>, number>
>(enumObj: T): EnumWrapper<number, T>;

export function wrapEnum(enumObj: object): EnumWrapper {
    let result = enumWrapperInstancesCache.get(enumObj);

    if (!result) {
        result = new EnumWrapper(enumObj);
        enumWrapperInstancesCache.set(enumObj, result);
    }

    return result;
}

export namespace EnumWrapper {
    export type Entry<
        T extends Record<StringKeyOf<T>, number | string> = any
    > = Readonly<[StringKeyOf<T>, T[StringKeyOf<T>]]>;
}


export class EnumWrapper<
    V extends number | string = number | string,
    T extends Record<StringKeyOf<T>, V> = any
> implements Iterable<EnumWrapper.Entry<T>>, ArrayLike<EnumWrapper.Entry<T>> {
    /**
    * Index signature.
    * Part of the ArrayLike interface.
    */
    readonly [key: number]: EnumWrapper.Entry<T>;

    /**
     * Map of enum value -> enum key.
     * Used for reverse key lookups.
     * NOTE: Performance tests show that using a Map (even if it's a slow polyfill) is faster than building a lookup
     *       string key for values and using a plain Object:
     *       {@link https://www.measurethat.net/Benchmarks/Show/2514/1/map-keyed-by-string-or-number}
     */
    //private readonly keysByValueMap: ReadonlyMap<V, StringKeyOf<T>>;

    /**
     * The number of entries in this enum.
     * Part of the Map-like interface.
     */
    public readonly size: number;

    /**
     * The number of entries in this enum.
     * Part of the ArrayLike interface.
     */
    public readonly length: number;

    /**
      * List of all keys for this enum, in the original defined order of the enum.
      */
    private readonly keysList: ReadonlyArray<StringKeyOf<T>>;

    /**
     * List of all values for this enum, in the original defined order of the enum.
     */
    private readonly valuesList: ReadonlyArray<T[StringKeyOf<T>]>;

    public constructor(enumObj: T) {
        // Include only own enumerable keys that are not numeric.
        // This is necessary to ignore the reverse-lookup entries that are automatically added
        // by TypeScript to numeric enums.
        this.keysList = Object.freeze(getOwnEnumerableNonNumericKeys(enumObj));
        console.log(enumObj)

        const length = this.keysList.length;
        const valuesList = new Array<T[StringKeyOf<T>]>(length);
        const keysByValueMap = new Map<V, StringKeyOf<T>>();

        // According to multiple tests found on jsperf.com, a plain for loop is faster than using
        // Array.prototype.forEach
        for (let index = 0; index < length; ++index) {
            const key = this.keysList[index];
            const value = enumObj[key];

            valuesList[index] = value;
            keysByValueMap.set(value, key);
            // Type casting of "this" necessary to bypass readonly index signature for initialization.
            (this as any)[index] = Object.freeze([key, value]);
        }

        this.valuesList = Object.freeze(valuesList);
        //this.keysByValueMap = keysByValueMap;
        this.size = this.length = length;

        // Make the EnumWrapper instance immutable
        Object.freeze(this);
    }

    /**
    * Get an iterator for this enum's entries as [key, value] tuples.
    * Iteration order is based on the original defined order of the enum.
    * @return An iterator that iterates over this enum's entries as [key, value] tuples.
    */
    public [Symbol.iterator](): IterableIterator<EnumWrapper.Entry<T>> {
        return this.entries();
    }

    /**
     * Get an iterator for this enum's entries as [key, value] tuples.
     * Iteration order is based on the original defined order of the enum.
     * @return An iterator that iterates over this enum's entries as [key, value] tuples.
     */
    public entries(): IterableIterator<EnumWrapper.Entry<T>> {
        let index = 0;

        return {
            next: () => {
                const isDone = index >= this.length;
                const result: IteratorResult<EnumWrapper.Entry<T>> = {
                    done: isDone,
                    // NOTE: defensive copy not necessary because entries are "frozen"
                    value: this[index]
                };

                ++index;

                return result;
            },

            [Symbol.iterator](): IterableIterator<EnumWrapper.Entry<T>> {
                return this;
            }
        };
    }

    /**
 * Get an iterator for this enum's values.
 * Iteration order is based on the original defined order of the enum.
 * Part of the Map-like interface.
 * NOTE: If there are duplicate values in the enum, then there will also be duplicate values
 *       in the result.
 * @return An iterator that iterates over this enum's values.
 */
    public values(): IterableIterator<T[StringKeyOf<T>]> {
        let index = 0;

        return {
            next: () => {
                const isDone = index >= this.length;
                const result: IteratorResult<T[StringKeyOf<T>]> = {
                    done: isDone,
                    value: this.valuesList[index]
                };

                ++index;

                return result;
            },

            [Symbol.iterator](): IterableIterator<T[StringKeyOf<T>]> {
                return this;
            }
        };
    }

    /**
     * Get a list of this enum's values.
     * Order of items in the list is based on the original defined order of the enum.
     * NOTE: If there are duplicate values in the enum, then there will also be duplicate values
     *       in the result.
     * @return A list of this enum's values.
     */
    public getValues(): T[StringKeyOf<T>][] {
        // need to return a copy of this.valuesList so it can be returned as Array instead of ReadonlyArray.
        return this.valuesList.slice();
    }

    public getKeys(): StringKeyOf<T>[] {
        // need to return a copy of this.valuesList so it can be returned as Array instead of ReadonlyArray.
        return this.keysList.slice()
    }
}

export function $enum(enumObj: object): EnumWrapper {
    let result = enumWrapperInstancesCache.get(enumObj);

    if (!result) {
        result = new EnumWrapper(enumObj);
        enumWrapperInstancesCache.set(enumObj, result);
    }

    return result;
}

enum Color { r, g, b }
const keys = $enum(Color).getKeys()
const values = $enum(Color).getValues();
console.log(keys)
console.log(values)
