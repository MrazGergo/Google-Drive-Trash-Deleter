function DeleteTrashEvent() {

  const scriptProperties = PropertiesService.getScriptProperties();

  try {
    const limitDate = new Date(),
      subDays = scriptProperties.getProperty("DeleteOlderThanDays");

    //Separator only needed when something was written was written.
    let separatorNeeded = false;

    if (isNaN(parseInt(subDays))) {
      Logger.log("subDays is not a valid integer! (" + subDays + ")");
      return;
    }

    //Subtracting days from the current date
    limitDate.setDate(limitDate.getDate() - subDays);

    const startMessage = "Deleting files and folders that were trashed before " + limitDate.toLocaleString();
    Logger.log(startMessage);

    //Deleting folders first, because it also deletes the folder's content (including files), so it runs much faster.
    Logger.log("Folders:\n");
    let folders = DriveApp.getTrashedFolders();
    while (folders.hasNext()) {
      try {
        let folder = folders.next();

        if (folder.getLastUpdated() >= limitDate) {
          continue;
        }

        let parentFolder = null;
        let deletableFolderFound = false;

        //Searching for parent folder wich were deleted before the limit date
        while ((parentFolder = hasTrashedParent(folder.getParents())) != null) {

          if (parentFolder.getLastUpdated() < limitDate) {
            folder = parentFolder;
            deletableFolderFound = true;
          }
          else {
            break;
          }
        }

        if (deletableFolderFound) {
          //If a suitable parent folder was found, this line will delete the parent folder's subfolders from the iterator, which were deleted with the parent folder.
          folders = DriveApp.getTrashedFolders();
        }

        separatorNeeded = true;

        logDeletion("folder", folder);
        Drive.Files.remove(folder.getId());
      }
      catch (e) {
        Logger.log("Error while processing folder '" + folder.getName() + "'\nReason: " + e);
      }
      finally {
        if (separatorNeeded) {
          separatorNeeded = false;
          console.log("-----------------------------------------------------------------------");
        }
      }
    }

    Logger.log("Files:\n");

    //Deleting files
    const files = DriveApp.getTrashedFiles();
    while (files.hasNext()) {
      try {
        let file = files.next();

        if (file.getLastUpdated() >= limitDate) {
          continue;
        }

        separatorNeeded = true;

        logDeletion("file", file);
        Drive.Files.remove(file.getId());
      }
      catch (e) {
        Logger.log("Error while processing file '" + file.getName() + "'\nReason: " + e);
      }
      finally {
        if (separatorNeeded) {
          separatorNeeded = false;
          console.log("-----------------------------------------------------------------------");
        }
      }
    }
  }
  catch (e) {
    Logger.log("Error while executing:\n" + e);
  }
  finally {
    try {
      const sendEmailTxt = scriptProperties.getProperty("SendEmail").toLowerCase(),
        sendEmailBool = (sendEmailTxt === "true"),
        emailAddress = scriptProperties.getProperty("EmailAddress"),
        emailSubject = scriptProperties.getProperty("EmailSubject");

      console.log("sendEmailTxt: " + sendEmailTxt + " type: " + typeof (sendEmailTxt));
      console.log("sendEmailBool: " + sendEmailBool + " type: " + typeof (sendEmailBool));
      console.log("emailAddress: " + emailAddress + " type: " + typeof (emailAddress));
      console.log("emailSubject: " + emailSubject + " type: " + typeof (emailSubject));

      if (sendEmailBool) {
        GmailApp.sendEmail(emailAddress, emailSubject, Logger.getLog());
        console.log("Email sent");
      }
    }
    catch (e) {
      console.log("Error while sending email.\nReason: " + e);
    }
  }
}