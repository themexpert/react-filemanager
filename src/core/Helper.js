import message from "antd/lib/message/index";

export function viewport() {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  return {
    width: x,
    height: y
  };
}


//remove duplicate slashes from the directory
export function remove_duplicate_slash (str ) {
  let clean = '';
  let ls = false;
  for (let i = 0; i < str.length; i++) {
    if ((str[i] === '/' && !ls) || str[i] !== '/')
      clean += str[i];
    ls = str[i] === '/';
  }
  return clean;
}

export function showErrorMessage (msg) {
  message.info(msg, 4);
}

