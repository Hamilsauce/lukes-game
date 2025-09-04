export const twoPointerSearch = (collection, criteria) => {
  let left = 0;
  let right = collection.length - 1;
  
  while (left < right) {
    const curr = [collection[left], collection[right]]
    
    if (curr[0].Folder === criteria.targetName) {
      return {
        index: left,
        pointer: 'left',
        path: curr[0].FolderPath.join('\\')
      }
    }
    
    if (curr[1].Folder === criteria.targetName) {
      return {
        index: right,
        pointer: 'right',
        path: curr[1].FolderPath.join('\\')
      }
    }
    
    right--;
    left++;
  }
  return ['ploot'];
}