import React, {Component} from 'react'

import message from 'antd/lib/message'
import Input from 'antd/lib/input'
import Row from "antd/lib/grid/row";


const PLUGIN = "General";

export default class NewFile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filename: '',
      content: ''
    }
  }

  componentWillMount = () => {
    this.props.setModalInfo({
      title: 'Create new file',
      okText: 'Save',
      cancelText: 'Cancel'
    });
  };

  handleOk = () => {
    this.props.store.Request(PLUGIN, "new_file", {filename: this.state.filename, content: this.state.content})
      .then(({data})=>{
        message.success(data.message);
        this.props.store.refresh();
        this.props.close();
      })
      .catch(err=>{
        message.error(err.response.data.message);
      });
  };

  handleFilenameTyping = e => {
    this.setState({filename: e.target.value});
  };

  handleContentTyping = e => {
    this.setState({content: e.target.value});
  };

  render = () => {
    return (
      <Row>
        <Input placeholder="File Name" defaultValue={this.state.filename} onChange={this.handleFilenameTyping}/>
        <Input.TextArea placeholder="File Content" defaultValue={this.state.content} onChange={this.handleContentTyping}/>
      </Row>
    );
  };
}