/**
 * Creates a log message about deleting the given entry with its recycle time.
 * @param {object} entry Google Drive entry object.
 */
function logDeletion(entry) {

  const entryType = getEntryType(entry);
  Logger.log("Deleting " + entryType + " '" + GetPath(entry) + "'\n\tlast modified " + entry.getLastUpdated().toLocaleString());
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

  while (entryIterator.hasNext()) {

    let separatorNeeded = false;
    let entry;

    try {
      entry = entryIterator.next();

      let lastUpdated = entry.getLastUpdated();
      let trashedParent = hasTrashedParent(entry.getParents());

      //If not trashed old enough or this entry is in a trashed folder, then do not delete it.
      //If you trash a folder, the lastUpdated property only updates for the trashed folder and not for its contents
      //If you trash a folder, then its contents may be deleted at the next run of this script, because they were modified a long time ago.
      if (lastUpdated >= limitDateTime || trashedParent != null) {
        continue;
      }

      //Separator only needed when something was written.
      separatorNeeded = true;

      logDeletion(entry);
      Drive.Files.remove(entry.getId());
    }
    catch (e) {
      var entryType = getEntryType(entry);
      Logger.log("Error while processing " + entryType + " '" + entry.getName() + "'\nReason: " + e);
    }
    finally {
      if (separatorNeeded) {
        separatorNeeded = false;
        Logger.log("-----------------------------------------------------------------------");
      }
    }
  }
}