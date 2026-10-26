const disclosureComponent = {
  template: '#brio-disclosure-template',
  props: { title: String, accent: String },
  setup({ el, $props }) {
    return {
      get content() {
        const content = $props.content;
        if (!content || !Array.isArray(content.items) || typeof content.countLabel !== 'string')
          throw new Error('brio-disclosure requires a content object with items and countLabel.');
        return content;
      },
      openIds: [],
      isOpen(id) { return this.openIds.includes(id); },
      get expanded() {
        return this.content.items.filter(item => this.openIds.includes(item.id)).length;
      },
      get status() {
        return this.content.countLabel
          .replace('{expanded}', String(this.expanded))
          .replace('{total}', String(this.content.items.length));
      },
      sync() {
        this.openIds = [...el.querySelectorAll('details[open]')].map(item => item.dataset.itemId);
      },
      setAll(open) {
        for (const item of el.querySelectorAll('details')) item.open = open;
        this.sync();
      },
    };
  },
};
