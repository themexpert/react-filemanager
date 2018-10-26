import React, {Component} from 'react'
import Card from "antd/lib/card";

export default class ImagePreview extends Component {
  componentDidMount() {
    this.props.setModalInfo({
      title: this.props.store.item_in_action.basename,
      okText: 'Close',
      cancelText: 'Close',
    });
  }

  img = () => {
    const path = this.props.store.server;
    const query = ['working_dir=' + this.props.store.working_dir, 'raw=' + this.props.store.item_in_action.basename];
    if (path.indexOf('?') > -1)
      return path + '&' + query.join('&');
    return path + '?' + query.join(('&'));
  };

  render = () => {
    return (
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
    );
  };
};