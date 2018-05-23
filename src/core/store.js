import React from 'react'
import {observable, computed, action} from 'mobx'

import message from 'antd/lib/message';

require("antd/lib/message/style");

import NewDirectory from "./general/new_dir/index";

import axios from 'axios'
import NewFile from "./general/new_file/index";
import Uploader from "./general/upload/index";
import Copy from "./general/copy/index";
import Move from "./general/move/index";
import Rename from "./general/rename/index";
import FileInfo from "./general/file-info/index";
import FM from "./fm";
import {remove_duplicate_slash} from "./Helper";
import {audio, image, video} from "./file_types";

require('antd/lib/message/style');

const FILTERS = ["image", "video", "dir", "icon"];

export default class FMStore {
  config = observable({
    mount_point: null,
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
      },
      item_in_action: null,
    },
    //all the core information
    data: {
      total: 0,
      current_page: 1,
      files: [],
      folders: [],
      filters: [],
      headers: {},
      http_params: {},
      server: "",
      working_dir: "/",
      loading: false,
      visible: false,
      is_uploading: false,
      filter_type: null,
      callback: e => console.log(e)
    },
    //action menu buttons
    action_menu: {},
    //context menu items
    context_menu: [],
    //tab panels
    tabs: [
      {
        title: 'Local Files',
        component: FM,
        hook: 'local',
        categories: ['image', 'video', 'dir']
      }
    ],
    filter_types: {
      null: {title: "All", types: []},
      image: {title: null, icon: "picture", types: image},
      audio: {title: null, icon: "sound", types: audio},
      video: {title: null, icon: "video-camera", types: video}
    }
  });

  openFileManager = action((cb, config) => {
    this.setCallback(cb);
    this.setConfig(config);
    this.visible = true;
  });

  closeFileManager = action(() => {
    this.setCallback(e=>{console.log(e)});
    this.visible = false;
    this.config.data.folders.forEach(folder=>{
      folder.selected = false;
    });
    this.config.data.files.forEach(file=>{
      file.selected = false;
    });
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

      //ad context menu
      plugin[hook].context_menu && this.config.context_menu.push(plugin[hook].context_menu);

      //add the tab entry
      plugin[hook].tab && this.config.tabs.push({
        title: [<span key="title">{plugin[hook].tab}</span>],
        component: plugin[hook].component,
        categories: plugin[hook].categories,
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
      try {
        const plugin = this.config.plugins[alias];
        this.config.plugin.component = plugin.component;
        this.config.plugin.alias = alias;
        this.config.plugin.plugin = plugin.plugin;
        this.config.plugin.key = Math.random();
      }catch(e) {console.log(e)}
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

  set server(server) {
    this.config.data.server = server;
  };

  set mount_point(dom_el) {
    this.config.mount_point = dom_el;
  };

  setCallback = callback => {
    this.config.data.callback = callback;
  };

  setConfig = (config) => {
    if(!config)
    {
      this.config.data.filters = FILTERS.filter(filter=>filter!=="icon");
    }
    else {
      this.config.data.filters = config.filters.split(',').filter(filter => FILTERS.indexOf(filter) >= 0);
      this.config.data.headers = config.headers || {};
      this.config.data.http_params = config.http_params || {};
    }
  };

  //set currently working directory
  set working_dir(dir){
    this.config.data.folders = [];
    this.config.data.files = [];
    this.config.data.total = 0;
    this.config.data.current_page = 1;
    this.config.data.working_dir = remove_duplicate_slash('/' + dir);
    //TODO: Attach event to clear up plugin data
    this.config.plugin_data.search.query = '';
    this.config.plugin_data.search.dataSource = [];
    this.fetch();
  };

  set visible(state) {
    this.config.data.visible = state;
  };

  set filter_type(filter_type) {
    this.config.data.filter_type = filter_type;
  }

  set item_in_action(item) {
    this.config.plugin_data.item_in_action = item;
  };

  //endregion

  //region Config getters

  //callback
  get callback() {
    return this.config.data.callback;
  }

  get mount_point() {
    return () => this.config.mount_point;
  }

  //all core information
  get data() {
    return this.config.data;
  }

  //action menu buttons
  get action_menu() {
    return this.config.action_menu;
  }

  //context menu items
  get context_menu() {
    return this.config.context_menu;
  }

  //tabs list
  get tabs() {
    return this.config.tabs.filter(tab=>{
      return this.config.data.filters.find(filter=> tab.categories.indexOf(filter) >= 0);
    });
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

  //get the filter types
  get filter_types() {
    return this.config.filter_types;
  }

  //get the filter identity
  get filter_type() {
    return this.config.data.filter_type;
  }

  //all items list
  get list() {
    const types = this.filter_types[this.filter_type].types;
    return this.config.data.folders.concat(this.config.data.files.filter(file=>{
      return !types.length || types.indexOf(file.extension.toLowerCase()) >= 0;
    }));
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

  //is uploading something
  get is_uploading() {
    return this.config.data.is_uploading;
  };

  //get selected items
  get selected_items() {
    return this.list.filter(item => item.selected);
  };

  // get the item selected for action
  get item_in_action() {
    return this.config.plugin_data.item_in_action;
  }

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
    const headers = Object.assign({
      'Content-Type': 'application/x-www-form-urlencoded'
    }, this.config.data.headers);

    data = Object.assign(data, this.config.data.http_params);

    return axios.post(this.config.data.server, data, {headers});
  };

  //sends a GET request to the server
  httpGet = url => {
    const headers = Object.assign({
      'Content-Type': 'application/x-www-form-urlencoded'
    }, this.config.data.headers);
    if(url.indexOf("?") >= 0)
      url += "&";
    else
      url+= "?";
    url+= Object.keys(this.config.data.http_params).map(key=>{
      return key + "=" + this.config.data.http_params[key];
    }).join("&");
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
}