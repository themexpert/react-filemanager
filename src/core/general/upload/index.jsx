import React, {Component} from 'react'

import message from 'antd/lib/message'
import Icon from 'antd/lib/icon'
import Upload from 'antd/lib/upload'

const {Dragger} = Upload;

export default class Uploader extends Component {
  componentDidMount = () => {
    this.props.setModalInfo({
      title: 'Upload Files',
      okText: 'Done',
      cancelText: 'Close',
    });
  };

  handleOk = e => {
    this.props.store.refresh();
    this.props.close();
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
          working_dir: this.props.store.working_dir
        }
      }
    };
  };

  render = () => {
    const props = this.getProps();
    return (
      <div className="qx-fb-infobox qx-text-center">
        <Dragger prefixCls="qxui-upload" {...props}>
          <div className="qx-p-5">
            <i className="qxicon-inbox-in qx-fb-title-icon"></i>
            <p className="qx-mt-3">Click or drag file to this area to upload. You can upload multiple files.</p>
          </div>
        </Dragger>
      </div>
    );
  };
}