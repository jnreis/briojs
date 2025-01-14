import { saveCleanup } from '../app';
import { getAttr, getTagName, listen } from '../tools/dom';
import { evaluate } from '../tools/evaluation';
import { HREF, PREVENT_DEFAULT, ROUTE, TARGET } from '../tools/constants';

export let hydrateBoost = (vnode: VNode, _: string, attrValue: string, tools: HydrationTools) => {

    let $el = vnode.el;

    let [value] = evaluate(vnode, attrValue || '1');

    // on-click-prevent="$boost($el, )"

    // Anchor: intercept the click event and prevent the default action
    saveCleanup(vnode, listen($el, 'click', async event => {
        // Get the target element
        let target = event[TARGET];

        // Check if the target element is an anchor element
        if (getTagName(target as HTMLElement) == 'a' && await value()) {

            // Get the href of the anchor element
            let rawHref = getAttr(target as HTMLElement, HREF);

            // Has href
            if (rawHref) {
                // Prevent the default action
                event[PREVENT_DEFAULT]();

                tools.$dom[ROUTE](rawHref);
            }
        }
    }));

    // // Form: intercept the submit event and prevent the default action
    // saveCleanup(vnode, listen($el, 'submit', async event => {
    //     // Get the target element
    //     let target = event[TARGET];

    //     // Check if the target element is an anchor element
    //     if (getTagName(target as HTMLElement) == 'form' && await value()) {

    //         // Prevent the default action
    //         event[PREVENT_DEFAULT]();

    //         // Get the URL from the action attribute or use the current URL
    //         let url = getAttr(target as HTMLElement, 'action') || href();

    //         // Get method
    //         let method = lower(getAttr(target as HTMLElement, METHOD) || GET) as 'get' | 'post';

    //         // Get the form data
    //         let data = formData(target as HTMLFormElement);

    //         // Fetch the content of the href
    //         let formResponse = await http[method](url, data);

    //         // What to do with the response?
    //         // - Insert the response into the current page
    //         // - Replace the current page with the response
    //         // - Redirect to the response
    //         // - Do nothing
    //         // - Show a notification
    //         // - Save the response in $props, $state, $form, $log, etc.
    //         // - Call a function with the response. The function name can be:
    //         //   - provided in the form data;
    //         //   - the It could be a function in $props with the same name as the form ID.
    //         console.log('boost form response', formResponse);
    //     }

    // }));
}
