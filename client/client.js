Meteor.startup( function(){
  import 'sweetalert/dist/sweetalert.css';
  import 'bootstrap';
  import 'bootstrap/dist/css/bootstrap.css';
  import 'bootstrap/dist/css/bootstrap-theme.css';
});

Meteor.saveFile = function(blobs, reciever, group, groupId, callback) {
  let method  = 'readAsBinaryString' , encoding = 'binary';
  let promises = [];

  blobs.forEach((blob) => {
    let fileReader = new FileReader();

    promises.push(new Promise((res, rej) => {
      fileReader.onload = function(file) {
        res([file.srcElement.result, blob.name, blob.type]);
      }
      fileReader[method](blob);
    }))
  });

  Promise.all(promises).then((results) => {
      Meteor.call('uploadFilesToServer', results, encoding, reciever, group, groupId, callback);
  })
}
