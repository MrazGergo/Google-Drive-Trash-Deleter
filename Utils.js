/**
 * Creates a log message about deleting the given entry with its recycle time.
 * @param {object} entry Google Drive entry object.
 */
function logDeletion(entry) {

  const entryType = getEntryType(entry);
  const path = GetPath(entry);
  const lastModified = entry.getLastUpdated().toLocaleString();

  Logger.log("Deleting " + entryType + " '" + path + "'\nlast modified " + lastModified);
}

/**
 * Gets the type of the entry in a readable form.
 * @param {object} entry A Google Drive entry object.
 * @returns {string} "folder" if the entry is a folder, otherwise "file".
 */
function getEntryType(entry) {

  //File entry does not have getFiles function...
  if (entry.getFiles == undefined) {
    return "file";
  }
  else {
    return "folder";
  }
}

/**
 * Deletes entries which were deleted before the limitDateTime
 * @param {object} entryIterator A FolderIterator or a FileIterator, preferably from the getTrashedFolders() or getTrashedFiles() function.
 * @param {Date} limitDateTime Entries will be deleted which were thrashed before this date and time.
 */
function deleteOldEntries(entryIterator, limitDateTime) {

  const defaultEntryTypeValue = "(entryType)";
  let entryType = defaultEntryTypeValue;
  let entriesToDelete = [];
  while (entryIterator.hasNext()) {

    try {
      let entry = entryIterator.next();
  
      if (entryType == defaultEntryTypeValue) {
        entryType = getEntryType(entry);
      }
  
      let lastUpdated = entry.getLastUpdated();
      let trashedParent = hasTrashedParent(entry.getParents());
  
      //If not trashed old enough or this entry is in a trashed folder, then do not delete it.
      //If you trash a folder, the lastUpdated property only updates for the trashed folder and not for its contents
      //If you trash a folder, then its contents may be deleted at the next run of this script, because they were modified a long time ago.
      if (!(lastUpdated >= limitDateTime || trashedParent != null)) {
        entriesToDelete.push(entry);
      }
    }
    catch(e) {
        Logger.log(`Error while processing ${entryType}:\n${e}`)
    }
  }

  Logger.log(`${entriesToDelete.length} ${entryType}s marked for deletion.`)

  for (let i = 0; i < entriesToDelete.length; i++) {
    try {
      let entry = entriesToDelete[i];
      logDeletion(entry);
      Drive.Files.remove(entry.getId());
    }
    catch (e) {
      Logger.log("Error while processing " + entryType + " '" + entry.getName() + "'\nReason: " + e);
    }
    finally {
      Logger.log("-----------------------------------------------------------------------");
    }
  }
}