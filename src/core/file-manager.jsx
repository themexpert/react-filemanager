import React, {Component} from 'react'
import FMStore from "./store";
import {Provider, observer} from 'mobx-react'

import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Spin from "antd/lib/spin";
import Tabs from "antd/lib/tabs";
import {viewport} from "./Helper";

require("antd/lib/modal/style");
require("antd/lib/button/style");
require("antd/lib/spin/style");
require("antd/lib/tabs/style");
require("antd/lib/badge/style");
require('../style.css');

const TabPane = Tabs.TabPane;
const view_size = viewport();

const stores = {fm_store: new FMStore()};

const FileManager = class FileManager extends Component {
    constructor(props) {
        super(props);

        this.store = stores.fm_store;

        this.store.setServer(props.server);
        this.store.loadPlugins();
    }

    openFileManager = cb => {
        this.store.setVisible(true);
        this.store.setCallback(cb);
    };

    handleOk = e => {
        this.store.runCallback(e);
    };

    handleCancel = () => {
        this.store.setVisible(false);
        this.store.setCallback(e => console.log(e));
    };

    render = () => {
        return (
            <Provider {...stores}>
                <Modal
                    className="fm-modal"
                    title="Media Manager"
                    visible={this.store.isVisible}
                    mask={false}
                    maskClosable={false}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>Cancel</Button>,
                        <Button key="submit" type="primary" loading={this.store.isLoading} onClick={this.handleOk}>
                            Select
                        </Button>,
                    ]}
                    width={window.innerWidth - 50}
                >
                    <Tabs defaultActiveKey={this.store.Tabs[0].hook}>
                        {this.store.Tabs.map(tab => {
                            return (
                                <TabPane tab={tab.title} key={tab.hook} style={{height: view_size.height * 0.55 + 'px'}}>
                                    <Spin spinning={this.store.isLoading}>
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