export const PluginRegistry = {
    load(name, hook, callback) {
        if (this[name] !== undefined) {
            this[name](hook, callback);
        }
        else {
            console.log("Plugin " + name + " not found");
        }
    },
    ImageSearch(hook, callback) {
        System.import(/* webpackChunkName: "dist/ImageSearch" */ './ImageSearch')
            .then(plg => callback(hook, plg.default))
            .catch(err => {
                console.log(err);
                delete this["ImageSearch"];
            });
    }
};