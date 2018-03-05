import React from 'react'
import {observable, computed, action} from 'mobx'

import message from 'antd/lib/message'
import Badge from "antd/lib/badge";

require("antd/lib/message/style");
require("antd/lib/badge/style");

import NewDirectory from "./general/new_dir/index";

import axios from 'axios'
import NewFile from "./general/new_file/index";
import Uploader from "./general/upload/index";
import Copy from "./general/copy/index";
import Move from "./general/move/index";
import Rename from "./general/rename/index";
import FileInfo from "./general/file-info/index";
import FM from "./fm";

require('antd/lib/message/style');

let PluginRegistry;

export default class FMStore {
    config = observable({
        plugins: {
            new_dir: {
                plugin: 'General',
                component: NewDirectory
            },
            new_file: {
                plugin: 'General',
                component: NewFile
            },
            upload: {
                plugin: 'General',
                component: Uploader
            },
            copy: {
                plugin: 'General',
                component: Copy
            },
            move: {
                plugin: 'General',
                component: Move
            },
            rename: {
                plugin: 'General',
                component: Rename
            },
            file_info: {
                plugin: 'General',
                component: FileInfo
            }
        },
        plugin: {
            component: null,
            alias: null,
            plugin: null,
            key: Math.random()
        },
        plugin_data: {
            search: {
                dataSet: [],
                dataSource: [],
                query: ''
            },
            file_info: {
                file: null
            }
        },
        data: {
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
        },
        action_menu: {},
        tabs: [
            {
                title: 'Local Files',
                component: FM,
                hook: 'local'
            }
        ]
    });

    get pluginData() {
        return this.config.plugin_data;
    }

    get Plugins() {
        return this.config.plugins;
    }

    get Plugin() {
        return this.config.plugin;
    }

    PluginConfig = action(plugin => {
        if (!plugin)
            return {};
        if (!this.config.plugins[plugin])
            return {};
        return this.config.plugins[plugin].config;
    });

    get Data() {
        return this.config.data;
    }

    get actionMenu() {
        return this.config.action_menu;
    }

    get Tabs() {
        return this.config.tabs;
    }


    get contextMenu() {
        return (<ul>
            <li>Hello</li>
            <li>World</li>
        </ul>);
    };

    get itemContextMenu() {

    };

    loadPlugins = action(() => {
        System.import(/* webpackChunkName: "dist/PluginRegistry" */ '../plugins/PluginRegistry').then(pluginRegistry => {
            PluginRegistry = pluginRegistry.PluginRegistry;
            this.loadPluginsFromServer();
        }).catch(err => console.log(err));
    });

    loadPluginsFromServer = () => {
        this.post({plugins: true})
            .then(({data}) => {
                const plugins = data;
                Object.keys(plugins).forEach(plugin => {
                    if (plugin === 'General')
                        return;

                    //load plugins
                    Object.keys(plugins[plugin].methods).forEach(hook => {
                        const plugin_config = plugins[plugin].methods[hook];
                        if (plugin_config.component === undefined)
                            return;
                        this.config.plugins[hook] = {
                            plugin: plugin,
                            component: PluginRegistry.load(plugin_config.component, hook, this.attachComponent),
                            config: plugin_config.config || {}
                        };
                    });

                    //load buttons
                    Object.keys(plugins[plugin].actions).forEach(hook => {
                        this.config.action_menu[hook] = plugins[plugin].actions[hook];
                    });

                    //load tabs
                    Object.keys(plugins[plugin].tabs).forEach(hook => {
                        this.config.tabs.push({
                            title: [<span key="title">{plugins[plugin].tabs[hook]}</span>,
                                <Badge key="badge" status="processing"/>],
                            component: 'Loading...',
                            hook
                        });
                    });
                });
            })
            .catch(err => {
                try {
                    message.error(err.response.data.message);
                } catch (e) {
                    console.log(e, err);
                }
            });
    };

    attachComponent = (hook, component) => {
        this.config.plugins[hook].component = component;
        this.config.tabs.forEach(tab => {
            if (hook === tab.hook)
                tab.component = component;
        });
    };

    selectPlugin = action(alias => {
        return () => {
            if (this.config.plugins[alias] == null) {
                message.error('The requested plugin is not installed.');
                return;
            }
            const plugin = this.config.plugins[alias];
            this.config.plugin.component = plugin.component;
            this.config.plugin.alias = alias;
            this.config.plugin.plugin = plugin.plugin;
            this.config.plugin.key = Math.random();
        };
    });

    clearPlugin = action(() => {
        setTimeout(() => {
            this.config.plugin.component = null;
            this.config.plugin.alias = null;
            this.config.plugin.plugin = null;
        }, 1000);
    });

    Request = action((payload, alias) => {
        return this.post({
            plugin: alias ? this.Plugins[alias].plugin : this.Plugin.plugin,
            alias: alias ? alias : this.Plugin.alias,
            working_dir: this.config.data.working_dir,
            payload
        });
    });

