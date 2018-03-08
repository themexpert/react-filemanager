import React, {Component} from 'react'
import {inject, observer} from 'mobx-react'
import Item from "./item/index";
import PluginContainer from "../../PluginContainer";
import throttle from 'debounce';

import Card from 'antd/lib/card'
import {viewport} from "../../Helper";

require('antd/lib/card/style');

const {Meta} = Card;
const view_size = viewport();

require('./style.css');
const FMContent = class FMContent extends Component {
    constructor(props) {
        super(props);

        this.props.fm_store.setWorkingDir('/');
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
        return this.props.fm_store.list.length < this.props.fm_store.Data.total;
    };

    onClickLoadMore = () => {
        this.props.fm_store.fetch(true);
    };

    loadMoreIcon = () => {
        if (this.props.fm_store.server.indexOf('?') > -1)
            return this.props.fm_store.server + '&icon=plus';
        return this.props.fm_store.server + '?icon=plus';
    };

    render = () => {
        return (
            <div id="fm-content-holder" onContextMenu={this.onContextMenu}>
                <div className="qx-row">
                    <div id="fm-content">
                        {this.props.fm_store.list
                            .map(item => {
                                return <Item key={item.basename} item={item} className={item.selected ? 'selected' : ''}
                                             store={this.props.fm_store}/>
                            })}
                        {this.hasMore() ?
                            <Card hoverable className="item"
                                  style={{width: 120, padding: 10}}
                                  cover={< img src={this.loadMoreIcon()} alt="icon" height="96"/>}
                                  onClick={this.onClickLoadMore}>
                                <Meta title="Load More"/>
                            </Card>
                            : null}
                    </div>
                    <PluginContainer/>
                </div>
            </div>
        );
    };
};

export default inject("fm_store")(observer(FMContent));
