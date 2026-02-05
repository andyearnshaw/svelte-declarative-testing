/**@import { Snippet } from 'svelte' */
/**@typedef {(fn: () => void} AddTestFn */
/**@typedef {(fn: (renderResult: unknown) => void | Promise<void>} AddCheckFn */

import { createContext } from 'svelte';

/**@type {[() => AddTestFn | undefined, (fn: AddTestFn) => void]} */
export const [getAddTest, setAddTest] = createContext();

/**@type {[() => AddCheckFn | undefined, (fn: AddCheckFn) => void]} */
export const [getAddCheck, setAddCheck] = createContext();

/**@type {[() => Snippet<[]> | undefined, (snippet: Snippet<[]> | undefined) => void]} */
export const [getSuiteRenderSnippet, setSuiteRenderSnippet] = createContext();
