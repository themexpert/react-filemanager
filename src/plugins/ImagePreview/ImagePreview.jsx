import React, {Component} from 'react'
import Modal from "antd/lib/modal/Modal";
import Card from "antd/lib/card";

export default class ImagePreview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };
  }

  componentWillMount = () => {
    this.setState({visible: true});
    console.log(this.props.store.item_in_action);
  };

  componentWillUnmount = () => {
    this.setState({visible: false});
  };

  img = () => {
    const path = this.props.store.server;
    const query = ['working_dir=' + this.props.store.working_dir, 'raw=' + this.props.store.item_in_action.basename];
    if (path.indexOf('?') > -1)
      return path + '&' + query.join('&');
    return path + '?' + query.join(('&'));
  };

  handleOk = () => {
    this.handleCancel();
    this.props.store.clearPlugin();
  };

  handleCancel = () => {
    this.setState({visible: false});
  };

  render = () => {
    return (
      <Modal
        title={this.props.store.item_in_action.basename}
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Card
          hoverable
          style={{width: 240}}
          cover={<img alt="example" src={this.img()}/>}
        >
          <Card.Meta
            title={"Europe Street beat"}
            description={"www.instagram.com"}
          />
        </Card>
      </Modal>
    );
  };
};