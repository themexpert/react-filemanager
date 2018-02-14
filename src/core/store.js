import React from 'react'
import {observable, computed, action} from 'mobx'

import message from 'antd/lib/message'
require('antd/lib/message/style');

import NewDirectory from "./general/new_dir/index";
import axios from 'axios'
import NewFile from "./general/new_file/index";
import Uploader from "./general/upload/index";
import Copy from "./general/copy/index";
import Move from "./general/move/index";
import Rename from "./general/rename/index";
import FileInfo from "./general/file-info/index";

export default class FMStore {
    config = observable({
        plugins: []
    });
    plugins = observable({
        new_dir: {
            category: 'general',
            component: NewDirectory
        },
        new_file: {
            category: 'general',
            component: NewFile
        },
        upload: {
            category: 'general',
            component: Uploader
        },
        copy: {
            category: 'general',
            component: Copy
        },
        move: {
            category: 'general',
            component: Move
        },
        rename: {
            category: 'general',
            component: Rename
        },
        file_info: {
            category: 'general',
            component: FileInfo
        }
    });
    plugin = observable({
        component: null,
        alias: null,
        category: null,
        key: Math.random()
    });
    plugin_data = observable({
        search: {
            dataSet: [],
            dataSource: [],
            query: ''
        },
        file_info: {
            file: null
        }
    });
    data = observable({
        total: 0,
        current_page: 1,
        files: [],
        folders: [],
        server: "",
        working_dir: "/",
        loading: false,
        visible: false,
        show_upload_dialog: false,
        is_uploading: false,
        callback: e => console.log(e)
    });

    get contextMenu() {
        return (<ul>
            <li>Hello</li>
            <li>World</li>
        </ul>);
    };

    get itemContextMenu() {

    };

    selectPlugin = action(alias => {
        return () => {
            if (this.plugins[alias] == null) {
                message.error('The requested plugin is not installed.');
                return;
            }
            const plugin = this.plugins[alias];
            this.plugin.component = plugin.component;
            this.plugin.alias = alias;
            this.plugin.category = plugin.category;
            this.plugin.key = Math.random();
        };
    });

    clearPlugin = action(() => {
        setTimeout(() => {
            this.plugin.component = null;
            this.plugin.alias = null;
            this.plugin.category = null;
        }, 1000);
    });

    Request = action(payload => {
        return this.post({
            category: this.plugin.category,
            alias: this.plugin.alias,
            working_dir: this.data.working_dir,
            payload
        });
    });

    showErrorMessage = msg => {
        message.info(msg, 4);
    };

    get list() {
        return this.data.folders.concat(this.data.files);
    };

    //region server { server, setServer }
    setServer = action(server => {
        this.data.server = server;
    });

    get server() {
        return this.data.server;
    };

    //endregion

    //region callback { setCallback, callback }
    setCallback = action(callback => {
        this.data.callback = callback;
    });

    runCallback = action(e => {
        const selection = this.list.filter(item => item.selected);
        const has_dir = selection.filter(item => item.is_dir);
        if(has_dir.length) {
            message.warning("You can select files only.");
            return;
        }
        const result = selection.map(item=>{
            return this.remove_duplicate_slash(this.workingDir + '/' + item.basename);
        });
        if(this.data.callback.call(this, result)) {
            this.setVisible(false);
        }
    });
    //endregion

    //region working_dir { workingDir, setWorkingDir }
    setWorkingDir = action(dir => {
        this.data.folders = [];
        this.data.files = [];
        this.data.total = 0;
        this.data.current_page = 1;
        this.data.working_dir = this.remove_duplicate_slash('/' + dir);
        //TODO: Attach event to clear up plugin data
        this.plugin_data.search.query = '';
        this.plugin_data.search.dataSource = [];
        this.fetch();
    });

    get workingDir() {
        return this.data.working_dir;
    };

