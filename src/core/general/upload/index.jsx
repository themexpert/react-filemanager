import React, {Component} from 'react'

import message from 'antd/lib/message'
import Modal from 'antd/lib/modal'
import Icon from 'antd/lib/icon'
import Upload from 'antd/lib/upload'

require('antd/lib/message/style');
require('antd/lib/modal/style');
require('antd/lib/icon/style');
require('antd/lib/upload/style');

const {Dragger} = Upload;

export default class Uploader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false
        };
    }

    componentDidMount = () => {
        this.setState({visible: true});
    };

    componentWillUnmount = () => {
        this.setState({visible: false});
    };

    handleOk = e => {
        this.props.store.refresh();
        this.setState({visible: false});
        this.props.store.clearPlugin();
    };

    onChange = info => {
        const status = info.file.status;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    getProps = () => {
        return {
            name: 'file',
            multiple: true,
            action: this.props.store.server,
            onChange: this.onChange,
            data: file => {
                return {
                    plugin: 'General',
                    alias: 'upload',
                    working_dir: this.props.store.workingDir
                }
            }
        };
    };

    render = () => {
        const props = this.getProps();
        return (
            <Modal
                title="Upload"
                onOk={this.handleOk}
                onCancel={this.handleOk}
                visible={this.state.visible}
                cancelText={false}
                closable={false}
                okText="Done"
            >
                <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                        <Icon type="inbox"/>
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading
                        company data or other band files</p>
                </Dragger>
            </Modal>
        );
    };
}