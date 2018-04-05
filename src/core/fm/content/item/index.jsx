import React, {Component} from 'react'
import Tooltip from 'antd/lib/tooltip'
import {remove_duplicate_slash} from "../../../Helper";
require('antd/lib/tooltip/style');

const IMAGE = ["jpg", "jpeg", "png", "svg"];
const VIDEO = ["mkv", "mp4", "flv", "mpg"];
const AUDIO = ["mp3", "aac", "ogg"];

export default class Item extends Component {
  constructor(props) {
    super(props);

  }

  getIcon = () => {

  };

  getClass = () => {
    return "item " + this.props.className;
  };

  onClick = e => {
    if(this.props.item.is_dir)
      this.onDoubleClick(e);
    else
      this.select(this.props.item, e);
  };

  onDoubleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    const item = this.props.item;

    //what happens on double click on an item
      if (item.is_dir) {
        this.props.store.working_dir = this.props.store.working_dir + item.basename + '/';
        this.props.store.fetch();
      }
      else {
        return this.runCallback(item);
        //TODO: preview
        // this.config.plugin.plugin = 'General';
        // this.config.plugin.alias = 'file_info';
        // this.config.plugin.component = this.config.plugins.file_info.component;
        // this.config.plugin_data.file_info.file = item;
      }
  };

  select = (item, e) => {
    if (!e.ctrlKey) {
      let i;
      for (i = this.props.store.config.data.folders.length - 1; i >= 0; i--) {
        this.props.store.config.data.folders[i].selected = false;
      }
      for (i = this.props.store.config.data.files.length - 1; i >= 0; i--) {
        this.props.store.config.data.files[i].selected = false;
      }
    }

    if (item.is_dir) {
      item = this.props.store.config.data.folders.find(x => x === item);
    } else {
      item = this.props.store.config.data.files.find(x => x === item);
    }

    item.selected = e.ctrlKey ? !item.selected : true;

    this.forceUpdate();
  };

  //run the callback with the result
  runCallback = item => {
    // let selection = [];
    // if (item && !item.is_dir) {
    //   selection.push(item);
    // }
    // else {
    //   selection = this.props.store.list.filter(item => item.selected);
    //   const has_dir = selection.filter(item => item.is_dir);
    //   if (has_dir.length) {
    //     message.warning("You can select files only.");
    //     return;
    //   }
    // }
    // const result = selection.map(item => {
    //   console.log(item);
    //   return this.remove_duplicate_slash(this.working_dir + '/' + item.basename);
    // });

    let type = "unknown";
    if (IMAGE.indexOf(item.extension.toLowerCase()) >= 0) {
      type = "image";
    }
    else if(VIDEO.indexOf(item.extension.toLowerCase()) >= 0) {
      type = "video";
    }
    else if(AUDIO.indexOf(item.extension.toLowerCase()) >= 0) {
      type = "audio";
    }

    const result = {
      type
    };

    result[`${type}`] = remove_duplicate_slash(this.props.store.working_dir + '/' + item.basename);

    if (this.props.store.callback.call(this, result)) {
      this.props.store.closeFileManager();
    }
  };

  onContextMenu = e => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Context Menu Item");
  };

  img = () => {
    const path = this.props.store.server;
    const query = ['working_dir=' + this.props.store.working_dir];
    if (this.props.item.is_dir) {
      query.push('icon=folder');
    }
    else {
      const ext = this.props.item.extension;
      if (['png', 'jpg', 'jpeg', 'webp', 'gif'].indexOf(ext) >= 0) {
        query.push('thumb=' + this.props.item.basename);
      }
      else if (['svg'].indexOf(ext) >= 0) {
        query.push('raw=' + this.props.item.basename);
      }
      else {
        query.push('icon=' + ext);
      }
    }
    if (path.indexOf('?') > -1)
      return path + '&' + query.join('&');
    return path + '?' + query.join(('&'));
  };

  tooltip = () => {
    return [
      <p key="name">
        {this.props.item.basename} - <strong>{this.props.item.size}</strong> <br/>
        <strong>{this.props.item.last_modification_time}</strong>
      </p>
    ];
  };

  getWrapperClass = () => {
    const classes = ["fm-grid-m"];
    if(this.props.item.selected)
      classes.push("selected");
    return classes.join(" ");
  };

  render = () => {
    let mediaType = this.props.item.is_dir ? 'folder' : 'file';
    let mediaTypeClass = 'fm-media fm-media--' + mediaType;
    return (
      <Tooltip title={this.tooltip()} overlayClassName="info-tooltip">
        <div className={this.getWrapperClass()}>
          <div className={mediaTypeClass} onClick={this.onClick} onDoubleClick={this.onDoubleClick} onContextMenu={this.onContextMenu}>
            <div className="fm-media__thumb">
              <img src={this.img()} alt="icon"/>
            </div>
            <div className="fm-media__caption">
              <span>{this.props.item.basename}</span>
            </div>
          </div>
        </div>
      </Tooltip>
    );
  };
}