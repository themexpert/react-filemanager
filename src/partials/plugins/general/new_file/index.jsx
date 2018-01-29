import React, {Component} from 'react'
import {Input, Modal, message} from "antd";

export default class NewFile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filename: '',
            content: '',
            visible: false
        }
    }

    componentWillMount = () => {
        this.setState({visible: true});
    };

    componentWillUnmount = () => {
        this.setState({visible: false});
    };

    handleOk = () => {
        this.props.store.Request({filename: this.state.filename, content: this.state.content})
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

    handleFilenameTyping = e => {
        this.setState({filename: e.target.value});
    };

    handleContentTyping = e => {
        this.setState({content: e.target.value});
    };

    render = () => {
        return (
            <Modal
                title="New File"
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                visible={this.state.visible}
                cancelText="Cancel"
                closable={false}
                okText="Save"
            >
                <Input placeholder="File Name" defaultValue={this.state.filename} onChange={this.handleFilenameTyping}/>
                <Input.TextArea placeholder="File Content" defaultValue={this.state.content} onChange={this.handleContentTyping}/>
            </Modal>
        );
    };
}