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


export default class FMStore {
  config = observable({
    //components and hard coded core data
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
    //current plugin on modal
    plugin: {
      component: null,
      alias: null,
      plugin: null,
      key: Math.random()
    },
    //core plugins data
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
    //all the core information
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
    //action menu buttons
    action_menu: {},
    //tab panels
    tabs: [
      {
        title: 'Local Files',
        component: FM,
        hook: 'local'
      }
    ]
  });

  //region Plugins

  //register a plugin to the core
  registerPlugin = action((plugin, config) =>{
    Object.keys(plugin).forEach(hook=>{

      //check if we have a component under the hook
      if(!plugin[hook].component)
      {
        console.log(`No valid component found in the registered plugin for hook ${hook}`);
        return;
      }

      //add the component entry to the plugins list
      this.config.plugins[hook] = {
        component: plugin[hook].component,
        config: config || {}
      };

      //add the action menu
      plugin[hook].action_menu && (this.config.action_menu[hook] = plugin[hook].action_menu);

      //add the tab entry
      plugin[hook].tab && this.config.tabs.push({
        title: [<span key="title">{plugin[hook].tab}</span>,
          <Badge key="badge" status="processing"/>],
        component: plugin[hook].component,
        hook
      });
    });
  });

  //select plugin for modal plugin
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

  //removes the modal data
  clearPlugin = action(() => {
    setTimeout(() => {
      this.config.plugin.component = null;
      this.config.plugin.alias = null;
      this.config.plugin.plugin = null;
    }, 1000);
  });

  //get plugin config
  PluginConfig = action(hook => {
    if (!hook)
      return {};
    if (!this.config.plugins[hook])
      return {};
    return this.config.plugins[hook].config;
  });
  //endregion

  //region Config Setter

  setServer = action(server => {
    this.config.data.server = server;
  });

  setCallback = action((callback, config = {}) => {
    this.config.data.callback = callback;
    //TODO: setup
  });

  //set currently working directory
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

  setVisible = action(state => {
    this.config.data.visible = state;
  });


  setShowUploadDialog = action(state => {
    this.config.data.show_upload_dialog = state;
  });

  //endregion

  //region Config getters

  //all core information
  get data() {
    return this.config.data;
  }

  //action menu buttons
  get action_menu() {
    return this.config.action_menu;
  }

  //tabs list
  get tabs() {
    return this.config.tabs;
  }

  //currently executing modal plugin data
  get plugin_data() {
    return this.config.plugin_data;
  }

  //all the plugins
  get plugins() {
    return this.config.plugins;
  }

  //currently executing modal plugin
  get plugin() {
    return this.config.plugin;
  }

  //all items list
  get list() {
    return this.config.data.folders.concat(this.config.data.files);
  };

  //server URL
  get server() {
    return this.config.data.server;
  };

  //get currently working directory
  get working_dir() {
    return this.config.data.working_dir;
  };

  //file manager visible or not
  get is_visible() {
    return this.config.data.visible;
  };

  //if network functions working
  get is_loading() {
    return this.config.data.loading;
  };

  //is upload dialog shown
  get show_upload_dialog() {
    return this.config.data.show_upload_dialog;
  };

  //is uploading something
  get is_uploading() {
    return this.config.data.is_uploading;
  };

  //get selected items
  get selected_items() {
    return this.list.filter(item => item.selected);
  };

  //endregion

  //region Context Menu

  //context menu for directory scope
  get contextMenu() {
    return (<ul>
      <li>Hello</li>
      <li>World</li>
    </ul>);
  };

  //context menu for item scope
  get itemContextMenu() {

  };

  //endregion

  //region Http

  //make a request to the server
  Request = action((plugin, alias, payload) => {
    return this.httpPost({
      plugin: plugin,
      alias: alias,
      working_dir: this.config.data.working_dir,
      payload
    });
  });

  //fetch the list of files and folders for current directory
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
    this.httpPost({
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

  //reload files and folders
  refresh = () => {
    this.fetch()
  };

  //sends a POST request to the server
  httpPost = data => {
    return axios.post(this.config.data.server, data,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
  };

  //sends a GET request to the server
  httpGet = (url, headers) => {
    if (!headers) headers = {};
    return axios.get(url, {headers});
  };


  //delete selected items
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
    this.httpPost({
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

  //endregion

  //region Helper functions

  //show error message for 4 seconds
  showErrorMessage = msg => {
    message.info(msg, 4);
  };

  //remove duplicate slashes from the directory
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

  //region Action

  //run the callback with the result
  runCallback = action(item => {
    let selection = [];
    if (item && !item.is_dir) {
      selection.push(item);
    }
    else {
      selection = this.list.filter(item => item.selected);
      const has_dir = selection.filter(item => item.is_dir);
      if (has_dir.length) {
        message.warning("You can select files only.");
        return;
      }
    }
    const result = selection.map(item => {
      return this.remove_duplicate_slash(this.working_dir + '/' + item.basename);
    });
    if (this.config.data.callback.call(this, result)) {
      this.setVisible(false);
    }
  });
  //select a directory from the breadcrumb
  selectDir = action(index => {
    const new_dir = [];
    this.working_dir.split('/').forEach((x, i) => {
      if (i <= index)
        new_dir.push(x);
    });
    this.setWorkingDir(new_dir.join('/') + '/');
    this.fetch();
  });

  //select an item
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

  //what happens on double click on an item
  clickAction = action(item => {
    if (item.is_dir) {
      this.setWorkingDir(this.config.data.working_dir + item.basename + '/');
      this.fetch();
    }
    else {
      return this.runCallback(item);
      //TODO: preview
      this.config.plugin.plugin = 'General';
      this.config.plugin.alias = 'file_info';
      this.config.plugin.component = this.config.plugins.file_info.component;
      this.config.plugin_data.file_info.file = item;
    }
  });

  //endregion
}