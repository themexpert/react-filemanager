import React from "react";
import AntdButton from 'antd/lib/button';

class Button extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <AntdButton
      {...this.props}
      type={this.props.type ? this.props.type : 'default'}
      icon={this.props.icon}
      className={this.props.className}
      prefixCls="qxui-btn">
      {this.props.children}
    </AntdButton>
  }
}

// bind antd button group
Button.Group = AntdButton.Group;

export default Button;