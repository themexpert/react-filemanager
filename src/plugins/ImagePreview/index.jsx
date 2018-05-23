import ImagePreview from "./ImagePreview";

export default {
  image_preview: {
    component: ImagePreview,
    categories: [],
    context_menu: {
      scopes: ['image'],
      label: 'Preview',
      category: 'preview',
      callback(store, item) {
        store.item_in_action = item;
        store.selectPlugin('image_preview').call(store);
      }
    }
  }
};
