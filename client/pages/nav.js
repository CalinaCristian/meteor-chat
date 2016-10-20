Template.nav.events({
  'click .m':function(){
    Router.go('/members');
  },
  'click .h':function(){
  	Router.go('/');
  },
  'click .c':function(){
  	Router.go('/chat');
  },
  'click .r': function(){
  	Router.go('/login');
  },
  'click #logout': function(e){
    e.preventDefault();
    var user = Meteor.user().username;
    Meteor.logout();
    toastr.info("Utilizatorul " + user + " a fost delogat cu succes !", "SUCCESS");
    setTimeout(function(){
      Router.go('/login');
    },1000);
    
  }
});