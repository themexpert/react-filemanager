import React, {Component} from 'react'
import {inject, observer} from 'mobx-react'

import Col from 'antd/lib/grid/col'
import Row from 'antd/lib/grid/row'
import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'
import AutoComplete from 'antd/lib/auto-complete'
import message from 'antd/lib/message'

import throttle from 'debounce'

const {confirm} = Modal;
require('./style.css');

const FMAction = class FMAction extends Component {
    constructor(props) {
        super(props);
    }

    showDeleteConfirmation = () => {
        const store = this.props.fm_store;
        confirm({
            title: 'Sure you want to proceed to delete?',
            content: 'This action can not be reverted',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                store.trash();
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    onSearchInput = throttle(e => {
        this.props.fm_store.plugin_data.search.query = e;
        if (e === '')
            return;
        this.props.fm_store.post({
            category: 'general',
            alias: 'scan_dir',
            working_dir: this.props.fm_store.workingDir,
            payload: {query: e}
        })
            .then(({data}) => {
                const dataSource = [];
                for (let i = 0; i < data.length; i++) {
                    dataSource.push(data[i].basename);
                }
                this.props.fm_store.plugin_data.search.dataSet = data;
                this.props.fm_store.plugin_data.search.dataSource = dataSource;
            })
            .catch(err => {
                console.log(err);
                message.error(err.response.data.message);
            })
    }, 300);

    onSearchSelect = e => {
        const exists = this.props.fm_store.plugin_data.search.dataSet.find(x => x.basename === e);
        if (!exists) {
            message.error('This directory does not exist');
            return;
        }
        const dir = exists.is_dir ? exists.full_path : (() => {
            const parts = exists.full_path.split('/');
            parts.pop();
            return parts.join('/');
        })();

        this.props.fm_store.setWorkingDir(this.props.fm_store.workingDir + dir);
        this.props.fm_store.plugin_data.search.dataSource = [];
        this.props.fm_store.plugin_data.search.query = '';
    };

    render = () => {
        const selected = this.props.fm_store.selectedItems.length;
        return (
            <Col className="action-root">
                <Row style={{marginBottom: '10px'}}>
                    <Col>
                        <Button.Group style={{marginLeft: '10px', marginRight: '10px'}}>
                            <Button icon="upload" onClick={this.props.fm_store.selectPlugin('upload')}>Upload</Button>
                        </Button.Group>
                        <Button.Group style={{marginLeft: '10px', marginRight: '10px'}}>
                            <Button icon="folder-add" onClick={this.props.fm_store.selectPlugin('new_dir')}>New
                                Folder</Button>
                            <Button icon="file-add" onClick={this.props.fm_store.selectPlugin('new_file')}>New
                                File</Button>
                        </Button.Group>
                        <Button.Group style={{marginLeft: '10px', marginRight: '10px'}}>
                            <Button icon="reload" onClick={this.props.fm_store.refresh}>Reload</Button>
                        </Button.Group>
                        <Button.Group style={{marginLeft: '10px', marginRight: '10px'}}>
                            <Button icon="file-copy" onClick={this.props.fm_store.selectPlugin('rename')}
                                    disabled={selected!==1}>Rename</Button>
                            <Button icon="file-copy" onClick={this.props.fm_store.selectPlugin('copy')}
                                    disabled={!selected}>Copy</Button>
                            <Button onClick={this.props.fm_store.selectPlugin('move')}
                                    disabled={!selected}>Move</Button>
                            <Button icon="delete" onClick={this.showDeleteConfirmation}
                                    disabled={!selected}>Delete</Button>
                            <Button icon="download" disabled={true}>Download</Button>
                            <Button disabled={true}>Zip</Button>
                        </Button.Group>
                        <Button.Group style={{marginLeft: '10px', marginRight: '10px'}}>
                            <Button disabled={true}>Unzip</Button>
                        </Button.Group>
                        <Button.Group style={{marginLeft: '10px', marginRight: '10px'}}>
                            <AutoComplete
                                value={this.props.fm_store.plugin_data.search.query}
                                dataSource={this.props.fm_store.plugin_data.search.dataSource}
                                onSelect={this.onSearchSelect}
                                onSearch={this.onSearchInput}
                                placeholder="Search"
                            />
                        </Button.Group>
                    </Col>
                </Row>
                <Row>
                    <Col className="working-dir">
                        <Button.Group>
                            <Button icon="home" onClick={() => this.props.fm_store.setWorkingDir('/')}/>
                            {this.props.fm_store.workingDir.split('/').map((x, i) => {
                                if (x !== '')
                                    return <Button key={`${x}_${i}`}
                                                   onClick={() => this.props.fm_store.selectDir(i)}>{x}</Button>;
                            })}
                        </Button.Group>
                    </Col>
                </Row>
            </Col>
        );
    };
};

export default inject("fm_store")(observer(FMAction));