React based file and media manager developed for [Quix Page Builder](https://www.themexpert.com/quix-pagebuilder) and open sourced by [ThemeXpert](https://www.themexpert.com) team.

## Dependency
We've written a PHP library to handle all server side things. You need to include this to your project using composer. More information https://github.com/themexpert/react-filemanager-server

## Usage

`yarn add @themexpert/react-filemanager`

`npm -i @themexpert/react-filemanager`

Webpack rules
```JS

        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    loader: 'babel?stage=0',
                    include: [].concat(your_project_dirs, [fs.realpathSync(path.resolve(__dirname, './node_modules/@themexpert/react-filemanager/'))])
                }

            ]
        }
 ```

```JS
import initFM from 'react-filemanager';

const openFileManager = initFM('server_endpoint');
// or
const openFileManager = initFM('server_endpoint', DOMElement);
```

The returned callback `openFileManager` accepts a `callback` as first parameter to show the file manager modal and an object config as second parameter.

In this way, you won't have to instantiate FileManager seperately for different config

```html

const config  = {
                    //add filters, valid filters are [icon,image,video,dir]
                    //currently filters only filters the plugins, not the items
                    filters: "image,icon",

                    //add additional http get/post parameters
                    http_params: {
                        foo: "bar"
                    },

                    //add additional headers
                    headers: {
                        foo: "bar"
                    }
                };

<button onclick="openFileManager(fileSelectCallback, config)">Open File Manager</button> 
```
```JS
function fileSelectCallback(selection) {
    console.log(selection);
    return true; //close the modal
}
```


It's a good idea to make a wrapper to instantiate the file manager and the using it elsewhere

File: `wrapper.js`

Content: 
```JS
import initFM from 'react-filemanager'

export default initFM('server-endpoint');
```

Use the wrapper in any React component

```JS
import React, {Component} from 'react'
import openFileManager from './wrapper' //wherever it is

const config  = {
                    //add filters, valid filters are [icon,image,video,dir]
                    filters: "image,icon",

                    //add additional http get/post parameters
                    http_params: {
                        foo: "bar"
                    },

                    //add additional headers
                    headers: {
                        foo: "bar"
                    }
                };

export default class FilePicker extends Component {
    constructor(props) {
        super(props);
    }
    
    onFileSelect = selection => {
    
        console.log(selection);
        
        return true; //closes the file manager modal
    };
    
    render = () => {
        return (
            <button onClick={openFileManager(this.onFileSelect, config)}>Pick File</button>
        );
    };
}


```
