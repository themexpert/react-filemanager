import React, {Component} from 'react'
import {inject, observer} from 'mobx-react'
import Item from "./item/index";
import PluginContainer from "../../PluginContainer";
import throttle from 'debounce';

import {viewport} from "../../Helper";
const view_size = viewport();

const FMContent = class FMContent extends Component {
    constructor(props) {
        super(props);

        this.props.fm_store.working_dir = '/';
    }

    componentDidMount = () => {
        document.getElementById('fm-content-holder').addEventListener('scroll', this.onScroll);
    };

    componentWillUnmount = () => {
        document.getElementById('fm-content-holder').removeEventListener('scroll', this.onScroll);
    };

    onContextMenu = e => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Context Menu Content");
    };

    onScroll = throttle(e => {
        const el = document.getElementById('fm-content-holder');
        const content = el.querySelector('#fm-content');
        const scrollTop = el.scrollTop;
        const offsetHeight = el.offsetHeight;
        const scrollHeight = content.scrollHeight;

        if (scrollHeight - offsetHeight < scrollTop + 10) {
            this.props.fm_store.fetch(true);
        }
    }, 100);

    hasMore = () => {
        return this.props.fm_store.list.length < this.props.fm_store.data.total;
    };

    onClickLoadMore = () => {
        this.props.fm_store.fetch(true);
    };

    render = () => {
        return (
            <div id="fm-content-holder" onContextMenu={this.onContextMenu}>
                <div className="qx-row">
                    <div id="fm-content" className="qx-col">
                        {this.props.fm_store.list
                            .map(item => {
                                return <Item key={`${item.basename}-${item.selected}`} item={item} store={this.props.fm_store}/>
                            })}
                        {this.hasMore() ? <a className="item" onClick={this.onClickLoadMore}>Load More</a> : null}
                    </div>
                    <PluginContainer/>
                </div>
            </div>
        );
    };
};

export default inject("fm_store")(observer(FMContent));
