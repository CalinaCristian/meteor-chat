import swal from 'sweetalert';
import saveAs from 'file-saverjs';

Session.set("messageReciever", []);
Session.set("global", false);
Session.set("group", false);
Session.set("groupId", "");
Session.set("lastMessageId", "");
Session.set("lastMessageFromChatType", "");
Session.set("viewList", false);
Session.set("alreadySet", false);
Session.set("portrait", true);

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
  if (window.innerWidth >= 768) {
    $("#log").css("max-height", (window.innerHeight - $("#composer").innerHeight() -
        $("#nav").innerHeight() - $(".navbar").innerHeight() - 25)+"px");
    $("#inputMessageBox").css("max-width", $("#log").innerWidth());
  }

  let elem = document.getElementById('log');

  if (elem){
    elem.scrollTop = elem.scrollHeight;
  }
}

function hideSidebar() {
  if (window.innerWidth < 768) {
    Session.set("viewList", false);
    document.getElementById("sidebar").style.display = "none";
  }
}

Template.chat.rendered = function(){
  if (window.innerWidth < 768) {
    toastr.options = {
      "positionClass": "toast-bottom-center"
    }
  }

  if (window.innerHeight > window.innerWidth) {
    Session.set("portrait", true);
  }
  else {
    Session.set("portrait", false);
  }

  // for mobile, only once
  $("#log").css("max-height", (window.innerHeight - $("#composer").innerHeight() -
      $("#nav").innerHeight() - $(".navbar").innerHeight() - 25)+"px");
  $("#inputMessageBox").css("max-width", $("#log").innerWidth());

  scrollDown();

  Session.set("messageReciever", []);
  Session.set("global", true);
  Session.set("groupId", "");
  Session.set("group", false);
  Session.set("lastMessageId", "");
  Session.set("lastMessageFromChatType", "");

  this.autorun(function(){
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

            Meta.setTitle(`"${username}" from Global Chat messaged`);
            Session.set("lastMessageFromChatType", "global");

            toastr.info(`${username}: ${lastMessage.message}`, "From Global Chat", {
              onclick: () => {
                Session.set("messageReciever", []);
                Session.set("global", true);
                Session.set("groupId", "");
                Session.set("group", false);

                Meta.setTitle("");
                setTimeout(scrollDown, 100);
              }
            });
          }
          else if (lastMessage.group && lastMessage.groupId) {
            const name = Groups.findOne({_id: lastMessage.groupId}).name;
            const username = Meteor.users.findOne({_id: lastMessage.sender}).username;

            Meta.setTitle(`"${username}" from group "${name}" messaged`);
            Session.set("lastMessageFromChatType", `group#${lastMessage.groupId}`);

            toastr.info(`${username}: ${lastMessage.message}`, `From Group "${name}"`, {
              onclick: () => {
                let lastRecievers = lastMessage.reciever;

                lastRecievers.splice(lastMessage.reciever.indexOf(Meteor.userId()), 1);
                lastRecievers.push(lastMessage.sender);

                Session.set("messageReciever", lastRecievers);
                Session.set("global", false);
                Session.set("group", true);
                Session.set("groupId", lastMessage.groupId);

                Meta.setTitle("");
                setTimeout(scrollDown, 100);
              }
            });
          }
          else if (!lastMessage.group && !lastMessage.groupId && (lastMessage.reciever[0] === Meteor.userId())) {
            const username = Meteor.users.findOne({_id: lastMessage.sender}).username;

            Meta.setTitle(`"${username}" messaged you`);
            Session.set("lastMessageFromChatType", `user#${lastMessage.sender}`);

            toastr.info(lastMessage.message, `From "${username}"`, {
              onclick: () => {
                Session.set("global",false);
                Session.set("group", false);
                Session.set("groupId", "");
                Session.set("messageReciever", [lastMessage.sender]);

                Meta.setTitle("");
                setTimeout(scrollDown, 100);
              }
            });
          }
        }
      }
    }
  });
}

