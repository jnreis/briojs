const dialogComponent = {
  template: '#brio-dialog-template',
  props: { open: Boolean, title: String, accent: String, 'close-label': String },
  setup({ el, $props, $emit, $ref }) {
    brio.effect(() => {
      const dialog = $ref.dialog;
      if (!dialog) return;
      if ($props.open && !dialog.open) dialog.showModal();
      else if (!$props.open && dialog.open) dialog.close();
    });
    brio.onCleanup(() => {
      const dialog = el.querySelector('dialog');
      if (dialog?.open) dialog.close();
    });
    return {
      requestClose() {
        $emit('request-close');
      },
      onCancel(event) {
        event.preventDefault();
        this.requestClose();
      },
      onClose() {
        $emit('closed');
      },
    };
  },
};
