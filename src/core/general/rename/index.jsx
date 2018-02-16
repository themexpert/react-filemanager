import React, {Component} from 'react'

import message from 'antd/lib/message'
import Modal from 'antd/lib/modal'
import Col from 'antd/lib/grid/col'
import Row from 'antd/lib/grid/row'
import Input from 'antd/lib/input'

require('antd/lib/message/style');
require('antd/lib/modal/style');
require('antd/lib/grid/style');
require('antd/lib/input/style');

export default class Rename extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            new: '',
            old: ''
        };
    }

    componentDidMount = () => {
        const selectedItems = this.props.store.selectedItems;
        if (selectedItems.length > 1) {
            message.info('Only one file can be renamed at a time');
            this.props.store.clearPlugin();
            return;
        }
        else if (selectedItems.length < 1) {
            message.info('Select a file or folder to rename');
            return;
        }
        this.setState({old: selectedItems[0]['basename'], new: selectedItems[0]['basename']});
        this.setState({visible: true});
    };

    componentWillUnmount = () => {
        this.setState({visible: false});
    };

    handleOk = () => {
        const newName = this.state.new;
        if (newName === this.state.old) {
            message.error('New name can not be same as previous name');
            return;
        }
        if (newName === '') {
            message.error('Filename can not be empty');
            return;
        }
        if (this.props.store.list.find(x => x.basename === newName)) {
            message.error('This file/folder already exists');
            return;
        }

        this.props.store.Request({old: this.state.old, new: this.state.new})
            .then(({data}) => {
                message.success(data.message);
                this.setState({visible: false});
                this.props.store.refresh();
                this.props.store.clearPlugin();
            })
            .catch(err => {
                message.error(err.response.data.message);
            });
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    handleTyping = e => {
        this.setState({new: e.target.value});
    };

    render = () => {
        return (
            <Modal
                title="Rename"
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                visible={this.state.visible}
                cancelText="Cancel"
                closable={false}
                okText="Rename"
            >
                <Row>
                    <Col md={24}>
                        <Row>
                            <Col md={24}>
                                <Input disabled={true} value={this.state.old}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={24}>
                                <Input value={this.state.new} onChange={this.handleTyping}/>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Modal>
        );
    };
}