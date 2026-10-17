import { resource } from 'briojs';
import { resource as standalone } from 'briojs/reactivity';
import type { Resource } from 'briojs';
import type { Resource as StandaloneResource } from 'briojs/reactivity';

const result: Resource<string> = resource(async signal => {
    const abort: AbortSignal = signal;
    return (await fetch('/data', { signal: abort })).text();
});
const other: StandaloneResource<number> = standalone(async () => 42);
const pending: Promise<void> = result.refetch();
const data: string | undefined = result.data.value;
const loading: boolean = result.loading.value;
const failure: unknown = result.error.value;
result.dispose();
other.dispose();
// @ts-expect-error Resource values retain their inferred type.
const wrong: number = result.data.value;
void [pending, data, loading, failure, wrong];
