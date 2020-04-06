/**
 * Creates a log message about deleting the given entry with its recycle time.
 * @param {string} entryType The type of the entry. For example file or folder.
 * @param {object} entry Google Drive file/folder entry object.
 */
function logDeletion(entryType, entry) {
  Logger.log("Deleting " + entryType + " '" + GetPath(entry) + "'\n last modified " + entry.getLastUpdated().toLocaleString());
}