# svelte-declarative-testing

One of the great things about Svelte is its compiler, producing a minimal
runtime and providing a great, declarative way to build components.
Unfortunately, unlike many other JavaScript frameworks, which use jsx or tagged
template functions to render components in a declarative manner inside
JavaScript files, Svelte has no such feature. Consider the following structure
of composed components:

```svelte
<Popover>
  <PopoverTrigger>Open Menu</PopoverTrigger>
  <PopoverMenu>
    <PopoverMenuItem href="/account">Account</PopoverMenuItem>
    <PopoverMenuItem href="/logout">Log out</PopoverMenuItem>
  </PopoverMenu>
</Popover>
```

There _are_ existing ways to render this in your tests, but none of them are
ergonomic. You can:

- create a separate `.svelte` file for each configuration of your composed
  components you want to test and pass that component to `render()`; or
- create a single `.svelte` file and wrap all of your configurations in
  `{#snippet <name>()}...{/snippet}`, along with a `{@render children()}`. You
  export all the snippets and import them along with the default export, pass
  the default export to `render(...)` and the snippet to the `children`
  property; or
- Use something like [vite-plugin-svelte-inline-component][vpsic] which allows
  you to use tagged template literals along with some directive comments in your
  test files.

[vpsic]: https://github.com/hanielu/vite-plugin-svelte-inline-component

Using this library, you can write your tests in Svelte syntax. This gives you
much greater ergonomics and flexibility, especially for the above composition.
Your tests can look like this:

```svelte
<!-- Popover.test.svelte -->
<script>
  import { Test, Check } from 'svelte-declarative-testing/vitest-browser-svelte';
  import { Popover, PopoverTrigger, PopoverMenu, PopoverMenuItem } from './';
</script>

<Test it="opens the menu when the trigger is clicked">
  <!-- children of the Test are rendered automatically -->
  <Popover>
    <PopoverTrigger>Open Menu</PopoverTrigger>
    <PopoverMenu>
      <PopoverMenuItem href="/account">Account</PopoverMenuItem>
      <PopoverMenuItem href="/logout">Log out</PopoverMenuItem>
    </PopoverMenu>
  </Popover>

  <!-- one or more test functions can be provided as checks -->
  {#snippet checks()}
    <Check
      fn={async (screen) => {
        expect(screen.getByRole('menu', { includeHidden: true })).not.toBeVisible();
        await screen.getByRole('button', { name: 'Open Menu' }).click();
        expect(screen.getByRole('menu')).toBeVisible();
      }}
    />
  {/snippet}
</Test>
```

## Installation

Install as part of your project's `devDependencies` through your preferred
package manager.

```
npm install --save-dev svelte-declarative-testing
```

## Setup

There are 2 ways to activate your declarative svelte test files, using the
provided Vite plugins or by importing them directly into another test file to
mount them.

### Using the plugins

In order to work with the VSCode Vitest extension, 2 plugins are provided to
instrument the source code. You will also need to make sure Vitest includes your
test files:

```javascript
import svelteDeclarativeTesting from 'svelte-declarative-testing/vitest';

export default defineConfig({
  plugins: [
    // ...

    ...svelteDeclarativeTesting(),
  ],

  // ...

  test: {
    include: [
      'src/**/*.svelte.{test,spec}.{js,ts}',

      // Includes .test.svelte and .spec.svelte
      'src/**/*.{test,spec}.svelte',
    ],
  },
});
```

### Importing directly into your other tests

> [!WARNING]
> This approach will not allow you to trigger test runs using the Vitest
> extension for VSCode. There may be some other side effects also.

If you don't want to use the plugins, simply import your Svelte-syntax test
files into your existing unit tests:

```javascript
// Popover.test.js
import PopoverIntegrationTests from './Popover.test.svelte';
import { render } from '@testing-library/svelte'; // or vitest-browser-svelte

describe('Unit tests', () => {
  // ... existing unit tests
});

describe('Integration tests', () => {
  render(PopoverIntegrationTests);
});
```

## Writing tests

Writing tests is quite intuitive. It is a similar structure to JavaScript test
files, with `describe()` and `test()` being replaced by `<Describe ...>` and
`<Test ...>` respectively. Additionally, there is a `<Check>` function that
allows you to provide the test functions.

Convenience wrappers are provided for @testing-library/svelte and
vitest-browser-svelte.

