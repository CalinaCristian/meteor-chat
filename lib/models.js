Messages = new Mongo.Collection('messages');
Groups = new Mongo.Collection('groups');

MessageSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  name: {
    type: String
  },
  message: {
    type: String
  },
  time: {
    type: Date
  },
  sender: {
    type: String,
    optional: true
  },
  group: {
    type: Boolean
  },
  groupId: {
    type: String,
    optional: true
  },
  reciever: {
    //MAKE IT ARRAY
    type: [String],
    optional: true
  }
});

GroupSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  name: {
    type: String,
    unique: true
  },
  owner: {
    type: String
  },
  users: {
    type: [String],
    optional: true
  }
});

Groups.attachSchema(GroupSchema);
Messages.attachSchema(MessageSchema);