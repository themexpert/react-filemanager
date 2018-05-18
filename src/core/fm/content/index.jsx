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

  componentDidMount = () => {
    document.getElementById('fm-content-holder').addEventListener('scroll', this.onScroll);
  };

  componentWillUnmount = () => {
    document.getElementById('fm-content-holder').removeEventListener('scroll', this.onScroll);
  };

  onContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const ext = item ? (item.is_dir ? 'dir' : item.extension) : 'screen';

    this.setState({menu_items: this.getFilteredMenuItems(ext)});
  };

  getFilteredMenuItems = ext => {
    const menu = [
      {
        scopes: ['image'],
        label: 'Preview',
        callback() {
          console.log('Image Preview');
        }
      },
      {
        scopes: ['audio'],
        label: 'Play',
        callback() {
          console.log('Play this music');
        }
      },
      {
        scopes: ['dir', 'text'],
        label: 'Open',
        callback() {
          console.log('Clicked Open');
        }
      },
      {
        scopes: ['dir', 'screen'],
        label: 'New Folder',
        callback() {
          console.log("Create new folder");
        }
      },
      {
        scopes: ['all'],
        label: 'Details',
        callback() {
          console.log('Clicked Details');
        }
      },
    ];
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
    const el = document.getElementById('fm-content-holder');
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
      <div id="fm-content-holder">
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
          <ContextMenu menu_items={this.state.menu_items} closeContextMenu={this.clearContextMenu}/>
          <PluginContainer/>
        </div>
      </div>
    );
  };
};

export default inject("fm_store")(observer(FMContent));
