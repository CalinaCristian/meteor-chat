Session.set("online",true);
Session.set("buttonFor", "");

Template.members.onCreated( function(){
	$('html, body').css({
		'background':'none',
		'background-color':'#E0E0E0'
	})
});

Handlebars.registerHelper('getColor', function(user) {
	if (Meteor.isClient){
		return Meteor.users.findOne({_id: user._id}).color;
	}
	else {
		return 'blue';
	}
});

Template.members.helpers({
	number:function(){
		return Meteor.users.find().count();
	},
	atLeastOne:function(){
		return (Meteor.users.find().count() > 0);
	},
	numberOnline:function(){
		return (Meteor.users.find({ "status.online": true}).count());
	},
	atLeastOneOnline:function(){
		return ((Meteor.users.find({ "status.online": true}).count()) > 0);
	}
});

Template.displayUsers.events({
	"click .toggle": function(){
		Session.set("online", !Session.get("online"));
	},
	"click #add": function(e){
		e.preventDefault();
		Meteor.call("addUserToFriends",this._id,Meteor.userId());
	},
	"click #cancel": function(e){
		e.preventDefault();
		Meteor.call("cancelAddUserToFriends",this._id, Meteor.userId());
	},
	"click #accept": function(e){
		e.preventDefault();
		Meteor.call("acceptUserAdd", this._id, Meteor.userId());
	},
	"click #decline": function(e){
		e.preventDefault();
		Meteor.call("declineUserAdd", this._id, Meteor.userId());
	},
	"click #remove": function(e){
		e.preventDefault();
		Meteor.call("removeFriend", this._id, Meteor.userId());
	}
})

Template.displayUsers.helpers({
	checkAnyOnline: function(){
		return (Meteor.users.find({ "status.online": true}).fetch()[0] === undefined)
	},
	isItChecked: function(){
		return !Session.get("online");
	},
	user: function(){
		return Meteor.users.find({}, { sort: { createdAt: -1}}).fetch();
	},
	atLeastOne: function(){
		return (Meteor.users.find().count() > 0);
	},
	online: function(){
		return Meteor.users.find({ "status.online": true, "username":this.username}).fetch();
	},
	offline: function(){
		return Meteor.users.find({ "status.online": false, "username":this.username}).fetch();
	},
	notOnlineOnly: function(){
		return Session.get("online");
	},
	OnlineOnly: function(){
		return !Session.get("online");
	},
	friend: function(){
		return (($.inArray(this._id, Meteor.user().friends) > -1) &&
			(this._id !== Meteor.user()._id));
	},
	friendRequest: function(){
		return (($.inArray(this._id, Meteor.user().friendsRequests) > -1) &&
			(this._id !== Meteor.user()._id));
	},
	friendPending: function(){
		return (($.inArray(this._id, Meteor.user().friendsAwaiting) > -1) &&
			(this._id !== Meteor.user()._id));
	},
	me: function(){
		return (this._id === Meteor.user()._id);
	},
	theId: function(){
		return this._id;
	}
});

var DateFormats = {
       short: "DD MMMM - YYYY",
       long: "dddd DD.MM.YYYY HH:mm"
};


UI.registerHelper("formatDate", function(datetime, format) {
  if (moment) {
    // can use other formats like 'lll' too
    format = DateFormats[format] || format;
    return moment(datetime).format(format);
  }
  else {
    return datetime;
  }
});