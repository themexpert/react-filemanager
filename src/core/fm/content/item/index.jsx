import React, {Component} from 'react'

import Card from 'antd/lib/card'
import Tooltip from 'antd/lib/tooltip'

require('antd/lib/card/style');
require('antd/lib/tooltip/style');

const {Meta} = Card;

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
        const path = this.props.store.server;
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
        if(path.indexOf('?') > -1)
            return path + '&' + query.join('&');
        return path + '?' + query.join(('&'));
    };

    tooltip = () => {
        return [
            <p key="name">
                {this.props.item.basename} - <strong>{this.props.item.size}</strong> <br/>
                <strong>{this.props.item.last_modification_time}</strong>
            </p>
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