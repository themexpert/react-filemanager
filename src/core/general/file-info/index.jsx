import React, {Component} from 'react'

import message from 'antd/lib/message'
require('antd/lib/message/style');
import Modal from 'antd/lib/modal'
require('antd/lib/modal/style');
import Row from 'antd/lib/grid/row'

export default class FileInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            info: null,
            visible: false
        };
    }

    componentWillMount = () => {
        this.getFileInfo();
    };

    componentDidMount = () => {
        this.setState({visible: true});
    };

    getFileInfo = () => {
        this.props.store.Request({
            file: this.props.store.pluginData.file_info.file.basename
        })
            .then(({data}) => {
                this.setState({info: data});
            })
            .catch(err => {
                message.error(err.response.data.message);
            });
    };

    handleOk = () => {
        this.handleCancel();
    };

    handleCancel = () => {
        this.setState({visible: false});
        this.props.store.clearPlugin();
    };

    render = () => {
        if(!this.state.info)
            return null;
        return (

            <Modal
                title={this.state.info.basename}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                visible={this.state.visible}
                cancelText="Close"
                closable={false}
                okText="Ok"
            >
                <Row gutter={24}>
                    {this.state.info.filename}
                </Row>
            </Modal>
        );
    };
}