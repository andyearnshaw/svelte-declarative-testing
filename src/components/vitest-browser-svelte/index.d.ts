import { RenderResult } from 'vitest-browser-svelte';
import { Component } from 'svelte';
import type { BaseTestProps, DescribeProps } from '../core';

export type CheckFn = (result: RenderResult<Component<any, any>>) => void | Promise<void>;

export type CheckProps = {
  fn: CheckFn;
};

export { DescribeProps };
export declare const Test: Component<BaseTestProps>;
export declare const Check: Component<CheckProps>;
export declare const Describe: Component<DescribeProps>;
