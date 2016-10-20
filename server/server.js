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
  return user;
});