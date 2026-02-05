import { SourceMapConsumer } from 'source-map';
import getPlugins from './vitest.js';

const dummyTestFile = `
<script>
  import { Describe, Test, Check } from '../components/core';
</script>
<Describe label="A test suite">
  <Test it="A test case">
    <Check fn={() => {}} />
  </Test>
  <Describe label="A nested test suite">
    <Test it="A nested test case">
      <Check fn={() => {}} />
    </Test>
  </Describe>
</Describe>
<Describe label="Another test suite">
  <Test it="Another test case">
    <Check fn={() => {}} />
  </Test>
</Describe>
`;

const findLineAndColumn = (code: string, substring: string) => {
  const index = code.indexOf(substring);
  if (index === -1) {
    throw new Error(`Substring "${substring}" not found in code.`);
  }

  const lines = code.slice(0, index).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;

  return { line, column };
};

describe('vitest pre plugin', () => {
  it('does not transform non-test files', async () => {
    const [pre] = getPlugins();

    expect(await pre.transform(`<h1>Not a test file</h1>`, 'AComponent.svelte')).toBeUndefined();
  });

  it('transforms .test.svelte files', async () => {
    const [pre] = getPlugins();

    expect(await pre.transform(dummyTestFile, 'AComponent.test.svelte')).not.toBeUndefined();
  });

  it('transforms .spec.svelte files', async () => {
    const [pre] = getPlugins();

    expect(await pre.transform(dummyTestFile, 'AComponent.spec.svelte')).not.toBeUndefined();
  });

  it('produces code with a dummy test suite', async () => {
    const [pre] = getPlugins();
    const result = await pre.transform(dummyTestFile, 'AComponent.test.svelte');

    expect(result?.code).toMatchSnapshot();
  });

  it('produces a source map with mappings that point to the Describe and Test components', async () => {
    const [pre] = getPlugins();
    const result = (await pre.transform(dummyTestFile, 'AComponent.test.svelte')) as {
      code: string;
      map: string;
    };

    const map = await new SourceMapConsumer(result?.map);
    const describePosition = findLineAndColumn(result.code, 'describe("A test suite"');
    const testPosition = findLineAndColumn(result.code, 'test("A test case"');
    const nestedDescribePosition = findLineAndColumn(result.code, 'describe("A nested test suite"');
    const nestedTestPosition = findLineAndColumn(result.code, 'test("A nested test case"');
    const anotherDescribePosition = findLineAndColumn(result.code, 'describe("Another test suite"');
    const anotherTestPosition = findLineAndColumn(result.code, 'test("Another test case"');

    expect(map.originalPositionFor(describePosition)).toEqual(
      expect.objectContaining({
        line: 5,
        column: 1,
      }),
    );
    expect(map.originalPositionFor(testPosition)).toEqual(
      expect.objectContaining({
        line: 6,
        column: 3,
      }),
    );
    expect(map.originalPositionFor(nestedDescribePosition)).toEqual(
      expect.objectContaining({
        line: 9,
        column: 3,
      }),
    );
    expect(map.originalPositionFor(nestedTestPosition)).toEqual(
      expect.objectContaining({
        line: 10,
        column: 5,
      }),
    );
    expect(map.originalPositionFor(anotherDescribePosition)).toEqual(
      expect.objectContaining({
        line: 15,
        column: 1,
      }),
    );
    expect(map.originalPositionFor(anotherTestPosition)).toEqual(
      expect.objectContaining({
        line: 16,
        column: 3,
      }),
    );
  });

  it('produces (unnamed) suite names for Describe', async () => {
    const [pre] = getPlugins();
    const result = (await pre.transform(
      `
        <Describe>
          <Test it="A test case">
            <Check fn={() => {}} />
          </Test>
        </Describe>
      `,
      'AComponent.test.svelte',
    )) as { code: string };

    expect(result.code).toContain('describe("(unnamed)"');
  });

  it('produces (unnamed) test names for Test', async () => {
    const [pre] = getPlugins();
    const result = (await pre.transform(
      `
        <Describe label="A test suite">
          <Test>
            <Check fn={() => {}} />
          </Test>
        </Describe>
      `,
      'AComponent.test.svelte',
    )) as { code: string };

    expect(result.code).toContain('test("(unnamed)"');
  });

  it('produces (unnamed) suite names when Describe has dynamic label', async () => {
    const [pre] = getPlugins();
    const result = (await pre.transform(
      `
        <Describe label={someVariable}>
          <Test it="A test case">
            <Check fn={() => {}} />
          </Test>
        </Describe>
      `,
      'AComponent.test.svelte',
    )) as { code: string };

    expect(result.code).toContain('describe("(unnamed)"');
  });

  it('produces (unnamed) test names when Test has dynamic name', async () => {
    const [pre] = getPlugins();
    const result = (await pre.transform(
      `
        <Describe label="A test suite">
          <Test it={someVariable}>
            <Check fn={() => {}} />
          </Test>
        </Describe>
      `,
      'AComponent.test.svelte',
    )) as { code: string };

    expect(result.code).toContain('test("(unnamed)"');
  });

  it('does not produce descibe or test calls when no Describe or Test components are present', async () => {
    const [pre] = getPlugins();
    const result = (await pre.transform(
      `
        <Header>Not a test file</Header>
      `,
      'AComponent.test.svelte',
    )) as { code: string };

    expect(result.code).not.toContain('describe(');
    expect(result.code).not.toContain('test(');
  });
});

describe('vitest post plugin', () => {
  it('does not transform non-test files', async () => {
    const [, post] = getPlugins();

    expect(
      await post.transform(`export default function AComponent() {}`, 'AComponent.svelte'),
    ).toBeUndefined();
  });

  it('transforms .test.svelte files to mount the component', async () => {
    const [, post] = getPlugins();

    expect(
      await post.transform(`export default function AComponent() {}`, 'AComponent.test.svelte'),
    ).not.toBeUndefined();
  });

  it('transforms .spec.svelte files to mount the component', async () => {
    const [, post] = getPlugins();

    expect(
      await post.transform(`export default function AComponent() {}`, 'AComponent.spec.svelte'),
    ).not.toBeUndefined();
  });

  it('produces code that mounts the component and returns a render result', async () => {
    const [, post] = getPlugins();
    const result = await post.transform(
      `export default function AComponent() {}`,
      'AComponent.test.svelte',
    );

    expect(result?.code).toMatchSnapshot();
  });
});
