import React, {Component} from 'react'

import Card from 'antd/lib/card'
require('antd/lib/card/style');
import Tooltip from 'antd/lib/tooltip'
require('antd/lib/tooltip/style');

const {Meta} = Card;
require('./style.css');

export default class Item extends Component {
    constructor(props) {
        super(props);

    }

    getIcon = () => {

    };

    getClass = () => {
        return "item " + this.props.className;
    };

    onClick = e => {
        this.props.store.select(this.props.item, e);
    };

    onDoubleClick = e => {
        this.props.store.clickAction(this.props.item);
    };

    onContextMenu = e => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Context Menu Item");
    };

    img = () => {
        const path = this.props.store.server + '?';
        const query = ['working_dir=' + this.props.store.workingDir];
        if (this.props.item.is_dir) {
            query.push('icon=folder');
        }
        else {
            const ext = this.props.item.extension;
            if (['png', 'jpg', 'jpeg', 'webp', 'gif'].indexOf(ext) >= 0) {
                query.push('thumb=' + this.props.item.basename);
            }
            else if (['svg'].indexOf(ext) >= 0) {
                query.push('raw=' + this.props.item.basename);
            }
            else {
                query.push('icon=' + ext);
            }
        }

        return path + query.join('&');
    };

    tooltip = () => {
        return [
            <p key="name">Name: {this.props.item.basename}</p>,
            <p key="permission">Permission: {this.props.item.permission}</p>,
            <p key="size">Size: {this.props.item.size}</p>,
            <p key="last-mod">Last Mod: {this.props.item.last_modification_time}</p>
        ];
    };

    render = () => {
        return (
            <Tooltip title={this.tooltip()} overlayClassName="info-tooltip">
                <Card
                    hoverable
                    className={this.getClass()}
                    style={{width: 120}}
                    cover={<img src={this.img()} alt="icon" height="96"/>}
                    onClick={this.onClick}
                    onDoubleClick={this.onDoubleClick}
                    onContextMenu={this.onContextMenu}
                >
                    <Meta title={this.props.item.basename}/>
                </Card>
            </Tooltip>
        );
    };
}