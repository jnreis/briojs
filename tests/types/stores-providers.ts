import { createApp, state, enableDevtools, devtools, devtoolsPanel, inspectDevtools, createStepEngine } from '@jnreis/briojs';
import type { AppOptions, BrioApp, ComponentContext, RefMap, StepOptions, StepDefinition, StepRecord, StepEngine } from '@jnreis/briojs';

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
app.use(owner => { owner.stores.session; });
app.component('test-card', {
    template: '<span></span>',
    setup({ $stores, $provided, $ref }: ComponentContext) {
        const refs: RefMap = $ref;
        const element: Element | undefined = refs.field;
        if (element instanceof HTMLInputElement) element.focus();
        // @ts-expect-error Ref names are read-only.
        refs.field = document.createElement('input');
        // @ts-expect-error Component store names are read-only.
        $stores.session = session;
        // @ts-expect-error Provided names are read-only.
        $provided.theme = 'light';
        return { user };
    },
});
const chained: typeof app = app.use(() => {}).component('other-card', { template: '<b></b>' });
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
app.component('styled-card', { template: '<style>@scope { :scope { display: block; } }</style><p>Styled</p>' });

const definition: StepDefinition = { next: 'end' };
const steps: StepRecord = { start: definition, end: {} };
const stepOptions: StepOptions = { initial: 'start', steps };
const wizard: StepEngine = createStepEngine(stepOptions);
const currentStep: string = wizard.current;
const hasNext: boolean = wizard.canGoNext;
const hasBack: boolean = wizard.canGoBack;
const navigationResults: boolean[] = [
    wizard.isActive('start'), wizard.go('end'), wizard.next(), wizard.back(), wizard.reset(),
];
// @ts-expect-error Navigation state is read-only.
wizard.current = 'end';
// @ts-expect-error Capabilities are read-only.
wizard.canGoBack = false;
// @ts-expect-error Navigation methods cannot be replaced.
wizard.go = () => true;
// @ts-expect-error Removed multi-active options are not supported.
const keptStep: StepDefinition = { keep: true };
// @ts-expect-error Back is history, not a definition edge.
const backStep: StepDefinition = { back: 'start' };
// @ts-expect-error Initial is required.
createStepEngine({ steps });
// @ts-expect-error Dynamic registration is not supported.
wizard.setStep('new', {});
void [currentStep, hasNext, hasBack, navigationResults, keptStep, backStep];
