import React, {Component} from 'react'
import Tooltip from 'antd/lib/tooltip'
require('antd/lib/tooltip/style');

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
    this.props.store.select(this.props.item, e);
  };

  onDoubleClick = e => {
    e.preventDefault();
    e.stopPropagation();
    this.props.store.clickAction(this.props.item);
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

  render = () => {
    let mediaType = this.props.item.is_dir ? 'folder' : 'file';
    let mediaTypeClass = 'fm-media fm-media--' + mediaType;
    return (
      <Tooltip title={this.tooltip()} overlayClassName="info-tooltip">
        <div className="fm-grid-m">
          <div className={mediaTypeClass} onClick={this.onClick} onDoubleClick={this.onDoubleClick} onContextMenu={this.onContextMenu}>
            <div className="fm-media__thumb">
              <img src={this.img()} alt="icon"/>
            </div>
            <div className="fm-media__caption">
            {this.props.item.is_dir ? <span onClick={this.onDoubleClick}>{this.props.item.basename}</span> :
              <span>{this.props.item.basename}</span>}
            </div>
          </div>
        </div>
      </Tooltip>
    );
  };
}