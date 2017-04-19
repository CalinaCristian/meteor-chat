Session.set("messageReciever", []);
Session.set("global", false);
Session.set("group", false);
Session.set("groupId", "");
Session.set("lastMessageId", "");

Tracker.autorun(function(){
  const group = Groups.findOne({_id: Session.get("groupId")});

  if (!group && Session.get('group') && Session.get("groupId")){
    Session.set("messageReciever", []);
    Session.set("global", true);
    Session.set("group", false);
    Session.set("groupId", "");
  }
});

function scrollDown() {
  $("#log").css("max-height", (window.innerHeight - $("#composer").innerHeight() -
      $("#nav").innerHeight() - $(".navbar").innerHeight() - 25)+"px");
  $("#inputMessageBox").css("max-width", $("#log").innerWidth());

  var elem = document.getElementById('log');

  if (elem){
    elem.scrollTop = elem.scrollHeight;
  }
}

Template.chat.rendered = function(){
  scrollDown();
  Session.set("global", true);

  Tracker.autorun(function(){
    if (Messages.findOne()) {

      const lastMessage = Messages.find({}, {sort: {time: -1}, limit: 1}).fetch()[0];
      if (Session.get("lastMessageId") !== lastMessage._id) {
        const prevId = Session.get("lastMessageId");

        Session.set("lastMessageId", lastMessage._id);

        if (Session.get("global") && lastMessage.reciever.length === 0) {
          scrollDown();
        }
        else if (Session.get("group") && lastMessage.group && Session.get("groupId") === lastMessage.groupId) {
          scrollDown();
        }
        else if (!Session.get("global") && !Session.get('group') && !lastMessage.group && !lastMessage.groupId &&
          (((lastMessage.reciever[0] === Session.get("messageReciever")[0]) && (lastMessage.sender === Meteor.userId())) ||
          ((lastMessage.reciever[0] === Meteor.userId()) && (lastMessage.sender === Session.get("messageReciever")[0])))
        ) {
          scrollDown();
        }
        else if (prevId !== "") {
          if (lastMessage.reciever.length === 0) {
            const username = Meteor.users.findOne({_id: lastMessage.sender}).username;

            toastr.info(`${username}: ${lastMessage.message}`, "From Global Chat");
          }
          else if (lastMessage.group && lastMessage.groupId) {
            const name = Groups.findOne({_id: lastMessage.groupId}).name;
            const username = Meteor.users.findOne({_id: lastMessage.sender}).username;

            toastr.info(`${username}: ${lastMessage.message}`, `From Group "${name}"`);
          }
          else if (!lastMessage.group && !lastMessage.groupId && (lastMessage.reciever[0] === Meteor.userId())) {
            const username = Meteor.users.findOne({_id: lastMessage.sender}).username;

            toastr.info(lastMessage.message, `From "${username}"`);
          }
        }
      }
    }
  });
}

Meteor.startup(function() {
  $(window).resize(function(evt){
    scrollDown();
  })
});

Template.chat.onCreated (function(){
  $('html, body').css({
  'background':'none',
  'background-color':'#E0E0E0'
  })
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
  }
})

Template.messages.helpers({
  messages: function() {
    return this;
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
  },
  systemMessage: function(){
    return (this.name==="System");
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
    const group = Groups.findOne({owner: Meteor.userId()});

    if (group){
      return (group.users.indexOf(this._id) == -1);
    }
    else {
      return false;
    }
  },
  getUsername: function(){
    if (this.username.length > 8) {
      return this.username.substring(0, 8) + "..";
    }
    return this.username;
  }
})

Template.users.events({
  'click #startChat': function(e){
    e.preventDefault();
    Session.set("global",false);
    Session.set("group", false);
    Session.set("groupId", "");
    Session.set("messageReciever", [this._id]);

    setTimeout(scrollDown, 100);
  },
  'click #startGChat': function(e){
    e.preventDefault();
    Session.set("messageReciever", []);
    Session.set("global", true);
    Session.set("groupId", "");
    Session.set("group", false);

    setTimeout(scrollDown, 100);
  },
  'click #addGroup': function(e){
    e.preventDefault();
    var name = this.username;
    Meteor.call("addUserToMyGroup", this, function(err, result){
      if (err){
        if (err.reason){
          toastr.error(err.reason, "ERROR");
        }
        else {
          toastr.error("Internal Server Error!", "ERROR");
        }
      } else {
        let receivers = Session.get("messageReciever");
        receivers.push(result);

        Session.set("messageReciever", receivers);

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
    if (this.name.length > 8)  {
      return this.name.substring(0, 8) + ".."
    }
    return this.name;
  },
  'realName': function(){
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

    setTimeout(scrollDown, 100);
  },
  'click #leaveGroupChat': function(e){
    e.preventDefault();
    const groupName = this.name;

    Meteor.call("leaveGroup", this._id, function(err){
      if (err){
        if (err.reason){
          toastr.error(err.reason, "ERROR");
        }
        else {
          toastr.error("Internal Server Error!", "ERROR");
        }
      } else {
        Session.set("messageReciever", []);
        Session.set("global", true);
        Session.set("group", false);
        Session.set("groupId", "");

        toastr.info("Ati parasit grupul " + groupName + ".", "SUCCESS");

        setTimeout(scrollDown, 100);
      }
    })
  }
});

Template.input.events ({
  'keydown input#message' : function (event) {
    if (event.which == 13) { // 13 is the enter key event
      if (!Meteor.user()){
      	toastr.error("Nu sunteti autentificat.","ERROR!");
      	document.getElementById('message').value = '';
      }
      var message = document.getElementById('message');

      if (message.value != '') {

        Meteor.call("insertMessage", message.value, Session.get("messageReciever"),
          Session.get("group"), (Session.get("group")==true) ? Session.get("groupId") : "", function(err){

          if (err){
            if (err.reason){
              toastr.error(err.reason, "ERROR");
            }
            else {
              toastr.error("Internal Server Error!", "ERROR");
            }
          }
        });
      }
      document.getElementById('message').value = '';
      message.value = '';
      }
    }
});

Template.input.helpers({
    'toWhom': function(){
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
