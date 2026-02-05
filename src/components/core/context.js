/**@import { Snippet } from 'svelte' */
/**@typedef {(fn: () => void} AddTestOrDescribeFn */
/**@typedef {(fn: (renderResult: unknown) => void | Promise<void>} AddCheckFn */

import { createContext } from 'svelte';

/**@type {[() => AddTestOrDescribeFn | undefined, (fn: AddTestOrDescribeFn) => void]} */
export const [getAddDescribeChild, setAddDescribeChild] = createContext(null);

/**@type {[() => AddCheckFn | undefined, (fn: AddCheckFn) => void]} */
export const [getAddCheck, setAddCheck] = createContext();

/**@type {[() => Snippet<[]> | undefined, (snippet: Snippet<[]> | undefined) => void]} */
export const [getSuiteRenderSnippet, setSuiteRenderSnippet] = createContext();