    showErrorMessage = msg => {
        message.info(msg, 4);
    };

    get list() {
        return this.config.data.folders.concat(this.config.data.files);
    };

    //region server { server, setServer }
    setServer = action(server => {
        this.config.data.server = server;
    });

    get server() {
        return this.config.data.server;
    };

    //endregion

    //region callback { setCallback, callback }
    setCallback = action(callback => {
        this.config.data.callback = callback;
    });

    runCallback = action(e => {
        const selection = this.list.filter(item => item.selected);
        const has_dir = selection.filter(item => item.is_dir);
        if (has_dir.length) {
            message.warning("You can select files only.");
            return;
        }
        const result = selection.map(item => {
            return this.remove_duplicate_slash(this.workingDir + '/' + item.basename);
        });
        if (this.config.data.callback.call(this, result)) {
            this.setVisible(false);
        }
    });
    //endregion

    //region working_dir { workingDir, setWorkingDir }
    setWorkingDir = action(dir => {
        this.config.data.folders = [];
        this.config.data.files = [];
        this.config.data.total = 0;
        this.config.data.current_page = 1;
        this.config.data.working_dir = this.remove_duplicate_slash('/' + dir);
        //TODO: Attach event to clear up plugin data
        this.config.plugin_data.search.query = '';
        this.config.plugin_data.search.dataSource = [];
        this.fetch();
    });

    get workingDir() {
        return this.config.data.working_dir;
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
        return this.config.data.visible;
    };

    setVisible = action(state => {
        this.config.data.visible = state;
    });

    get isLoading() {
        return this.config.data.loading;
    };

    get showUploadDialog() {
        return this.config.data.show_upload_dialog;
    };

    setShowUploadDialog = action(state => {
        this.config.data.show_upload_dialog = state;
    });

    get isUploading() {
        return this.config.data.is_uploading;
    };

    //endregion

    //region fetch, refresh
    fetch = more => {
        if (this.config.data.loading)
            return;
        const perPage = 30;
        if (more) {
            if (this.list.length >= this.config.data.total)
                return;
            this.config.data.current_page++;
        }
        else {
            this.config.data.current_page = 1;
        }
        this.config.data.loading = true;
        this.post({
            plugin: 'General',
            alias: 'fetch_list',
            working_dir: this.config.data.working_dir,
            page: this.config.data.current_page,
            per_page: perPage
        })
            .then(({data}) => {
                this.config.data.total = data.total;
                data = data.items.map(item => {
                    item['selected'] = false;
                    return item;
                });
                const newFolders = data.filter(item => item.is_dir === true);
                const newFiles = data.filter(item => item.is_dir === false);
                if (more) {
                    this.config.data.folders = this.config.data.folders.concat(newFolders);
                    this.config.data.files = this.config.data.files.concat(newFiles);
                }
                else {
                    this.config.data.folders = newFolders;
                    this.config.data.files = newFiles;
                }
                this.config.data.loading = false;
            })
            .catch(err => {
                try {
                    message.error(err.response.data.message);
                } catch (e) {
                    console.log(e);
                }
                this.config.data.loading = false;
            });
    };

    refresh = () => {
        this.fetch()
    };
    //endregion

    post = data => {
        return axios.post(this.config.data.server, data,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
    };

    httpGet = (url, headers) => {
        if (!headers) headers = {};
        return axios.get(url, {headers});
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
            for (i = this.config.data.folders.length - 1; i >= 0; i--) {
                this.config.data.folders[i].selected = false;
            }
            for (i = this.config.data.files.length - 1; i >= 0; i--) {
                this.config.data.files[i].selected = false;
            }
        }

        if (item.is_dir) {
            item = this.config.data.folders.find(x => x === item);
        } else {
            item = this.config.data.files.find(x => x === item);
        }

        item.selected = e.ctrlKey ? !item.selected : true;
    });

    get selectedItems() {
        return this.list.filter(item => item.selected);
    };

    clickAction = action(item => {
        if (item.is_dir) {
            this.setWorkingDir(this.config.data.working_dir + item.basename + '/');
            this.fetch();
        }
        else {
            this.config.plugin.plugin = 'General';
            this.config.plugin.alias = 'file_info';
            this.config.plugin.component = this.config.plugins.file_info.component;
            this.config.plugin_data.file_info.file = item;
        }
    });

    trash = action(() => {
        const items = [];
        this.config.data.folders.forEach(folder => {
            if (folder.selected)
                items.push(folder.basename);
        });
        this.config.data.files.forEach(file => {
            if (file.selected)
                items.push(file.basename);
        });
        if (!items.length) {
            message.info('No file selected');
            return;
        }
        this.post({
            plugin: 'General',
            alias: 'delete',
            working_dir: this.config.data.working_dir,
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