    remove_duplicate_slash = str => {
        let clean = '';
        let ls = false;
        for (let i = 0; i < str.length; i++) {
            if ((str[i] === '/' && !ls) || str[i] !== '/')
                clean += str[i];
            ls = str[i] === '/';
        }
        return clean;
    };

    //endregion

    //region state { isLoading, isVisible, setVisible, showUploadDialog, setShowUploadDialog, isUploading }
    get isVisible() {
        return this.data.visible;
    };

    setVisible = action(state => {
        this.data.visible = state;
    });

    get isLoading() {
        return this.data.loading;
    };

    get showUploadDialog() {
        return this.data.show_upload_dialog;
    };

    setShowUploadDialog = action(state => {
        this.data.show_upload_dialog = state;
    });

    get isUploading() {
        return this.data.is_uploading;
    };

    //endregion

    //region fetch, refresh
    fetch = more => {
        if(this.data.loading)
            return;
        const perPage = 30;
        if(more) {
            if(this.list.length >= this.data.total)
                return;
            this.data.current_page++;
        }
        else {
            this.data.current_page = 1;
        }
        this.data.loading = true;
        this.post({
            category: 'general',
            alias: 'fetch_list',
            working_dir: this.data.working_dir,
            page: this.data.current_page,
            per_page: perPage
        })
            .then(({data}) => {
                this.data.total = data.total;
                data = data.items.map(item => {
                    item['selected'] = false;
                    return item;
                });
                const newFolders = data.filter(item => item.is_dir === true);
                const newFiles = data.filter(item => item.is_dir === false);
                if(more) {
                    this.data.folders = this.data.folders.concat(newFolders);
                    this.data.files = this.data.files.concat(newFiles);
                }
                else {
                    this.data.folders = newFolders;
                    this.data.files = newFiles;
                }
                this.data.loading = false;
            })
            .catch(err => {
                try {
                    message.error(err.response.data.message);
                }catch (e) {console.log(e);}
                this.data.loading = false;
            });
    };

    refresh = () => {
        this.fetch()
    };
    //endregion

    post = data => {
        return axios.post(this.data.server, data,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
    };

    selectDir = action(index => {
        const new_dir = [];
        this.workingDir.split('/').forEach((x, i) => {
            if (i <= index)
                new_dir.push(x);
        });
        this.setWorkingDir(new_dir.join('/') + '/');
        this.fetch();
    });

    select = action((item, e) => {
        if (!e.ctrlKey) {
            let i;
            for (i = this.data.folders.length - 1; i >= 0; i--) {
                this.data.folders[i].selected = false;
            }
            for (i = this.data.files.length - 1; i >= 0; i--) {
                this.data.files[i].selected = false;
            }
        }

        if (item.is_dir) {
            item = this.data.folders.find(x => x === item);
        } else {
            item = this.data.files.find(x => x === item);
        }

        item.selected = e.ctrlKey ? !item.selected : true;
    });

    get selectedItems() {
        return this.list.filter(item => item.selected);
    };

    clickAction = action(item => {
        if (item.is_dir) {
            this.setWorkingDir(this.data.working_dir + item.basename + '/');
            this.fetch();
        }
        else {
            this.plugin.category = 'general';
            this.plugin.alias = 'file_info';
            this.plugin.component = this.plugins.file_info.component;
            this.plugin_data.file_info.file = item;
        }
    });

    trash = action(() => {
        const items = [];
        this.data.folders.forEach(folder => {
            if (folder.selected)
                items.push(folder.basename);
        });
        this.data.files.forEach(file => {
            if (file.selected)
                items.push(file.basename);
        });
        if (!items.length) {
            message.info('No file selected');
            return;
        }
        this.post({
            category: 'general',
            alias: 'delete',
            working_dir: this.data.working_dir,
            payload: {items}
        })
            .then(({data}) => {
                message.success(data.message);
                this.fetch();
            })
            .catch(err => {
                message.error(err.response.data.message);
            });
    });
}