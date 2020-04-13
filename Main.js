function DeleteTrashEvent() {

  const scriptProperties = PropertiesService.getScriptProperties();

  try {
    const limitDate = new Date(),
      subDays = scriptProperties.getProperty("DeleteOlderThanDays");

    if (isNaN(parseInt(subDays))) {
      Logger.log("subDays is not a valid integer! (" + subDays + ")");
      return;
    }

    //Subtracting days from the current date
    limitDate.setDate(limitDate.getDate() - subDays);

    const startMessage = "Deleting files and folders that were trashed before " + limitDate.toLocaleString();
    Logger.log(startMessage);

    //Deleting folders first, because it also deletes the folder's content (including files), so it runs much faster.
    Logger.log("\n\tFolders:\n");
    let folders = DriveApp.getTrashedFolders();
    deleteOldEntries(folders, limitDate);

    //Deleting files
    Logger.log("\n\tFiles:\n");
    const files = DriveApp.getTrashedFiles();
    deleteOldEntries(files, limitDate);
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