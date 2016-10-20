Meteor.subscribe("message");
Meteor.subscribe("userStatus");

Template.introPage.onCreated( function(){
	$('html, body').css({
	"background": "url(bg3.jpg) repeat center center fixed",
	"-webkit-background-size": "100%",
	"-moz-background-size" : "100%",
	"-o-background-size" : "100%",
	"background-size" : "100%",
	})
});

Template.introPage.helpers({
	guest: function(){
		if (Meteor.userId()){
			return Meteor.user() && Meteor.user().username + "!";
		}
		else{
			return "Guest! Please sign in.";
		}
	}
});