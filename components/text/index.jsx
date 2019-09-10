import classnames from "classnames";
import React, {Component} from 'react';

// Antd UI
import Input from 'antd/lib/input';
import Popover from 'antd/lib/popover';
import Tooltip from 'components/tooltip'; 

class Text extends Component {

  /**
   * Initialize prop types.
   */
  static propTypes = {};
  
  /**
   * Initialize default props.
   */
  static defaultProps = {};

/**
 * Create a new instance of text component.
 * 
 * @param {*} props 
 */
  constructor(props) {
    super(props);

    // binding onchange function to the text component
    this.onChange = this.onChange.bind(this);
    this.getResetMarkup = this.getResetMarkup.bind(this);
    this.getHelpMarkup = this.getHelpMarkup.bind(this);
  }

  componentDidMount() {
    if (this.props.autoFocus == true) {
      setTimeout(() => {
        this.refs[this.props.id].focus();
      }, 500)
    }
  }

  /**
  * Handling text value change.
  * 
  * @param {*} e 
  */
  onChange(e) {
    let { onChange } = this.props;
    onChange(e.target.value, e);
  }

  /**
   * Geting label markup
   */
  getLabelMarkup(){
    let { label } = this.props;
    
    if(this.props.onlyBaseText) return null;

    return <p className="qx-fb-field__label">{label} {this.getHelpMarkup()} </p>
  }

  /**
   * Getting help jsx.
   */
  getHelpMarkup() {
    let { help } = this.props;

    if(this.props.onlyBaseText) return null;
    if( help ){
      return <Popover 
                content={help} 
                prefixCls="qxui-popover" 
                overlayClassName="qxui-zi-l" 
                placement="right" popupStyle={{ width: '300px'}}
                getPopupContainer={() => window.parent.document.body}>
          <i className="qxuicon-question-circle qx-fb-field__help"></i>
        </Popover>
    }
    
  }

  /**
   * Getting tooltip jsx.
   */
  getResetMarkup() {
    if (this.props.onlyBaseText) return null;

    let showReset = !_.isEqual(this.props.default, this.props.value);

    return showReset ? <Tooltip title="Reset to default" overlayClassName="qxui-zi-l" placement="left">
        <i className="qxuicon-undo qx-fb-field__reset" onClick={this.props.onReset}></i>
      </Tooltip> : null
  }
  
  /**
   * Rendering jsx.
   */
  render() {
    let { help, label, value, placeholder, onClick, onlyBaseText, style, id, addonBefore, addonAfter, disabled} = this.props;
    
    return (
      <div className="qx-fb-field-text" style={style}>
        {this.getLabelMarkup()}
        <Input
          ref={id ? id : ""}
          id={id? id : ""}
          placeholder={placeholder ? placeholder : ""}
          value={value}
          onChange={this.onChange}
          onClick={onClick ? onClick : function () { }}
          prefixCls="qxui-input"
          addonBefore={addonBefore}
          addonAfter={addonAfter}
          disabled={disabled}
        />

        {this.props.onReset ? this.getResetMarkup() : null}
      </div>
    );
  }
}
// bind antd button group
Text.Group = Input.Group;
Text.Search = Input.Search;

export default Text;
