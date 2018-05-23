import initFM from './src';
import ImagePreview from "./src/plugins/ImagePreview";

const doc = window.parent.document;
// const doc = window.document;

const div = doc.createElement('div');
doc.body.appendChild(div);
window.openFileManager = initFM('/react-filemanager-server/', div);

// window.openFileManager = initFM('/react-filemanager-server/', document.querySelector('.app'));

[
  "dist/style.css",
  "//try.getquix.net/libraries/quix/assets/css/qxui.css",
  "//try.getquix.net/libraries/quix/assets/css/qxbs.css",
].forEach(href=>{
  const link = doc.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  doc.head.insertBefore(link, doc.head.firstChild);
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
