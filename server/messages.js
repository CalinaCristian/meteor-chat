import fs from 'fs';
import {join} from 'path';
import {mkdirp} from 'mkdirp';

Meteor.methods({
  insertMessage: function(message, reciever, group, groupId){
    Messages.insert({
      name: Meteor.user().username,
      time: Date.now(),
      sender: Meteor.userId(),
      message: message,
      reciever: reciever,
      group: group,
      groupId: groupId
    });
  },
  uploadFilesToServer: function(files, encoding, reciever, group, groupId){
    const rootPath = process.env.PWD;
    const filesPath = join(rootPath, 'private/uploads/');

    if (!fs.existsSync(filesPath)) {
      mkdirp.sync(filesPath);
    }

    let promises = [];
    let messageFiles = [];
    let blobOfFiles = [];
    let message = "";

    // no time, so duplicated code to work
    files.map((file, index) => {
      if ((index > 0) && (index < files.length)) {
        message += ", ";
      }
      const blob = file[0];
      const name = file[1];
      const type = file[2];

      const fileNameArray = name.split('.');
      const extension = fileNameArray[fileNameArray.length - 1];

      fileNameArray.pop();

      const fileWithoutExtension = fileNameArray.join('.');
      const finalFileName = fileWithoutExtension + "-" + Date.now() + "." + extension;

      const path = join(filesPath, finalFileName);
      const relativePath = join('private/uploads/', finalFileName);

      messageFiles.push({name: finalFileName, url: relativePath, type: type})
      blobOfFiles.push(blob);
      message += finalFileName;
    });

    Messages.insert({
      name: Meteor.user().username,
      time: Date.now(),
      sender: Meteor.userId(),
      message: message,
      reciever: reciever,
      group: group,
      groupId: groupId,
      files: messageFiles
    });

    // no time, so duplicated code to work
    messageFiles.map((file, index) => {
      const writePath = join(rootPath, file.url);

      promises.push(new Promise((res, rej) => {
        fs.writeFile(writePath, blobOfFiles[index], encoding, function(err) {
          if (err) {
            reject(err);
          } else {
            res("The files have been uploaded");
          }
        });
      }));
    });

    Promise.all(promises).then((results) => {
      return results;
    })
  },
  readFile(url) {
    const rootPath = process.env.PWD;
    const finalUrl = join(rootPath, url);

    let content;
    // First I want to read the file
    return new Promise((res, rej) => {
      fs.readFile(finalUrl, (err, data) => {
        if (err) {
          rej(err)
        } else {
          res(data);
        }
      });
    }).then((res) => {
      return res.toString('base64');
    }).catch((err) => {
      throw new Meteor.Error(500, "Error while accessing file. Perhaps it expired.");
    });
  }
});
