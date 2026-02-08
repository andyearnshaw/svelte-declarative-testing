import type { Snippet, Component } from 'svelte';

type KeysAsExclusiveUnion<T> = {
  [K in keyof T]: { [P in K]: T[P] } & { [P in Exclude<keyof T, K>]?: never };
}[keyof T];

export type ModifierProps = {
  /* These are all mutually exclusive on Describe and Test */
  only?: boolean;
  todo?: boolean;
  skip?: boolean;
  skipIf?: () => boolean;
  runIf?: () => boolean;
  fails?: boolean;
};

type ModifiersWithoutFails = Omit<ModifierProps, 'fails'>;

type DescribeModifierProps =
  | KeysAsExclusiveUnion<ModifiersWithoutFails>
  | { [K in keyof ModifiersWithoutFails]?: never };

type TestModifierProps =
  | KeysAsExclusiveUnion<ModifierProps>
  | { [K in keyof ModifierProps]?: never };

export type DescribeProps = {
  label: string;
  children: Snippet;
  mount?: Snippet;
  fails?: never;
} & DescribeModifierProps;

export type BaseTestProps = {
  it: string;
  children: Snippet;
  mount?: Snippet;
} & TestModifierProps;

type RenderResult = {
  unmount: () => void | Promise<void>;
};

export type TestProps = BaseTestProps & {
  render: (
    component: Component<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
    options: unknown,
  ) => RenderResult | Promise<RenderResult>;
};

export type CheckProps = {
  fn: (renderResult: any) => void | Promise<void>; //eslint-disable-line @typescript-eslint/no-explicit-any
};

export declare const Describe: Component<DescribeProps>;
export declare const Test: Component<TestProps>;
export declare const Check: Component<CheckProps>;
