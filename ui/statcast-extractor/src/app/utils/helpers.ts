export const isEmpty = (obj) => {
    if(!obj) return true;
    return Object.keys(obj).length === 0;
  }

  export const  getUniqueListBy = (arr, key) => {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}