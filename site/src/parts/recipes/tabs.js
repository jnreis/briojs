const tabsComponent = {
  template: '#brio-tabs-template',
  props: { title: String, label: String, accent: String },
  setup({ el, $props }) {
    return {
      get content() {
        const content = $props.content;
        if (!content || !Array.isArray(content.items))
          throw new Error('brio-tabs requires a content object with items.');
        return content;
      },
      selected: null,
      get activeId() {
        return this.content.items.some(item => item.id === this.selected)
          ? this.selected : this.content.items[0]?.id;
      },
      isSelected(id) { return this.activeId === id; },
      select(id) { this.selected = id; },
      tabId(prefix, id) { return `${prefix}-tab-${encodeURIComponent(id)}`; },
      panelId(prefix, id) { return `${prefix}-panel-${encodeURIComponent(id)}`; },
      onKey(event) {
        const tabs = [...el.querySelectorAll('[role="tab"]')];
        const current = tabs.indexOf(event.target);
        if (current < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
        let next;
        if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        this.select(this.content.items[next].id);
        tabs[next].focus();
      },
    };
  },
};
