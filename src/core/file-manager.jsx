import React, {Component} from 'react'
import FMStore from "./store";
import {Provider, observer} from 'mobx-react'

import Modal from "antd/lib/modal";
import Spin from "antd/lib/spin";
import Tabs from "antd/lib/tabs";
import {viewport} from "./Helper";

const TabPane = Tabs.TabPane;
const stores = {
  fm_store: new FMStore()
};

const FileManager = class FileManager extends Component {
  constructor(props) {
    super(props);

    this.store = stores.fm_store;
    this.store.server = props.server;
  }

  setMountPoint = dom_el => {
    this.store.mount_point = dom_el;
  };

  openFileManager = (cb, config) => {
    this.store.openFileManager(cb, config);
  };

  registerPlugin = (plugin, config) => {
    this.store.registerPlugin(plugin, config);
  };

  handleCancel = () => {
    this.store.closeFileManager();
  };

  render = () => {
    const view_size = viewport(stores.fm_store.document);
    return (
      <Provider {...stores}>
        <Modal
          wrapClassName="fm-modal qxui-modal--with-tab"
          title="Media Manager"
          visible={this.store.is_visible}
          maskClosable={false}
          mask={false}
          prefixCls="qxui-modal"
          footer={null}
          onCancel={this.handleCancel}
          width={view_size.width/1.5}
          getContainer={this.store.mount_point}
        >
          {this.store.tabs.length ? <Tabs defaultActiveKey={this.store.tabs[0].hook} prefixCls="qxui-tabs">
            {this.store.tabs
              .map(tab => {
                return (
                  <TabPane
                    tab={tab.title}
                    key={tab.hook}>
                    <Spin spinning={this.store.is_loading}>
                      <tab.component store={this.store}/>
                    </Spin>
                  </TabPane>
                );
              })}
          </Tabs> : "The filters you've applied stripped off all the plugins we have" }
        </Modal>
      </Provider>
    );
  };
};

export default observer(FileManager);
