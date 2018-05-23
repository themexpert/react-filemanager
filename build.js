import initFM from './src';
import ImagePreview from "./src/plugins/ImagePreview";

window.openFileManager = initFM('/react-filemanager-server/', document.querySelector('.app'));

["//try.getquix.net/libraries/quix/assets/css/qxbs.css", "//try.getquix.net/libraries/quix/assets/css/qxui.css"].forEach(href=>{
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.insertBefore(link, document.head.firstChild);
});

window.ReactFileManager.registerPlugin(ImagePreview);
window.ReactFileManager.registerPlugin({
  details: {
    component: ImagePreview.image_preview.component,
    categories: [],
    context_menu: {
      scopes: ['all'],
      label: 'Details',
      category: 'details',
      callback(store, item) {
        console.log(store, item);
      }
    }
  }
});
