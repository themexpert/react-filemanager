import React, {Component} from 'react'
import Tooltip from 'antd/lib/tooltip'
import {remove_duplicate_slash} from "../../../Helper";
require('antd/lib/tooltip/style');

const RAW = ["svg"];
const IMAGE = ["jpg", "jpeg", "png"];
const VIDEO = ["mkv", "mp4", "flv", "mpg"];
const AUDIO = ["mp3", "aac", "ogg"];

export default class Item extends Component {
  constructor(props) {
    super(props);
  }

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
      }
  };

  select = (item, e) => {
    if (item.is_dir) {
      item = this.props.store.config.data.folders.find(x => x === item);
    } else {
      item = this.props.store.config.data.files.find(x => x === item);
    }

    //item.selected = e.ctrlKey ? !item.selected : true;
    item.selected = (e && e.target.checked === true) || !item.selected;

    // this.forceUpdate();
  };

  //run the callback with the result
  runCallback = item => {
    let type = "unknown";
    if(RAW.indexOf(item.extension.toLowerCase()) >= 0) {
      return this.sendRawResult(item);
    }
    else if (IMAGE.indexOf(item.extension.toLowerCase()) >= 0) {
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

    this.sendResult(result);
  };

  //send raw data as result
  sendRawResult = item => {
    this.props.store.httpGet(this.img())
    .then(({data})=>{
      const type = item.extension.toLowerCase();
      const result = {
        type
      };
      result[`${type}`] = data;
      this.sendResult(result);
    })
  };

  //call the callback and send the result
  sendResult = result => {
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

  getMediaClass = () => {
    const classes = ["fm-media"];
    if(this.props.item.is_dir)
      classes.push("fm-media--folder");
    else
      classes.push("fm-media--file");
    if(this.props.item.selected)
      classes.push("active");
    return classes.join(" ");
  };

  render = () => {
    let mediaType = this.props.item.is_dir ? 'folder' : 'file';
    let mediaTypeClass = ' ' + mediaType;
    return (
      <Tooltip title={this.tooltip()} overlayClassName="info-tooltip">
        <div className="fm-grid-m">
          <div className="fm-checkbox-wrap">
            <input type="checkbox" checked={this.props.item.selected} onChange={this.onClick} />
          </div>
          <div className={this.getMediaClass()} onDoubleClick={this.onDoubleClick} onContextMenu={this.onContextMenu}>
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