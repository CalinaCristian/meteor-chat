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
    appId: '1370122246382119',
    secret: 'e0305fcd2af71d5c48a6e0eee15ec37b'
});

Accounts.onCreateUser(function(options, user) {
  if (options.color){
    user.color = options.color;
  }
  if (user.services.facebook) {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';

    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    user.color = color;
    user.username = user.services.facebook.name;
    user.emails = [{address: user.services.facebook.email}];
  }
  user.friends = [];
  user.friendsRequests = [];
  user.friendsAwaiting = [];
  user.groups = [];
  user.groupsRequests = [];
  user.groupsAwaiting = [];

  return user;
});
