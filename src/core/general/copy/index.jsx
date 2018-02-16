import React, {Component} from 'react'
import throttle from 'debounce'

import AutoComplete from 'antd/lib/auto-complete'
require('antd/lib/auto-complete/style');
import Modal from 'antd/lib/modal'
require('antd/lib/modal/style');
import message from 'antd/lib/message'
require('antd/lib/message/style');

export default class Copy extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            query: '',
            dataSource: [],
            dataSet: []
        };
    }

    componentDidMount = () => {
        this.setState({visible: true, query: this.props.store.workingDir});
    };

    componentWillUnmount = () => {
        this.setState({visible: false});
    };

    handleOk = () => {
        const sources = [];
        this.props.store.list.forEach(item=>{
            if(item.selected)
                sources.push(item.basename);
        });
        this.props.store.Request({destination: this.state.query, sources})
            .then(({data}) => {
                message.success(data.message);
                this.props.store.refresh();
                this.setState({visible: false});
                this.props.store.clearPlugin();
            })
            .catch(err => {
                message.error(err.response.data.message);
            })
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    onSearchInput = throttle(e => {
        this.setState({query: e});
        if (e === '')
            e = '/';
        this.props.store.post({
            plugin: 'General',
            alias: 'scan_dir',
            working_dir: '/',
            payload: {query: e}
        })
            .then(({data}) => {
                const dataSource = [];
                for (let i = 0; i < data.length; i++) {
                    if (data[i].is_dir)
                        dataSource.push(data[i].full_path);
                }
                this.setState({dataSet: data, dataSource});
            })
            .catch(err => {
                console.log(err);
                message.error(err.response.data.message);
            });
    }, 300);

    onSearchSelect = e => {
        const exists = this.state.dataSet.find(x => x.full_path === e);
        if (!exists) {
            message.error('This directory does not exist');
            return;
        }

        this.setState({query: exists.full_path});
    };

    render = () => {
        return (
            <Modal
                title="Copy"
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                visible={this.state.visible}
                cancelText="Cancel"
                closable={false}
                okText="Copy"
            >
                <AutoComplete
                    style={{width: '100%'}}
                    value={this.state.query}
                    dataSource={this.state.dataSource}
                    onSelect={this.onSearchSelect}
                    onSearch={this.onSearchInput}
                    placeholder="Copy To"
                />
            </Modal>
        );
    };
}