import React, {Component} from 'react'
import {inject, observer} from "mobx-react";
import Modal from "antd/lib/modal/Modal";

const PluginContainer =  class PluginContainer extends Component {

  state = {
    visible: false,
    title: 'Info',
    okText: 'Ok',
    cancelText: 'Close',
  };

  UNSAFE_componentWillUpdate(props) {
    if (props.fm_store.plugin.plugin !== null && !this.state.visible) {
      this.setState({visible: true});
    }
  }

  handleOk = () => {
    if(this.child.handleOk){
      return this.child.handleOk();
    }
    return this.handleCancel();
  };

  handleCancel = () => {
    this.setState({visible: false});
  };

  setModalInfo = info => {
    this.setState({...info});
  };

  close = () => {
    this.handleCancel();
  };

  render = () => {
    const store = this.props.fm_store;
    if (!store.plugin.component)
      return null;
    return (
      <Modal
        title={this.state.title}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        visible={this.state.visible}
        cancelText={this.state.cancelText}
        closable={false}
        okText={this.state.okText}
        getContainer={store.mount_point}
        prefixCls="qxui-modal"
        wrapClassName="fm-plugincontainer"
      >
        <store.plugin.component
          ref={instance => this.child = instance}
          key={store.plugin.key}
          setModalInfo={this.setModalInfo}
          store={store}
          close={this.close}
        />
      </Modal>
    );
  };
};

export default inject("fm_store")(observer(PluginContainer))
