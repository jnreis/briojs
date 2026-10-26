const menuComponent = {
  template: '#brio-menu-template',
  props: { title: String, accent: String },
  setup({ el, $props, $emit }) {
    let focusRequest;
    let typed = '';
    let typedAt = 0;
    const trigger = () => el.querySelector('[data-trigger]');
    const menu = () => el.querySelector('[role="menu"]');
    const items = () => [...el.querySelectorAll('[role="menuitem"]')];
    brio.onCleanup(() => cancelAnimationFrame(focusRequest));
    return {
      opened: false,
      get content() {
        const content = $props.content;
        if (!content || !Array.isArray(content.items))
          throw new Error('brio-menu requires a content object with items.');
        return content;
      },
      open(index = 0) {
        if (!items().length) return;
        typed = '';
        typedAt = 0;
        this.opened = true;
        cancelAnimationFrame(focusRequest);
        focusRequest = requestAnimationFrame(() => {
          if (this.opened) (items()[index] || items()[0])?.focus();
        });
      },
      close(restoreFocus = true) {
        this.opened = false;
        cancelAnimationFrame(focusRequest);
        if (restoreFocus) trigger()?.focus();
      },
      toggle() {
        if (this.opened) this.close();
        else this.open();
      },
      backToHeading() {
        this.close(false);
        const heading = el.querySelector('h2');
        heading.focus({ preventScroll: true });
        heading.scrollIntoView({ block: 'nearest' });
      },
      choose(item) {
        $emit('action', { id: item.id, label: item.label });
        this.close();
      },
      triggerKey(event) {
        if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
        event.preventDefault();
        this.open(event.key === 'ArrowUp' ? items().length - 1 : 0);
      },
      onFocusOut(event) {
        if (!el.contains(event.relatedTarget)) this.close(false);
      },
      onKey(event) {
        if (!this.opened || !menu().contains(event.target)) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          this.close();
          return;
        }
        if (event.key === 'Tab') {
          this.close();
          return;
        }
        const entries = items();
        const current = entries.indexOf(event.target);
        let next;
        if (event.key === 'ArrowDown') next = (current + 1) % entries.length;
        if (event.key === 'ArrowUp') next = (current + entries.length - 1) % entries.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = entries.length - 1;
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== ' ') {
          typed = Date.now() - typedAt > 700 ? event.key : typed + event.key;
          typedAt = Date.now();
          const query = /^(.)\1+$/.test(typed) ? event.key : typed;
          for (let offset = 1; offset <= entries.length; offset++) {
            const index = (current + offset) % entries.length;
            if (entries[index].textContent.trim().toLowerCase().startsWith(query.toLowerCase())) {
              next = index;
              break;
            }
          }
        }
        if (next === undefined) return;
        event.preventDefault();
        entries[next].focus();
      },
    };
  },
};
