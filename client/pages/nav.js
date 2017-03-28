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
    Router.go('/logout');

  }
});
