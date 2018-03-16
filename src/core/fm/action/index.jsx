import React, {Component} from 'react'
import {inject, observer} from 'mobx-react'

import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'
import Tooltip from 'antd/lib/tooltip'
import AutoComplete from 'antd/lib/auto-complete'
import message from 'antd/lib/message'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import Breadcrumb from 'antd/lib/breadcrumb'

require('antd/lib/auto-complete/style');
require('antd/lib/message/style');
require('antd/lib/input/style');
require('antd/lib/breadcrumb/style');

import throttle from 'debounce'
import ButtonGroup from 'antd/lib/button/button-group';

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
      }
    });
  };

  onSearchInput = throttle(e => {
    this.props.fm_store.pluginData.search.query = e;
    if (e === '') 
      return;
    this
      .props
      .fm_store
      .httpPost({
        plugin: 'General',
        alias: 'scan_dir',
        working_dir: this.props.fm_store.workingDir,
        payload: {
          query: e
        }
      })
      .then(({data}) => {
        const dataSource = [];
        for (let i = 0; i < data.length; i++) {
          dataSource.push(data[i].basename);
        }
        this.props.fm_store.pluginData.search.dataSet = data;
        this.props.fm_store.pluginData.search.dataSource = dataSource;
      })
      .catch(err => {
        console.log(err);
        message.error(err.response.data.message);
      })
  }, 300);

  onSearchSelect = e => {
    const exists = this
      .props
      .fm_store
      .pluginData
      .search
      .dataSet
      .find(x => x.basename === e);
    if (!exists) {
      message.error('This directory does not exist');
      return;
    }
    const dir = exists.is_dir
      ? exists.full_path
      : (() => {
        const parts = exists
          .full_path
          .split('/');
        parts.pop();
        return parts.join('/');
      })();

    this
      .props
      .fm_store
      .setWorkingDir(this.props.fm_store.workingDir + dir);
    this.props.fm_store.pluginData.search.dataSource = [];
    this.props.fm_store.pluginData.search.query = '';
  };

  render = () => {
    const selected = this.props.fm_store.selectedItems.length;
    return (
      <div className="fm-action-btns">
        <div className="qx-row qx-justify-content-between">
          <div className="qx-col">
            <Button icon="upload" type="primary" onClick={this.props.fm_store.selectPlugin('upload')}>Upload</Button>
            <Button.Group prefixCls="qxui-btn-group" style={{marginLeft: '10px',marginRight: '10px' }}>
              <Tooltip title="New Folder">
                <Button icon="folder-add" onClick={this.props.fm_store.selectPlugin('new_dir')}/>
              </Tooltip>

              <Tooltip title="New File">
                <Button icon="file-add" onClick={this.props.fm_store.selectPlugin('new_file')}/>
              </Tooltip>

              <Tooltip title="Rename">
                <Button icon="edit" onClick={this.props.fm_store.selectPlugin('rename')} disabled={selected !== 1}/>
              </Tooltip>

              <Tooltip title="Duplciate">
                <Button icon="copy" onClick={this.props.fm_store.selectPlugin('copy')}disabled={!selected}/>
              </Tooltip>

              <Tooltip title="Move">
                <Button icon="swap" onClick={this.props.fm_store.selectPlugin('move')} disabled={!selected}/>
              </Tooltip>

              <Tooltip title="Delete">
                <Button icon="delete" onClick={this.showDeleteConfirmation} disabled={!selected}/>
              </Tooltip>
            </Button.Group>

            <Button.Group style={{ marginLeft: '10px', marginRight: '10px'}}>
              <Tooltip title="Reload">
                <Button icon="reload" onClick={this.props.fm_store.refresh}/>
              </Tooltip>
            </Button.Group>

             { Object.keys(this.props.fm_store.actionMenu).length ? 
              <div>
                {Object.keys(this.props.fm_store.actionMenu)
                  .map(key => { return <Button onClick={this.props.fm_store.selectPlugin(key)} 
                                  key={key}>{this.props.fm_store.actionMenu[key]}</Button>
                })}
              </div> : null }
          </div>

          <div className="qx-col qx-text-right">
            <ButtonGroup prefixCls="qxui-btn-group" style={{marginLeft: '10px',marginRight: '10px' }}>
              <Button prefixCls="qxui-btn" selected>All</Button>
              <Button icon="picture" prefixCls="qxui-btn"/>
              <Button icon="video-camera" prefixCls="qxui-btn"/>
            </ButtonGroup>

            <AutoComplete
              value={this.props.fm_store.pluginData.search.query}
              dataSource={this.props.fm_store.pluginData.search.dataSource}
              onSelect={this.onSearchSelect}
              onSearch={this.onSearchInput}
              placeholder="Search">
              <Input suffix={< Icon type = "search" className = "certain-category-icon" />} prefixCls="qxui-input"/>
            </AutoComplete>
          </div>
        </div>

        <div className="qx-row">
          <div className="qx-col">
            <Breadcrumb>
              <Breadcrumb.Item onClick={() => this.props.fm_store.setWorkingDir('/')}>
                <Icon type="home"/>
              </Breadcrumb.Item>
              {this.props.fm_store.workingDir.split('/')
                .map((x, i) => {
                  if (x !== '') 
                    return <Breadcrumb.Item
                      key={`${x}_${i}`}
                      onClick={() => this.props.fm_store.selectDir(i)}>{x}</Breadcrumb.Item>;
                  }
                )}
            </Breadcrumb>
          </div>
        </div>
      </div>
    );
  };
};

export default inject("fm_store")(observer(FMAction));