Messages = new Mongo.Collection('messages');
Groups = new Mongo.Collection('groups');

UserSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  username: {
    type: String,
    regEx: /^[a-z0-9A-Z_.]{3,25}$/
  },
  emails: {
    type: [Object],
    // this must be optional if you also use other login services like facebook,
    // but if you use only accounts-password, then it can be required
    label: "Adrese email"
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "Adresa mail"
  },
  "emails.$.verified": {
    type: Boolean,
    optional: true,
    label: "Valid"
  },
  status: {
    type: Object,
    optional: true,
    blackbox: true
  },
  color: {
    type: String,
    optional: true
  },
  friends: {
    type: [String],
    optional: true
  },
  friendsRequests: {
    type: [String],
    optional: true
  },
  friendsAwaiting: {
    type: [String],
    optional: true
  },
  groups: {
    type: [String],
    optional: true
  },
  groupsRequests: {
    type: [String],
    optional: true
  },
  groupsAwaiting: {
    type: [String],
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  createdAt: {
    type: Date,
    optional: true
  }
});

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

Meteor.users.attachSchema(UserSchema);
Groups.attachSchema(GroupSchema);
Messages.attachSchema(MessageSchema);
