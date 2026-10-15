import { createApp, state, enableDevtools, devtools, devtoolsPanel, inspectDevtools } from 'briojs';
import type { AppOptions, BrioApp, ComponentContext } from 'briojs';

const session = state({ user: 'Alice' });
const app = createApp({
    stores: { session, config: { enabled: true } },
    state: () => ({ count: 0 }),
});
const user: string = app.stores.session.user;
const enabled: boolean = app.stores.config.enabled;
const count: number = app.state.count;
// @ts-expect-error Registered store names are read-only.
app.stores.session = session;
// @ts-expect-error Only registered names are inferred.
app.stores.missing;
// @ts-expect-error State inference remains intact.
app.state.count = 'bad';
app.stores.session.user = 'Bob';
app.plugin(owner => { owner.stores.session; });
app.component('test-card', {
    template: '<span></span>',
    setup({ $stores, $provided }: ComponentContext) {
        // @ts-expect-error Component store names are read-only.
        $stores.session = session;
        // @ts-expect-error Provided names are read-only.
        $provided.theme = 'light';
        return { user };
    },
});
const chained: typeof app = app.plugin(() => {}).component('other-card', { template: '<b></b>' });
const oldOptions: AppOptions<{ count: number }> = { state: () => ({ count: 0 }) };
const oldApp: BrioApp<{ count: number }> = createApp(oldOptions);
const defaultApp: BrioApp = createApp();
const explicitState = createApp<{ count: number }>({
    state: () => ({ count: 0 }), stores: { session },
});
const explicitCount: number = explicitState.state.count;
void [enabled, count, chained, oldApp, defaultApp, explicitCount];
const snapshot: ReturnType<typeof inspectDevtools> = devtools.getSnapshot();
const start: () => void = enableDevtools;
const panel: (element: Element) => () => void = devtoolsPanel;
void [snapshot, start, panel];
app.component('styled-card', { template: '<style b-style>:scope { display: block; }</style><p>Styled</p>' });
app.component('obsolete-styled-card', {
    template: '<p></p>',
    // @ts-expect-error Scoped CSS is authored in <style b-style>, not a definition property.
    style: 'p { color: red; }',
});
