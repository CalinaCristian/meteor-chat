Session.set("messageReciever", []);
Session.set("global", false);
Session.set("group", false);
Session.set("groupId", "");

Template.chat.rendered = function(){
  $("#log").css("max-height", (window.innerHeight - $("#composer").innerHeight() -
      $("#nav").innerHeight() - $(".navbar").innerHeight() - 25)+"px");
  var elem = document.getElementById('log');
  if (elem){
    elem.scrollTop = elem.scrollHeight;
  }
  Session.set("global", true);
}

Meteor.startup(function() {
  $(window).resize(function(evt){
    $("#log").css("max-height", (window.innerHeight - $("#composer").innerHeight() -
        $("#nav").innerHeight() - $(".navbar").innerHeight() - 25)+"px");
  var elem = document.getElementById('log');
   if (elem){
     elem.scrollTop = elem.scrollHeight;
   }
 })
});

Template.chat.onCreated (function(){
    $('html, body').css({
    'background':'none',
    'background-color':'#E0E0E0'
  })
  $("#log").css("max-height", (window.innerHeight - $("#composer").innerHeight() -
      $("#nav").innerHeight() - $(".navbar").innerHeight() - 25)+"px");
   var elem = document.getElementById('log');
   if (elem){
     elem.scrollTop = elem.scrollHeight;
   }
});

Template.chat.helpers({
  loggedIn: function(){
    return Meteor.user();
  },
  notloggedIn: function(){
    return !Meteor.user();
  },
  displayType: function(){
    if (Meteor.user()){
      return "show";
    }
    else {
      return "hidden";
    }
  },
  lastMessage: function() {
      if (Meteor.userId() && Messages.find({}, {sort: {time: -1}, limit: 1}).fetch()[0]) {
        var elem = document.getElementById('log');
        if (elem){
          elem.scrollTop = elem.scrollHeight;
        }
        if ( Session.get("lastMessage") !== Messages.find({}, {sort: {time: -1}, limit: 1}).fetch()[0].message){
          // lastMessage.update({_id: lastMessage.findOne({name: 'mesj'})._id},{$set:{'text': Messages.find({}, {sort: {time: -1}, limit: 1}).fetch()[0].message}});
          Session.setAuth("lastMessage", Messages.find({}, {sort: {time: -1}, limit: 1}).fetch()[0].message);
          Session.setAuth("lastName", Messages.find({}, {sort: {time: -1}, limit: 1}).fetch()[0].name);
        }
      }
    }
})

Template.messages.helpers({
  messages: function() {
    return Messages.find({}, { sort: { time: 1}});
  }
});

Template.msj.helpers({
  filterThem: function(){
    var other = Session.get("messageReciever");
    var equal = true;
    //check if equal:
    if ((other.length == this.reciever.length) && (other.length > 0)) {
      for (var i = 0 ; i < other.length ; i ++){
        if (other[i] !== this.reciever[i]){
          equal = false;
        }
      }
    }
    else {
      equal = false;
    }
    if (Session.get("group") == true){
      if ((this.groupId == Session.get("groupId"))&&(this.group == true)){
        return this;
      }
    }
    else{
      if ((this.group == false) && (other.length==0) && 
        (this.sender == undefined || this.reciever.length == 0)){
        return this;
      }
      else {
        if ((this.group == false) && ((this.sender == Meteor.userId() && equal) ||
          (other.indexOf(this.sender) > -1) && this.reciever.indexOf(Meteor.userId())>-1)){
          return this;
        }
      }
    }
  },
  myColorChat: function(msj){
    return Meteor.users.findOne({_id: msj.sender}).color;
  }
})

Template.users.helpers({
	users: function(){
		return Meteor.users.find({"status.online": true});
	},
  userIsFriend: function(){
    var friends = Meteor.user().friends;
    return (($.inArray(this._id, friends)>-1) && (this._id !== Meteor.userId()));
  },
  itsme: function(){
    return (this._id === Meteor.userId());
  },
  notInMyGroup: function(){
    if (Groups.findOne({owner: Meteor.userId()})){
      return (Groups.findOne({owner: Meteor.userId()}).users.indexOf(this._id) == -1);
    }
    else {
      return false;
    }
  }
})