Meteor.startup(function() {
  $(window).resize(function(evt){
    if ((window.innerHeight > window.innerWidth) && (!Session.get("portrait"))) {
      $("#log").css("max-height", (window.innerHeight - $("#composer").innerHeight() -
          $("#nav").innerHeight() - $(".navbar").innerHeight() - 25)+"px");
      $("#inputMessageBox").css("max-width", $("#log").innerWidth());

      Session.set("portrait", true);
    }
    else if ((window.innerWidth > window.innerHeight) && (Session.get("portrait"))){
      $("#log").css("max-height", (window.innerHeight - $("#composer").innerHeight() -
          $("#nav").innerHeight() - $(".navbar").innerHeight() - 25)+"px");
      $("#inputMessageBox").css("max-width", $("#log").innerWidth());

      Session.set("portrait", false);
    }

    if ((window.innerWidth < 768) && (!Session.get("alreadySet"))) {
      Session.set("alreadySet", true);
      Session.set("viewList", false);
      document.getElementById("sidebar").style.display = "none";
      document.getElementById("viewList").style.display = "inherit";
    }
    else if (window.innerWidth >= 768) {
      $("#log").css("max-height", (window.innerHeight - $("#composer").innerHeight() -
          $("#nav").innerHeight() - $(".navbar").innerHeight() - 25)+"px");
      $("#inputMessageBox").css("max-width", $("#log").innerWidth());

      Session.set("viewList", true);
      Session.set("alreadySet", false);
      document.getElementById("sidebar").style.display = "inherit";
      document.getElementById("viewList").style.display = "none";
    }
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
  checkDisplaySidebar: function() {
    if (window.innerWidth >= 768) {
      return 'inherit';
    }
    return 'none';
  },
  checkDisplayViewSidebarButton: function() {
    if (window.innerWidth >= 768) {
      return 'none';
    }
    return 'inline-block';
  },
  viewOrHide: function() {
    if (Session.get("viewList")) {
      return "Hide";
    }
    return "View"
  }
})

Template.chat.events({
  'click #viewList': function() {
    Session.set("viewList", !Session.get("viewList"));
    if (Session.get("viewList")) {
      document.getElementById("sidebar").style.display = "inherit";
    }
    else {
      document.getElementById("sidebar").style.display = "none";
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
    const other = Session.get("messageReciever");
    let equal = true;

    //check if equal:
    if ((other.length == this.reciever.length) && (other.length > 0)) {
      for (let i = 0 ; i < other.length ; i ++){
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
  },
  hasAttachements: function(){
    return (this.files && this.files.length > 0) || false;
  }
})

function b64toBlob(b64Data, contentType, sliceSize, fileName) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  let byteCharacters = atob(b64Data);
  let byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    let slice = byteCharacters.slice(offset, offset + sliceSize);

    let byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    let byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  let blob = new Blob(byteArrays, {
    type: contentType
  });
  if (blob) {
    saveAs(blob, fileName);
  } else {
    throw 'Could not generate blob';
  }
}

Template.msj.events({
  'click #downloadButton': function() {
    this.files.forEach((file) => {
      Meteor.call('readFile', file.url, (err,res) => {
        if (err){
          if (err.reason){
            toastr.error(`Error while downloading file ${file.name}. Perhaps it has expired`, "ERROR");
          }
          else {
            toastr.error("Internal Server Error!", "ERROR");
          }
        } else {
          b64toBlob(res, file.type, null, file.name);
          toastr.success(`The file: ${file.name} has been downloaded`, "SUCCESS");
        }
      });
    })
  }
})

Template.onlineUsers.helpers({
	onlineUsers: function(){
		return Meteor.users.find({"status.online": true});
	},
  userIsFriend: function(){
    const friends = Meteor.user().friends;

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

Template.onlineUsers.events({
  'click #startChat': function(e){
    e.preventDefault();
    Session.set("global",false);
    Session.set("group", false);
    Session.set("groupId", "");
    Session.set("messageReciever", [this._id]);

    let type = Session.get("lastMessageFromChatType").split('#');

    if (type[0] === 'user') {
      if (type[1] === this._id) {
        Meta.setTitle("");
      }
    }

    hideSidebar();
    setTimeout(scrollDown, 100);
  },
  'click #startGChat': function(e){
    e.preventDefault();
    Session.set("messageReciever", []);
    Session.set("global", true);
    Session.set("groupId", "");
    Session.set("group", false);

    let type = Session.get("lastMessageFromChatType").split('#');

    if (type[0] === 'global') {
      Meta.setTitle("");
    }

    hideSidebar();
    setTimeout(scrollDown, 100);
  },
  'click #addGroup': function(e){
    e.preventDefault();

    const name = this.username;

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

Template.offlineUsers.helpers({
  offlineUsers: function(){
    return Meteor.users.find({"status.online": false});
  },
  userIsFriend: function(){
    const friends = Meteor.user().friends;

    return (($.inArray(this._id, friends)>-1) && (this._id !== Meteor.userId()));
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

Template.offlineUsers.events({
  'click #startChat': function(e){
    e.preventDefault();
    Session.set("global",false);
    Session.set("group", false);
    Session.set("groupId", "");
    Session.set("messageReciever", [this._id]);

    let type = Session.get("lastMessageFromChatType").split('#');

    if (type[0] === 'user') {
      if (type[1] === this._id) {
        Meta.setTitle("");
      }
    }

    hideSidebar();
    setTimeout(scrollDown, 100);
  },
  'click #addGroup': function(e){
    e.preventDefault();

    const name = this.username;

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
    const usersInGroup = this.users;

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

    const name = t.find('#newGroup').value

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

    const name = this.name;

    Meteor.call("removeGroup",this, function(err){
      if (err){
        if (err.reason){
          toastr.error(err.reason, "ERROR");
        }
        else {
          toastr.error("Internal Server Error!", "ERROR");
        }
      } else {
        hideSidebar();
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

    let type = Session.get("lastMessageFromChatType").split('#');

    if (type[0] === 'group') {
      if (type[1] === this._id) {
        Meta.setTitle("");
      }
    }

    hideSidebar();
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

      let message = document.getElementById('message');

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
    },
    'click #uploadButton': function() {
      $("#triggerUpload").trigger('click');
    },
    'change #triggerUpload': function(ev) {
      const list = $("#triggerUpload").prop('files');
      const keys = Object.keys(list);
      let sizeTooBig = false;
      const filesList = keys.map((key) => {
        if (list[key].size > 10000000) {
          sizeTooBig = true;
        }
        return list[key];
      });

      if (sizeTooBig) {
        toastr.error("File exceeds maximum allowed size of 10MB", "ERROR");
        swal.close();
        return;
      }

      swal({
        title: "Send?",
        text: `Are you sure you want to send ${filesList.length} ${filesList.length == 1 ? 'file' : 'files'} ?`,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
        closeOnConfirm: false,
        closeOnCancel: true,
        showLoaderOnConfirm: true,
      },
      function(isConfirm){
        if (isConfirm) {
          // filesList.forEach((file) => {
          Meteor.saveFile(filesList, Session.get("messageReciever"), Session.get("group"),
            (Session.get("group")==true) ? Session.get("groupId") : "", (err, res) => {

            swal.close();

            if (err){
              if (err.reason){
                toastr.error(err.reason, "ERROR");
              }
              else {
                toastr.error("Internal Server Error!", "ERROR");
              }
              $('#triggerUpload').val('');
            }
            else {
              toastr.success("The upload was successfull", "SUCCESS");
              $('#triggerUpload').val('');
            }
          });
          // })
        } else {
          swal.close();

          $('#triggerUpload').val('');
        }
      });
    }
});

Template.input.helpers({
    'toWhom': function(){
      let forUsers, forGroupsUsers;

      if (Session.get("group") == true){
        forGroupsUsers = Groups.findOne({_id: Session.get("groupId")});
      }
      else {
        forUsers = Meteor.users.findOne({_id: Session.get("messageReciever")[0]});
      }

      return forUsers ? forUsers.username :
      (Session.get("global") == true) ? "Global" :
      forGroupsUsers ? forGroupsUsers.name : ""
    }
  })
