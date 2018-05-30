import React, {Component} from 'react'

import message from 'antd/lib/message'
import Input from 'antd/lib/input'

const PLUGIN = "General";

export default class Rename extends Component {
  constructor(props) {
    super(props);

    this.state = {
      new: '',
      old: ''
    };
  }

  componentDidMount = () => {
    const selected_items = this.props.store.selected_items;
    if (selected_items.length > 1) {
      message.info('Only one file can be renamed at a time');
      this.props.close();
      return;
    }
    else if (selected_items.length < 1) {
      message.info('Select a file or folder to rename');
      return;
    }
    this.setState({old: selected_items[0]['basename'], new: selected_items[0]['basename']});
    this.props.setModalInfo({
      title: 'Rename',
      okText: 'Save',
      cancelText: 'Cancel',
    });
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

    this.props.store.Request(PLUGIN, "rename", {old: this.state.old, new: this.state.new})
      .then(({data}) => {
        message.success(data.message);
        this.props.store.refresh();
        this.props.close();
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  handleTyping = e => {
    this.setState({new: e.target.value});
  };

  render = () => {
    return (
      <div>
        <Input disabled={true} value={this.state.old} prefixCls="qxui-input"/>
        <Input value={this.state.new} onChange={this.handleTyping} onPressEnter={this.handleOk} prefixCls="qxui-input" className="qx-mt-2"/>
      </div>
    );
  };
}