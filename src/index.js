import React from 'react'
import ReactDOM from 'react-dom'
import FileManager from './core/file-manager'
import TestPlugin from "./plugins/TestPlugin";

export default function (server) {
    const FMElement = React.createElement(FileManager, {server: server});

    const fm_div = document.createElement("div");
    document.body.appendChild(fm_div);

    const file_manager = ReactDOM.render(FMElement, fm_div);
    file_manager.registerPlugin(TestPlugin);

    return file_manager.openFileManager;
}