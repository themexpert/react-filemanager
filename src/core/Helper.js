import message from "antd/lib/message/index";

export function viewport(doc) {
  const d = doc || document,
    e = d.documentElement,
    g = d.body,
    x = e.clientWidth || g.clientWidth,
    y = e.clientHeight|| g.clientHeight;
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

