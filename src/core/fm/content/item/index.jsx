import React, {Component} from 'react'
import {remove_duplicate_slash} from "../../../Helper";

const RAW = ["svg"];
const IMAGE = ["jpg", "jpeg", "png", "gif"];
const VIDEO = ["mkv", "mp4", "flv", "mpg", "mov"];
const AUDIO = ["mp3", "aac", "ogg"];

let TIMER = null;

export default class Item extends Component {
  constructor(props) {
    super(props);
  }

  getClass = () => {
    return "item " + this.props.className;
  };

  onClick = (e) => {
    if(TIMER !== null) {
      return this.runDoubleClick();
    }
    const multi = e.ctrlKey;
    TIMER = setTimeout(()=>this.runSingleClick(multi), 300);
  };

  runSingleClick = (multi) => {
    this.killTimer();
    this.select(multi);
  };

  runDoubleClick = () => {
    this.killTimer();
  };

  killTimer = () => {
    clearTimeout(TIMER);
    TIMER = null;
  };

  onDoubleClick = () => {
    const item = this.props.item;

    //what happens on double click on an item
    if (item.is_dir) {
      this.props.store.working_dir = this.props.store.working_dir + '/' + item.basename;
      this.props.store.fetch();
    }
    else {
      return this.runCallback(item);
    }
  };

  select = (multi) => {
    let item = this.props.item;

    if(!multi) {
      this.props.store.config.data.folders.forEach(folder=>{folder.selected=false;})
      this.props.store.config.data.files.forEach(file=>{file.selected=false;})
    }

    if (item.is_dir) {
      item = this.props.store.config.data.folders.find(x => x === item);
    } else {
      item = this.props.store.config.data.files.find(x => x === item);
    }

    item.selected = !item.selected;
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
    try {
      if (this.props.store.callback.call(this, result)) {
        this.props.store.closeFileManager();
      }
    }
    catch(e) {
      console.log(e);
    }
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

  excerpt = () => {
    const basename = this.props.item.basename;
    const max = 11;
    return basename.split('').length > max ? this.props.item.filename.substr(0, max) + '...' + ( this.props.item.is_dir ? '' : this.props.item.extension ) : basename;
  };

  render = () => {
    let mediaType = this.props.item.is_dir ? 'folder' : 'file';
    let mediaTypeClass = ' ' + mediaType;
    return (
      <div className="fm-grid-m">
        <div className={this.getMediaClass()} onDoubleClick={this.onDoubleClick} onClick={this.onClick} onContextMenu={this.props.onContextMenu}>
          <div className="fm-media__thumb">
            <img src={this.img()} alt="icon"/>
          </div>
          <div className="fm-media__caption">
            <span>{this.excerpt()}</span>
          </div>
        </div>
      </div>
    );
  };
};
