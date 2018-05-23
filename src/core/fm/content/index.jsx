import React, {Component} from 'react'
import {inject, observer} from 'mobx-react'
import Item from "./item/index";
import PluginContainer from "../../PluginContainer";
import throttle from 'debounce';
import Button from 'antd/lib/button'

import {viewport} from "../../Helper";
import ContextMenu from "../context_menu";
const view_size = viewport();

import file_types from '../../file_types';

const FMContent = class FMContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menu_items: [],
    };

    this.props.fm_store.working_dir = '/';
  }

  onContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const ext = item ? (item.is_dir ? 'dir' : item.extension) : 'screen';

    const menu_items = this.getFilteredMenuItems(ext).map(menu_item => {
      const {callback} = menu_item;
      const n_menu_item = Object.assign({}, menu_item);
      n_menu_item.callback = () => {
        console.log('Inside callback', item);
        return callback.call(this, this.props.fm_store, item);
      };
      return n_menu_item;
    });

    this.setState({menu_items});
  };

  getFilteredMenuItems = ext => {
    const menu = this.props.fm_store.context_menu;
    /*[
      {
        scopes: ['image'],
        label: 'Preview',
        callback(item) {
          console.log('Clicked Details', item);
        },
        category: ['preview']
      },
      {
        scopes: ['audio'],
        label: 'Play',
        callback(item) {
          console.log('Clicked Details', item);
        },
        category: ['preview']
      },
      {
        scopes: ['dir', 'text'],
        label: 'Open',
        callback(item) {
          console.log('Clicked Details', item);
        },
        category: ['preview']
      },
      {
        scopes: ['dir', 'screen'],
        label: 'New Folder',
        callback(item) {
          console.log('Clicked Details', item);
        },
        category: ['new-item']
      },
      {
        scopes: ['all'],
        label: 'Details',
        callback(item) {
          console.log('Clicked Details', item);
        },
        category: ['general']
      },
    ];*/
    const type = ['screen', 'dir'].indexOf(ext) >= 0 ? ext : Object.keys(file_types).find(type => {
      return file_types[type].indexOf(ext) >= 0;
    });
    return menu.filter(menu_item => {
      return menu_item.scopes.indexOf('all') >= 0 || menu_item.scopes.indexOf(type) >= 0;
    });
  };

  clearContextMenu = () => {
    this.setState({menu_items: []});
  };

  onScroll = throttle(e => {
    const el = e.target;
    const content = el.querySelector('#fm-content');
    const scrollTop = el.scrollTop;
    const offsetHeight = el.offsetHeight;
    const scrollHeight = content.scrollHeight;

    if (scrollHeight - offsetHeight < scrollTop + 10) {
      this.props.fm_store.fetch(true);
    }
  }, 100);

  hasMore = () => {
    return this.props.fm_store.list.length < this.props.fm_store.data.total;
  };

  onClickLoadMore = () => {
    this.props.fm_store.fetch(true);
  };

  render = () => {
    return (
      <div id="fm-content-holder" onScroll={this.onScroll}>
        <div className="qx-row">
          <div id="fm-content" className="qx-col" onContextMenu={this.onContextMenu}>
            {this.props.fm_store.list
              .map(item => {
                return <Item
                  key={`${item.basename}-${item.selected}`}
                  item={item}
                  onContextMenu={e=>this.onContextMenu(e, item)}
                  store={this.props.fm_store}/>
              })}
            {this.hasMore() ?
              <Button className="fm-loadmore" icon="appstore-o" type="primary" onClick={this.onClickLoadMore}>Load
                More</Button> : null}
          </div>
          <ContextMenu menu_items={this.state.menu_items} closeContextMenu={this.clearContextMenu} el={this.props.fm_store.mount_point()}/>
          <PluginContainer/>
        </div>
      </div>
    );
  };
};

export default inject("fm_store")(observer(FMContent));
