import React, {Component} from 'react'
import FMAction from './action'
import FMContent from './content'
import PluginContainer from "./PluginContainer";

export default class FM extends Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    return (
      <div>
        <FMAction/>
        <FMContent/>
        <PluginContainer/>
      </div>
    );
  };
}