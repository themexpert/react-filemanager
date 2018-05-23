import React, { Component } from 'react';
require('./style.css');

export default class ContextMenu extends Component {
  componentDidMount() {
    document.addEventListener('contextmenu', this._handleContextMenu);
    document.addEventListener('click', this._handleClick);
  };

  componentWillUnmount() {
    document.removeEventListener('contextmenu', this._handleContextMenu);
    document.removeEventListener('click', this._handleClick);
  }

  _handleContextMenu = (event) => {
    event.preventDefault();

    const clickX = event.clientX;
    const clickY = event.clientY;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const rootW = this.root.offsetWidth;
    const rootH = this.root.offsetHeight;

    const right = (screenW - clickX) > rootW;
    const left = !right;
    const top = (screenH - clickY) > rootH;
    const bottom = !top;

    if (right) {
      this.root.style.left = `${clickX + 5}px`;
    }

    if (left) {
      this.root.style.left = `${clickX - rootW - 5}px`;
    }

    if (top) {
      this.root.style.top = `${clickY + 5}px`;
    }

    if (bottom) {
      this.root.style.top = `${clickY - rootH - 5}px`;
    }
  };

  _handleClick = (event) => {
    const menu_items = this.props.menu_items;
    const visible = menu_items.length > 0;
    const wasOutside = !(event.target.contains === this.root);

    if (wasOutside && visible) {
      this.props.closeContextMenu();
    }
  };

  render() {
    const menu_items = this.props.menu_items;
    const visible = menu_items.length > 0;

    return (visible || null) &&
      <div ref={ref => {
        this.root = ref
      }} className="contextMenu">
        {menu_items.map(menu_item => {
          return (
            <div className="contextMenu--option" key={menu_item.label} onClick={menu_item.callback}>{ menu_item.label }</div>
          );
        })}
        {/*<div className="contextMenu--option contextMenu--option__disabled">View full version</div>*/}
        {/*<div className="contextMenu--option">Settings</div>*/}
        {/*<div className="contextMenu--separator"/>*/}
        {/*<div className="contextMenu--option">About this app</div>*/}
      </div>
  };
}
