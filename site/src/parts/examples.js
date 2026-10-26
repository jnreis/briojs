export const examples = {
    disclosure: {
        title: 'A few good questions.',
        description: 'Native disclosure, with a little help from Brio.',
        expandLabel: 'Expand all', collapseLabel: 'Collapse all',
        countLabel: '{expanded} of {total} expanded',
        items: [
            { id: 'build', label: 'Do I need a build step?', body: 'No. Register this component on your existing Brio app.' },
            { id: 'open', label: 'Can several answers stay open?', body: 'Yes. Each disclosure is independent, so you can compare answers.' },
            { id: 'style', label: 'Can I change how it looks?', body: 'Yes. The template includes ordinary, scoped CSS. No styling framework is needed.' },
        ],
    },
    tabs: {
        title: 'Your next little adventure.', label: 'Trip planning',
        items: [
            { id: 'pack', label: 'Pack', heading: 'Bring the essentials', body: 'A notebook, a water bottle, and room for something unexpected.' },
            { id: 'travel', label: 'Travel', heading: 'Take the scenic route', body: 'Leave early. Look out the window. Stop when something catches your eye.' },
            { id: 'enjoy', label: 'Enjoy', heading: 'Be here for a while', body: 'Put the schedule away and find a good place to sit.' },
        ],
    },
    dialog: {
        title: 'Make room for a pause.',
        description: "A modal built on the browser's own dialog element.",
        triggerLabel: 'Edit display name', dialogTitle: 'What should we call you?',
        body: 'This demo changes the preview only. Nothing is sent to a server.',
        inputLabel: 'Display name', maxLength: 60, value: '',
        cancelLabel: 'Cancel', saveLabel: 'Save name', message: 'No changes yet.',
    },
    menu: {
        title: 'A few things you can do.',
        description: 'An action menu, not a replacement for site navigation or a select input.',
        triggerLabel: 'Note actions', backLabel: 'Back to heading',
        message: 'Choose an action. This is a local demonstration.',
        items: [
            { id: 'duplicate', label: 'Duplicate' },
            { id: 'export', label: 'Export' },
            { id: 'archive', label: 'Archive' },
        ],
    },
};
