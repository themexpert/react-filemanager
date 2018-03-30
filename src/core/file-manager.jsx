import React, {Component} from 'react'
import FMStore from "./store";
import {Provider, observer} from 'mobx-react'

import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Spin from "antd/lib/spin";
import Tabs from "antd/lib/tabs";
import {viewport} from "./Helper";

require("antd/lib/spin/style");
require('../style.css');

const TabPane = Tabs.TabPane;
const view_size = viewport();

const stores = {
  fm_store: new FMStore()
};

const FileManager = class FileManager extends Component {
  constructor(props) {
    super(props);

    this.store = stores.fm_store;

    this
      .store
      .setServer(props.server);
  }

  openFileManager = (cb, config) => {
    this
      .store
      .setVisible(true);
    this
      .store
      .setCallback(cb, config);
  };

  registerPlugin = (plugin, config) => {
    this
        .store
        .registerPlugin(plugin, config);
  };

  handleOk = e => {
    this
      .store
      .runCallback();
  };

  handleCancel = () => {
    this
      .store
      .setVisible(false);
    this
      .store
      .setCallback(e => console.log(e));
  };

  render = () => {
    return (
      <Provider {...stores}>
        <Modal
          wrapClassName="fm-modal qxui-modal--with-tab"
          title="Media Manager"
          visible={this.store.is_visible}
          maskClosable={false}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          prefixCls="qxui-modal"
          footer={[
              <Button key="submit" type="primary" loading={this.store.is_loading} onClick={this.handleOk} prefixCls="qxui-btn">
                  Select
              </Button>
          ]}
          width={window.innerWidth - 400}
        >
          <Tabs defaultActiveKey={this.store.tabs[0].hook} prefixCls="qxui-tabs">
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
          </Tabs>
        </Modal>
      </Provider>
    );
  };
};

export default observer(FileManager);
