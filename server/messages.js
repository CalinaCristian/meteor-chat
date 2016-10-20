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
  }
});