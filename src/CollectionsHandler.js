import { handler } from './utils';
// TODO: Handle non-list entities
export function listHandler() {
  return handler(async (_, path) => {
    let _path = await path;
    const list = [];
    while (`${_path}` !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil') {
      list.push(_path['http://www.w3.org/1999/02/22-rdf-syntax-ns#first']);
      _path = await _path['http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'];
    }
    return Promise.all(list);
  });
}

/**
 * @param {Boolean} set Emits set if True, array otherwise
 * @returns An RDF collection as an array or set
 */
export function containerHandler(set) {
  return handler(async (_, path) => {
    let container = [];
    let elem;
    let count = 0;
    // eslint-disable-next-line no-cond-assign
    while (elem = await path[`http://www.w3.org/1999/02/22-rdf-syntax-ns#_${++count}`])
      container.push(elem);

    container = await Promise.all(container);
    return set ? new Set(container) : container;
  });
}

// TODO: Discuass handling of setting values
export function collectionHandler() {
  return handler(async (pathData, path) => {
    // TODO: Handle cases where multiple classes may be present (e.g. if inferencing is on)
    switch (`${await path['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']}`) {
    case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#List':
      return listHandler().handle(pathData, path);
    case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag':
      return containerHandler(true).handle(pathData, path);
    case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Alt':
    case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Seq':
    case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Container':
      return containerHandler(false).handle(pathData, path);
    default:
      // In this case none of the appropriate containers apply
      return pathData.subject;
    }
  });
}
