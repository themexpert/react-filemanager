import React, {Component} from 'react'
export const PluginRegistry =  {
    load(name, hook, callback) {
        setTimeout(()=>callback(hook, this.component(name), 10));
    },
    component(name) {
        return class ProMessage extends Component {
            render = () => {
                return name + ": Only available in PRO";
            };
        }
    }
};