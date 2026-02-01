import { createContext, Snippet } from 'svelte';

export const [getAddTest, setAddTest] = createContext<(fn: () => void | Promise<void>) => void>();

export const [getAddCheck, setAddCheck] = createContext<(fn: () => void | Promise<void>) => void>();

export const [getSuiteRenderSnippet, setSuiteRenderSnippet] = createContext<Snippet | undefined>();
