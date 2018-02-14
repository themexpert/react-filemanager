import React, {Component} from 'react'
import FMAction from "./partials/action/index";
import FMContent from "./partials/content/index";
import FMStore from "./store";
import {Provider, observer} from 'mobx-react'

import Modal from "antd/lib/modal";
require("antd/lib/modal/style");
import Button from "antd/lib/button";
require("antd/lib/button/style");
import Spin from "antd/lib/spin";
require("antd/lib/spin/style");
import Col from "antd/lib/grid/col";
import Row from "antd/lib/grid/row";

require('../style.css');

const stores = {fm_store: new FMStore()};

const FileManager = class FileManager extends Component {
    constructor(props) {
        super(props);

        this.store = stores.fm_store;

        this.store.setServer(props.server);
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
        const store = this.store;
        return (
            <Provider {...stores}>
                <Modal
                    className="fm-modal"
                    wrapClassName="vertically-center"
                    visible={this.store.isVisible}
                    closable={false}
                    maskClosable={false}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>Cancel</Button>,
                        <Button key="submit" type="primary" loading={store.isLoading} onClick={this.handleOk}>
                            Select
                        </Button>,
                    ]}
                    width={window.innerWidth - 50}
                >
                    <Spin spinning={store.data.loading}>
                        <Col>
                            <Row><FMAction/></Row>
                            <Row><FMContent/></Row>
                        </Col>
                    </Spin>
                </Modal>
            </Provider>
        );
    };
};

export default observer(FileManager);