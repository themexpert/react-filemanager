import React, {Component} from 'react'
import {Col, Row} from "antd";

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

    render = () => {
        return (
            <Col className={this.getClass()} md={3} onClick={this.onClick} onDoubleClick={this.onDoubleClick}
                 onContextMenu={this.onContextMenu}>
                <Row style={{height: '120px'}}>
                    <Col>
                        <Row><img src={this.img()} height="96"/></Row>
                        <Row>
                            <p className="item-name">{this.props.item.basename}</p>
                        </Row>
                    </Col>
                </Row>
            </Col>
        );
    };
}