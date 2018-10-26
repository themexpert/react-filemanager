import React, {Component} from 'react'
import {inject, observer} from 'mobx-react'

import Modal from 'antd/lib/modal'
import AutoComplete from 'antd/lib/auto-complete'
import message from 'antd/lib/message'
import Breadcrumb from 'antd/lib/breadcrumb'

import Button from 'components/button'
import Input from 'components/text'

import throttle from 'debounce'
import ButtonGroup from 'antd/lib/button/button-group';

const FMAction = class FMAction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
    };
  }

  showDeleteConfirmation = () => {
    const store = this.props.fm_store;
    if (window.confirm('Are you sure you want to delete selected files/folders? You can not undo this action.')) {
      store.trash();
    }
  };

  handleQueryChange = query => {
    this.setState({query: query.trim()});
    this.doSearch();
  };
  
  doSearch = throttle( () => {
    if (this.state.query === '') {
      this.props.fm_store.query = null;
    } else {
      this.props.fm_store.query = this.state.query;
    }
    this.props.fm_store.fetch();
  }, 300);

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
              <Breadcrumb className="qxui-breadcrumb">
                <Breadcrumb.Item onClick={() => this.props.fm_store.working_dir = '/'}>
                  <i className="qxicon-neuter"></i>
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
                <Input
                value={this.state.query}
                 suffix={<i className="qxicon-folder-open certain-category-icon"></i>}
                  prefixCls="qxui-input" onChange={this.handleQueryChange}/>
            </div>
          </div>
        </div>
      </div>
    );
  };
};

export default inject("fm_store")(observer(FMAction));