Template.users.events({
  'click #startChat': function(e){
    e.preventDefault();
    Session.set("global",false);
    Session.set("group", false);
    Session.set("messageReciever", [this._id]);
  },
  'click #startGChat': function(e){
    e.preventDefault();
    Session.set("messageReciever", []);
    Session.set("global", true);
    Session.set("group", false);
  },
  'click #addGroup': function(e){
    e.preventDefault();
    var name = this.username;
    Meteor.call("addUserToMyGroup", this, function(err){
      if (err){
        if (err.reason){
          toastr.error(err.reason, "ERROR");
        }
        else {
          toastr.error("Internal Server Error!", "ERROR");
        }
      } else {
        toastr.info("Utilizatorul " + name + " a fost adaugat in grupul " +
          Groups.findOne({owner: Meteor.userId()}).name, "SUCCESS");
      }
    })
  }
})

Template.groups.helpers({
  'group': function(){
    return Groups.find();
  },
  'userInGroup': function(){
    var usersInGroup = this.users;
    return ($.inArray(Meteor.userId(), usersInGroup) > -1);
  },
  'ownerOfGroup': function(){
    return (Meteor.userId() === this.owner);
  },
  'notOwnsGroup': function(){
    return (!Groups.findOne({owner: Meteor.userId()}));
  },
  'name' : function(){
    return this.name;
  }
});

Template.groups.events({
  'submit .createGroup': function(e,t){
    e.preventDefault();
    var name = t.find('#newGroup').value
    Meteor.call("createGroup", name,function(err){
      if (err){
        if (err.reason){
          toastr.error(err.reason, "ERROR");
        }
        else {
          toastr.error("Internal Server Error!", "ERROR");
        }
      } else {
        toastr.info("Grupul " + name + " a fost creat.", "SUCCESS")
      }
    });
  },
  'click #deleteGroup': function(e){
    e.preventDefault();
    var name = this.name;
    var theId = this._id;
    Meteor.call("removeGroup",this, function(err){
      if (err){
        if (err.reason){
          toastr.error(err.reason, "ERROR");
        }
        else {
          toastr.error("Internal Server Error!", "ERROR");
        }
      } else {
        toastr.info("Grupul " + name + " a fost sters.", "SUCCESS");
      }
    })
  },
  'click #startGroupChat': function(e){
    e.preventDefault();
    Session.set("messageReciever", this.users);
    Session.set("global", false);
    Session.set("group", true);
    Session.set("groupId", this._id);
  }
});

Template.input.events ({
  'keydown input#message' : function (event) {
    if (event.which == 13) { // 13 is the enter key event
    	if (Meteor.user()){
        var name = Meteor.user().username;
      }
      else{
      	toastr.error("Nu sunteti autentificat.","ERROR!");
      	document.getElementById('message').value = '';
      }
      var message = document.getElementById('message');
      if (message.value != '') {
        Messages.insert({
          name: name,
          message: message.value,
          time: Date.now(),
          sender: Meteor.userId(),
          reciever: Session.get("messageReciever"),
          group: Session.get("group"),
          groupId: (Session.get("group")==true) ? Session.get("groupId") : ""
        });
      }
      var elem = document.getElementById('log');
      if (elem){
        elem.scrollTop = elem.scrollHeight;
      }
      document.getElementById('message').value = '';
      message.value = '';
      }
    }
});

Template.input.helpers({
    'toWhom': function(){
      messageRecieverArray = Session.get("messageReciever");
      if (Session.get("group") == true){
        var forGroupsUsers = Groups.findOne({_id: Session.get("groupId")});
      }
      else {
        var forUsers = Meteor.users.findOne({_id: Session.get("messageReciever")[0]});
      }
      
      return forUsers ? forUsers.username : 
      (Session.get("global") == true) ? "Global" :
      forGroupsUsers ? forGroupsUsers.name : ""
    }
  })