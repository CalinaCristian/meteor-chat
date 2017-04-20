Template.user_loggedIn.helpers({
  getUserName: function(){
    const username = Meteor.user().username.split(" ")[0];

    if ((username.length > 6) && (window.innerWidth < 420)) {
      return username.substring(0, 4) + "..";
    }
    return username;
  },
  getDisplay: function() {
    if (window.innerWidth < 340) {
      return "none";
    }
    return "initial";
  }
});
