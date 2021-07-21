const done = {};

/**
 * Returns the elements of the iterable as an array
 */
export async function iterableToArray(iterable) {
  const items = [];
  for await (const item of iterable)
    items.push(item);
  return items;
}

/**
 * Gets the first element of the iterable.
 */
export function getFirstItem(iterable) {
  const iterator = iterable[Symbol.asyncIterator]();
  return iterator.next().then(item => item.value);
}

/**
 * Gets the first or the default element of the iterable.
 */
export async function getFirstOrDefaultItem(iterable, defaultLanguage) {
  const iterator = iterable[Symbol.asyncIterator]();
  let returnItem = await iterator.next();

  let item = returnItem;
  while (!item.done) {
    item = await iterator.next();
    const itemLanguage = item.value?.language?.toString();
    if (defaultLanguage && itemLanguage === defaultLanguage)
      returnItem = item;
  }

  return returnItem.value;
}

/**
 * Creates an async iterator with the item as only element.
 */
export function iteratorFor(item) {
  return {
    async next() {
      if (item !== done) {
        const value = await item;
        item = done;
        return { value };
      }
      return { done: true };
    },
  };
}
