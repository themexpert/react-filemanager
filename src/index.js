import React from 'react'
import {render} from 'react-dom'
import FileManager from './core/file-manager'

window.ReactFileManager = {};
window.ReactFileManager.React = React;
window.ReactFileManager.Component = React.Component;

export default function (server, dom) {
    const FMElement = window.ReactFileManager.React.createElement(FileManager, {server: server});

    let fm_div = dom;
    if (fm_div === undefined) {
      fm_div = document.createElement("div");
      document.body.appendChild(fm_div);
    }

    const file_manager = render(FMElement, fm_div);

    file_manager.setMountPoint(fm_div);

    window.ReactFileManager.registerPlugin = file_manager.registerPlugin;
    window.ReactFileManager.openFileManager = file_manager.openFileManager;

    return file_manager.openFileManager;
}