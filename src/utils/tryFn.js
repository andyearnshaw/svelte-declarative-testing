/**
 * Tries to execute a function and returns its result or undefined if an error occurs.
 * @template T
 * @param {T extends (...args: any[]) => any} fn
 * @returns {ReturnType<T> | undefined}
 */
export default function tryFn(fn, ...args) {
  try {
    return fn(...args);
  } catch (error) {
    return undefined;
  }
}