```typescript
import { Describe, Test, Check } from 'svelte-declarative-testing/testing-library';
```

```typescript
import { Describe, Test, Check } from 'svelte-declarative-testing/vitest-browser-svelte';
```

Alternatively, you can import the core functions and provide a custom `render()`
function to the `Test` component.

```typescript
import { Describe, Test, Check } from 'svelte-declarative-testing';
```

### `<Describe ...>`

Wraps your tests in a suite, similare to `describe()`.

```svelte
<Describe label="My Integration Tests">
```

Inside `Describe`, tests go in a `tests()` snippet. Any other children will be
rendered for each test.

| Properties | Type       | Description                                                                           |
| ---------- | ---------- | ------------------------------------------------------------------------------------- |
| `label`    | `string`   | The descriptive label for the test suite                                              |
| `children` | `Snippet`  | Any component(s) that you wish to render for the tests                                |
| `tests`    | `Snippet`  | A snippet block containing one or more `<Test>` elements                              |
| `skip`     | `any`      | Skips the suite if truthy, just like `describe.skip()`                                |
| `only`     | `any`      | Only run this suite if truthy, just like `describe.only()`                            |
| `todo`     | `any`      | Mark the suite as todo if truthy, just like `describe.todo()`                         |
| `shuffle`  | `any`      | Mark the suite as todo if truthy, just like `describe.todo()`                         |
| `skipIf`   | `function` | Skips the suite if the function returns a truthy value, just like `describe.skipIf()` |
| `runIf`    | `function` | Runs the suite if the function returns a truthy value, just like `describe.runIf()`   |

```svelte
<Describe label="My Integration Tests">
  <Button>My button</Button>

  {#snippet tests()}
    <Test it="renders an accessible button">
      <!-- Test body goes here -->
    </Test>

    <Test it="does something when I click the button">
      <!-- Test body goes here -->
    </Test>
  {/snippet}
</Describe>
```

### `<Test ...>`

Describes a test.

```svelte
<Test it="does what I expect it to do">
```

Inside `Test`, checks go in a `checks()` snippet. Any other children will be
rendered for each test. If no other children are provided, the children of the
parent `<Describe>` are rendered.

| Properties | Type       | Description                                                                      |
| ---------- | ---------- | -------------------------------------------------------------------------------- |
| `it`       | `string`   | The description of the test                                                      |
| `children` | `Snippet`  | Any component(s) that you wish to render for the test                            |
| `checks`   | `Snippet`  | A snippet block containing one or more `<Check>` elements                        |
| `skip`     | `any`      | Skips the test if truthy, just like `test.skip()`                                |
| `only`     | `any`      | Only run this test if truthy, just like `test.only()`                            |
| `todo`     | `any`      | Mark the test as todo if truthy, just like `test.todo()`                         |
| `fails`    | `any`      | Passes the test on failure if truthy, just like `test.fails()`                   |
| `skipIf`   | `function` | Skips the test if the function returns a truthy value, just like `test.skipIf()` |
| `runIf`    | `function` | Runs the test if the function returns a truthy value, just like `test.runIf()`   |
| `render()` | `function` | Provides a custom render function (not available on the wrapper components`      |

```svelte
<Test it="renders an accessible button">
  <Button>My button</Button>

  {#snippet checks()}
    <Check fn={ /* ... */ } />
    <Check fn={ /* ... */ } />
  {/snippet}
</Describe>
```

### `<Check ...>`

Provides a test function.

```svelte
<Check fn={() => expect(1 + 1).toBe(2)} />
```

You can provide as many checks as you like and they will run sequentially.

| Properties | Type       | Description                                        |
| ---------- | ---------- | -------------------------------------------------- |
| `fn`       | `function` | A function to be executed as part of the test body |

```svelte
<Test it="renders an accessible button">
  <Button>My button</Button>

  {#snippet checks()}
    <Check fn={({queryByRole}) => {
      expect(queryByRole("button")).toBeIntheDocument();
    }/>
  {/snippet}
</Describe>
```

## Credits

This is not a new idea and was originally posited by [@7nik][7nik] and
[@paoloricciuti][paol] on the Svelte bug tracker. Thanks also to @sheremet-va,
who assisted with the Vitest test detection plugins.

[7nik]: https://github.com/sveltejs/svelte/issues/14791#issuecomment-3166064732
[paol]: https://github.com/sveltejs/svelte/issues/14791#issuecomment-3166186575
