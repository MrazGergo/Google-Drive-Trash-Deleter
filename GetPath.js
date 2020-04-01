/**
 * Generates the full path of the entry.
 * @param {object} entry Google Drive file/folder object.
 * @returns {string} The full path of the entry.
 */
function GetPath(entry) {
  const entryName = entry.getName();
  console.log("Getting path of " + entryName + " start");

  var path = [entryName];

  try {

    var parent = entry.getParents();

    while ((parent = hasParent(parent)) != null) {

      console.log("[3] Parent: " + parent);

      //Unshift a tömb elejére szúrja be.
      path.unshift(parent.getName());
      console.log("[4] Path: " + path);

      parent = parent.getParents();
      if (!parent) {
        console.log("[5] Parent: " + parent);
      }
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
  var hasParent = parents.hasNext();

  console.log("[1] Has parent: " + hasParent);

  if (!hasParent)
    return null;

  var parent = parents.next(),
    parentIsTrashed = parent.isTrashed();

  console.log("[2] Parent is trashed: " + parentIsTrashed);

  if (parentIsTrashed)
    return parent;

  return null;
}

// ---------------------------------------------------------------------------------------------------
//parents: File/FolderIterator
//kimenet: a következő eleme az iterátornak, ha van. Egyébként null.
//Ez a függvény azért létezik, hogy könnyedén ki lehessen cserélni a hasTrashedParent függvényt.
/**
 * Returns the first parent.
 * @param {FolderIterator} parents The FolderIterator which you can get with the getParents() function.
 * @returns {Object} The first parent object. If there is none, returns null.
 */
function hasParent(parents) {
  var hasParent = parents.hasNext();

  console.log("[1] Has parent: " + hasParent);

  if (hasParent) {
    return parents.next();
  } else {
    return null;
  }
}