export default {
    ImageSearch(hook, callback) {
        System.import(/* webpackChunkName: "dist/ImageSearch" */ './ImageSearch').then(plg=>callback(hook, plg.default));
    }
}