import React from 'react'
import ReactDOM from 'react-dom'
import FileManager from './core/file-manager'

export default function (server) {
    const FMElement = React.createElement(FileManager, {server: server});

    const fm_div = document.createElement("div");
    document.body.appendChild(fm_div);

    const file_manager = ReactDOM.render(FMElement, fm_div);

    return file_manager.openFileManager;
}