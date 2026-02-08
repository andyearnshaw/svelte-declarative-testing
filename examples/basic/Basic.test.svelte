<script lang="ts">
  import { Test, Describe, Check } from '../../src/components/testing-library';
</script>

<Test it="finds the rendered component">
  {#snippet mount()}
    <button>Click me</button>
  {/snippet}

  <Check
    fn={({ getByRole }) => {
      expect(getByRole('button', { name: 'Click me' })).not.toBe(null);
    }}
  />
</Test>

<Describe label="Basic test suite">
  {#snippet mount()}
    <button>Click me</button>
  {/snippet}

  <Describe label="Nested describe">
    <Test it="mounts the test's snippet instead of the describe's snippet">
      {#snippet mount()}
        <button>No, click me</button>
      {/snippet}

      <Check
        fn={({ queryByRole }) => {
          expect(queryByRole('button', { name: 'Click me' })).toBe(null);
          expect(queryByRole('button', { name: 'No, click me' })).not.toBe(null);
        }}
      />
    </Test>

    <Test it="mounts the describe's snippet if the test doesn't have its own snippet">
      <Check
        fn={({ queryByRole }) => {
          expect(queryByRole('button', { name: 'Click me' })).not.toBe(null);
          expect(queryByRole('button', { name: 'No, click me' })).toBe(null);
        }}
      />
    </Test>
  </Describe>
</Describe>
