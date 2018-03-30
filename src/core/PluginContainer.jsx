import React, {Component} from 'react'
import {inject, observer} from "mobx-react";

const PluginContainer =  class PluginContainer extends Component {
    constructor(props) {
        super(props);
    }

    render = () => {
        const store = this.props.fm_store;
        if(!store.plugin.component)
            return null;
        return (
            <store.plugin.component key={store.plugin.key} store={store}/>
        );
    };
};

export default inject("fm_store")(observer(PluginContainer))