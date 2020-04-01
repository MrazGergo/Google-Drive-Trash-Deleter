/**
 * Logs the message with console.log() and Logger.log().
 * @param {string} message Message to log.
 */
function logToBoth(message) {
  console.log(message);
  Logger.log(message);
}

/**
 * Creates a log message about deleting the given entry with its recycle time.
 * @param {string} entryType The type of the entry. For example file or folder.
 * @param {object} entry Google Drive file/folder entry object.
 */
function logDeletion(entryType, entry) {
  logToBoth("Deleting " + entryType + " '" + GetPath(entry) + "', last modified " + entry.getLastUpdated().toLocaleString());
}