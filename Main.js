function DeleteTrashEvent() {

  try {
    const limitDate = new Date(),
      scriptProperties = PropertiesService.getScriptProperties(),
      subDays = scriptProperties.getProperty("DeleteOlderThanDays");

    //Hogy csak akkor írjon separatort, ha törlődik az adott fájl (írt valamit a konzolra)
    var separatorNeeded = false;

    if (isNaN(parseInt(subDays))) {
      logToBoth("subDays is not a valid integer! (" + subDays + ")");
      return;
    }

    //Az aktuális dátum napjaiból kivonjuk a megadott számú napot.
    limitDate.setDate(limitDate.getDate() - subDays);

    const startMessage = "Deleting files and folders that were trashed before " + limitDate.toLocaleString();
    logToBoth(startMessage);

    //Mappák törlése
    var folders = DriveApp.getTrashedFolders();
    while (folders.hasNext()) {
      try {
        var folder = folders.next();

        if (folder.getLastUpdated() >= limitDate) {
          continue;
        }

        var parentFolder = null;
        var lastDeletableParentFolder = null;

        while ((parentFolder = hasTrashedParent(folder.getParents())) != null) {
          if (parentFolder.getLastUpdated() < limitDate) {
            lastDeletableParentFolder = parentFolder;
          }
          else {
            break;
          }
        }

        if (lastDeletableParentFolder != null) {
          folder = lastDeletableParentFolder;

          //Mivel a szülő mappáját fogjuk törölni, ezért valószínűleg több olyan mappa is van az eredeti folders iterátorban, ami a szülő mappával együtt törlődni fog.
          //Ha újra lekérdeződik a trashed folders, akkor ezek a mappák már nem lesznek benne.
          folders = DriveApp.getTrashedFolders();
        }

        separatorNeeded = true;

        logDeletion("folder", folder);

        Drive.Files.remove(folder.getId());
      }
      catch (e) {
        logToBoth("Error while processing folder '" + folder.getName() + "'\nReason: " + e);
      }
      finally {
        if (separatorNeeded) {
          separatorNeeded = false;
          console.log("-----------------------------------------------------------------------");
        }
      }
    }

    console.log("\n-----------------------------------------------------------------------\n");

    //Fájlok törlése
    const files = DriveApp.getTrashedFiles();
    while (files.hasNext()) {
      try {
        var file = files.next();

        if (file.getLastUpdated() < limitDate) {
          separatorNeeded = true;

          logDeletion("file", file);

          Drive.Files.remove(file.getId());
        }
      }
      catch (e) {
        logToBoth("Error while processing file '" + file.getName() + "'\nReason: " + e);
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
    logToBoth("Error while executing:\n" + e);
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