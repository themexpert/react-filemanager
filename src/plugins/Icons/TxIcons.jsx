import React, {Component} from 'react'
import throttle from 'debounce'

import message from 'antd/lib/message'
import Spin from 'antd/lib/spin'
import Input from "antd/lib/input";

require('antd/lib/message/style');
require('antd/lib/spin/style');
require('antd/lib/input/style');

const PLUGIN = "TxIcons";
const ALIAS = "icons";

export default class TxIcons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      icons: [],
      query: '',
      loading: false
    };
  }

  componentDidMount = () => {
    this.setState({loading: true});
    this.props.store.httpPost({
      plugin: PLUGIN,
      alias: ALIAS
    })
      .then(({data}) => {
        const icons = Object.values(data);
        this.setState({icons});
        this.setState({loading: false});
      })
      .catch(err => {
        console.log(err);
        message.error("Failed to load icons");
        this.setState({loading: false});
      })
  };

  handleQuery = e => {
    this.setQuery(e.target.value);
  };
  setQuery = throttle(query=> {
    this.setState({query});
  }, 100);

  fuzzySearch = (needle, haystack) => {
    const hlen = haystack.length;
    const nlen = needle.length;
    if (nlen > hlen) {
      return false;
    }
    if (nlen === hlen) {
      return needle === haystack;
    }
    outer: for (let i = 0, j = 0; i < nlen; i++) {
      const nch = needle.charCodeAt(i);
      while (j < hlen) {
        if (haystack.charCodeAt(j++) === nch) {
          continue outer;
        }
      }
      return false;
    }
    return true;
  };

  selectSVG = svg => {
    if(this.props.store.callback.call(this, {type: 'svg', svg})) {
      this.props.store.closeFileManager();
    }
  };

  render = () => {
    const icons = this.state.icons.filter(icon => {
      return icon.search.terms.find(term => this.fuzzySearch(this.state.query, term));
    });
    return (
    <Spin spinning={this.state.loading}>
      <div className="fm-toolbar">
        <Input defaultValue={this.state.query} onChange={this.handleQuery} placeholder="Search icons for..."/>
      </div>
     
     <div id="fm-content-holder">
      <div id="fm-content">
        <div className="qx-row">
          {icons.map((icon, i) => {
            return Object.values(icon.svg).map((svg, j) => {
              return (<div key={`${i}-${j}`} className="fm-grid-sm" onDoubleClick={() => this.selectSVG(svg.raw)}>
                <div className="fm-media">
                  <div className="fm-media__thumb">
                    <svg style={{width: 32, height: 38}} xmlns="http://www.w3.org/2000/svg"
                          viewBox={svg.viewBox.join(' ')}>
                      <path d={svg.path}/>
                    </svg>
                  </div>
                  <div className="fm-media__caption"><span>{icon.label}</span></div>
                </div>
              </div>)
            });
          })}
        </div>
      </div>
      </div>
    </Spin>
    );
  };
}