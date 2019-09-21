import React, { Component } from 'react';

export default class ContextMenu extends Component {
  componentDidMount() {
    this.props.el.ownerDocument.addEventListener('contextmenu', this._handleContextMenu);
    this.props.el.ownerDocument.addEventListener('click', this._handleClick);
  };

  UNSAFE_componentWillUnmount() {
    this.props.el.ownerDocument.removeEventListener('contextmenu', this._handleContextMenu);
    this.props.el.ownerDocument.removeEventListener('click', this._handleClick);
  }

  _handleContextMenu = (event) => {
    event.preventDefault();

    if(this.props.menu_items.length === 0) {
      return false;
    }

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
    const wasOutside = !(event.target.contains === this.root);

    if (wasOutside) {
      this.props.closeContextMenu();
    }
  };

  render() {
    const menu_items = this.props.menu_items;
    if(!menu_items.length)
      return null;
    return (
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
      </div>)
  };
}
