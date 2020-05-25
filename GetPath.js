/**
 * Generates the full path of the parameter entry.
 * @param {object} entry Google Drive file/folder object.
 * @returns {string} The full path of the entry.
 */
function GetPath(entry) {
  const entryName = "'" + entry.getName() + "'";
  const logSeparator = ", ";
  console.log("Getting path of " + entryName + " start");

  let path = [entryName];

  try {

    let parent = entry.getParents();

    while ((parent = hasParent(parent)) != null) {
      let log = "";
      log += "[3] Parent: " + parent;

      //Unshift puts the element to the beginning of the array
      path.unshift(parent.getName());
      log += logSeparator + "[4] Path: " + path;

      parent = parent.getParents();
      if (!parent) {
        log += logSeparator + "[5] Parent: " + parent;
      }

      console.log(log);
    }

    path = path.join("/");
    console.log("[6] Total path: " + path);
  }
  catch (e) {
    console.log("Error while getting path of " + entryName + "\nError: " + e);
  }
  finally {
    console.log("Getting path of " + entryName + " end");
    return path;
  }
}

/**
 * Returns the first trashed parent.
 * @param {FolderIterator} parents The FolderIterator which you can get with the getParents() function.
 * @returns {Object} The first trashed parent object. If there is none, returns null.
 */
function hasTrashedParent(parents) {

  let log = "";
  try {
    let hasParent = parents.hasNext();

    log += "[1] Has parent: " + hasParent;

    if (!hasParent)
      return null;

    let parent = parents.next(),
      parentIsTrashed = parent.isTrashed();

    log += ", [2] Parent is trashed: " + parentIsTrashed;

    if (parentIsTrashed)
      return parent;

    return null;
  }
  finally {
    //console.log(log);
  }
}

/**
 * Returns the first parent.
 * @param {FolderIterator} parents The FolderIterator which you can get with the getParents() function.
 * @returns {Object} The first parent object. If there is none, returns null.
 */
function hasParent(parents) {
  let hasParent = parents.hasNext();

  //console.log("[1] Has parent: " + hasParent);

  if (hasParent) {
    return parents.next();
  } else {
    return null;
  }
}