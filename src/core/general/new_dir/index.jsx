import React, {Component} from 'react'

import message from 'antd/lib/message'
import Input from 'antd/lib/input'

const PLUGIN = "General";

export default class NewDirectory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dirname: 'new_folder'
        };
    }

    componentDidMount() {
      this.props.setModalInfo({
        title: 'Create new folder',
        okText: 'Create',
        cancelText: 'Cancel',
      });
    }

    handleOk = () => {
        this.props.store.Request(PLUGIN, "new_dir", {dir: this.state.dirname})
            .then(({data})=>{
                message.success(data.message);
                this.props.store.refresh();
                this.props.close();
            })
            .catch(err=>{
                message.error(err.response.data.message);
            });
    };

    handleTyping = e => {
        this.setState({dirname: e.target.value});
    };

    render = () => {
        return (
                <Input 
                    defaultValue={this.state.dirname} 
                    placeholder="Enter a folder name" 
                    onChange={this.handleTyping} 
                    onPressEnter={this.handleOk}
                    prefixCls="qxui-input"
                    />
        );
    };
}