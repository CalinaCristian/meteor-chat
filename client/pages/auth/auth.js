Template.user_loggedIn.helpers({
  getUserName: function(){
    const username = Meteor.user().username.split(" ");

    if (window.innerWidth < 500) {
      return username[0];
    }
    return username.join(" ");
  },
  getDisplay: function() {
    if (window.innerWidth < 420) {
      return "none";
    }
    return "initial";
  }
});
