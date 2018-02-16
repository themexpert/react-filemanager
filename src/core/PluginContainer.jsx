import React, {Component} from 'react'
import {inject, observer} from "mobx-react";

const PluginContainer =  class PluginContainer extends Component {
    constructor(props) {
        super(props);
    }

    render = () => {
        const store = this.props.fm_store;
        if(!store.Plugin.component)
            return null;
        return (
            <store.Plugin.component key={store.Plugin.key} store={store}/>
        );
    };
};

export default inject("fm_store")(observer(PluginContainer))