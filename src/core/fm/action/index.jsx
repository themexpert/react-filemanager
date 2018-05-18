import React, {Component} from 'react'
import {inject, observer} from 'mobx-react'

import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'
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
import FMStore from "../../store";

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
    this.props.fm_store.plugin_data.search.query = e;
    if (e === '')
      return;
    this
      .props
      .fm_store
      .httpPost({
        plugin: 'General',
        alias: 'scan_dir',
        working_dir: this.props.fm_store.working_dir,
        payload: {
          query: e
        }
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
    const exists = this
      .props
      .fm_store
      .plugin_data
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

    this.props.fm_store.working_dir = this.props.fm_store.working_dir + dir;
    this.props.fm_store.plugin_data.search.dataSource = [];
    this.props.fm_store.plugin_data.search.query = '';
  };

  selectDir = index => {
    const new_dir = [];
    this.props.fm_store.working_dir.split('/').forEach((x, i) => {
      if (i <= index)
        new_dir.push(x);
    });
    this.props.fm_store.working_dir = new_dir.join('/');
    this.props.fm_store.fetch();
  };

  render = () => {
    const selected = this.props.fm_store.selected_items.length;
    return (
      <div className="fm-toolbar">
        <div className="fm-action-btns">
          <div className="qx-row">
            <div className="qx-col">
              <Button icon="upload" type="primary" onClick={this.props.fm_store.selectPlugin('upload')}>Upload</Button>
              
              <Button icon="folder-add" onClick={this.props.fm_store.selectPlugin('new_dir')}>New Folder</Button>

              <Button icon="file-add" onClick={this.props.fm_store.selectPlugin('new_file')}>New File</Button>

              <Button icon="edit" onClick={this.props.fm_store.selectPlugin('rename')} disabled={selected !== 1}>Rename</Button>

              <Button icon="copy" onClick={this.props.fm_store.selectPlugin('copy')} disabled={!selected}>Copy</Button>

              <Button icon="swap" onClick={this.props.fm_store.selectPlugin('move')} disabled={!selected}>Move</Button>

              <Button icon="delete" onClick={this.showDeleteConfirmation} disabled={!selected}/>

              <Button icon="reload" onClick={this.props.fm_store.refresh}>Refresh</Button>

              {Object.keys(this.props.fm_store.action_menu).length ?
                <div>
                  {Object.keys(this.props.fm_store.action_menu)
                    .map(key => {
                      return <Button onClick={this.props.fm_store.selectPlugin(key)}
                                    key={key}>{this.props.fm_store.action_menu[key]}</Button>
                    })}
                </div> : null}
            </div>
          </div>
        </div>

        <div className="fm-scope">
          <div className="qx-row qx-justify-content-between">
            <div className="qx-col">
              <Breadcrumb>
                <Breadcrumb.Item onClick={() => this.props.fm_store.working_dir = '/'}>
                  <Icon type="home"/>
                </Breadcrumb.Item>
                {this.props.fm_store.working_dir.split('/')
                  .map((x, i) => {
                      if (x !== '')
                        return <Breadcrumb.Item
                          key={`${x}_${i}`}
                          onClick={() => this.selectDir(i)}>{x}</Breadcrumb.Item>;
                    }
                  )}
              </Breadcrumb>
            </div>
            <div className="qx-col fm-search">
              <ButtonGroup prefixCls="qxui-btn-group" style={{marginLeft: '10px', marginRight: '10px'}}>
                {Object.keys(this.props.fm_store.filter_types).map(filter_type=> {
                  return (<Button
                    key={`filter-${filter_type}`}
                    prefixCls="qxui-btn"
                    icon={this.props.fm_store.filter_types[filter_type].icon}
                    className={this.props.fm_store.filter_type === filter_type ? 'active' : ''}
                    onClick={() => this.props.fm_store.filter_type = filter_type}>
                    {this.props.fm_store.filter_types[filter_type].title !== "" ? this.props.fm_store.filter_types[filter_type].title : ""}
                  </Button>)
                })}
              </ButtonGroup>

              <AutoComplete
                value={this.props.fm_store.plugin_data.search.query}
                dataSource={this.props.fm_store.plugin_data.search.dataSource}
                onSelect={this.onSearchSelect}
                onSearch={this.onSearchInput}
                placeholder="Search">
                <Input suffix={< Icon type="search" className="certain-category-icon"/>} prefixCls="qxui-input"/>
              </AutoComplete>
            </div>
          </div>
        </div>
      </div>
    );
  };
};

export default inject("fm_store")(observer(FMAction));