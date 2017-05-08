import {join} from 'path';
import {exec} from 'child_process';

Meteor.startup( function(){

  function daysInThisMonth() {
    var now = new Date();

    return new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
  }

  const rootPath = process.env.PWD;
  const filesPath = join(rootPath, 'private/uploads/');

  SyncedCron.add({
    name: 'Clean expired files on the server',
    schedule: function(parser) {
      // parser is a later.parse object
      return parser.text('on the first day of the month');
    },
    job: function() {
      const monthInMinutes = daysInThisMonth() * 24 * 60;

      exec(`find ${filesPath} -mindepth 1 -mmin +${monthInMinutes} -delete -print`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return error;
        }
        else {
          console.log("Success deleting old files");
        }

        return stdout;
      });
    }
  });

  SyncedCron.start();

  Meteor.publish("users", function() {
    return Meteor.users.find();
  });

  Meteor.publish("messages", function(){
    return Messages.find();
  });

  Meteor.publish("groups", function(){
    return Groups.find();
  });

  Groups.allow({
    'insert': function(userId,doc){
      return Meteor.userId();
    },
    'remove': function(userId, doc){
      return Meteor.userId();
    },
    'update': function(userId, doc){
      return false;
    }
  })

  Messages.allow({
    'insert': function (userId,doc) {
      /* user and doc checks ,
      return true to allow insert */
      return Meteor.userId();
    },
    'remove': function(userId,doc){
      return false;
    },
    'update': function(userId, doc){
      return false;
    }
  });

  Meteor.users.allow({
    'remove': function(userId,doc){
      return false;
    },
    'insert': function(userId,doc){
      return false;
    },
    'update': function(userId, doc){
      return false;
    }
  })
});

ServiceConfiguration.configurations.remove({
    service: "facebook"
});

ServiceConfiguration.configurations.insert({
    service: "facebook",
    appId: Meteor.settings.facebookAppId,
    secret: Meteor.settings.facebookAppSecretId
});

Accounts.onCreateUser(function(options, user) {
  if (options.color){
    user.color = options.color;
  }
  user.friends = [];
  user.friendsRequests = [];
  user.friendsAwaiting = [];
  user.groups = [];
  user.groupsRequests = [];
  user.groupsAwaiting = [];

  if (user.services.facebook) {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';

    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    user.color = color;
    user.username = user.services.facebook.name;
    user.emails = [{address: user.services.facebook.email}];

    new Promise((resolve, reject) => {
      Meteor.call('setFacebookFriends', user, (err, res) => {
        if (err)
          reject(err);
        else
          resolve(res);
      });
    }).then((res) => {
      return user;
    });
  }

  return user;
});
