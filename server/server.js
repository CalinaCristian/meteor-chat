Meteor.startup( function(){

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
    appId: '1370120136382330',
    secret: '4a1abaab5ffdf68916ceb35e466aa3c4'
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
