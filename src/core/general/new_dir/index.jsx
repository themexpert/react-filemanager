import React, {Component} from 'react'

import message from 'antd/lib/message'
import Modal from 'antd/lib/modal'
import Input from 'antd/lib/input'

require('antd/lib/message/style');
require('antd/lib/modal/style');
require('antd/lib/input/style');

const PLUGIN = "General";

export default class NewDirectory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            dirname: 'New Folder'
        };
    }

    componentWillMount = () => {
        this.setState({visible: true});
    };

    componentWillUnmount = () => {
        this.setState({visible: false});
    };

    handleOk = () => {
        this.props.store.Request(PLUGIN, "new_dir", {dir: this.state.dirname})
            .then(({data})=>{
                message.success(data.message);
                this.setState({visible: false});
                this.props.store.refresh();
                this.props.store.clearPlugin();
            })
            .catch(err=>{
                message.error(err.response.data.message);
            });
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    handleTyping = e => {
        this.setState({dirname: e.target.value});
    };

    render = () => {
        return (
            <Modal
                title="Create a new folder"
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                visible={this.state.visible}
                cancelText="Cancel"
                closable={false}
                okText="Create"
            >
                <Input 
                    defaultValue={this.state.dirname} 
                    placeholder="Enter a folder name" 
                    onChange={this.handleTyping} 
                    onPressEnter={this.handleOk}
                    prefixCls="qxui-input"
                    />
            </Modal>
        );
    };
}