Router.onBeforeAction(function () {
  // all properties available in the route function
  // are also available here such as this.params
  Meta.config({
    options: {
      title: "Calina Instant Messenger",
      suffix: ""
    }
  });

  Meta.setTitle("");

  if (!Meteor.userId() && this.url === '/'){
  	this.render('login');
  }
  else if (!Meteor.userId() && (this.url !== '/register') && (this.url !== '/login')) {
    this.render('notFound');
  } else {
    // otherwise don't hold up the rest of hooks or our route/action function
    // from running
    this.next();
  }
});

Router.configure({
  notFoundTemplate: 'notFound'
});


Router.route('/', {
	waitOn: function(){
		Meteor.subscribe('users');
	},
	action: function(){
		this.render('introPage');
		fastRender: true;
	}
}),
Router.route('/members', {
	waitOn: function(){
		Meteor.subscribe('users');
	},
	action: function(){
		this.render('members');
		fastRender: true;
	}
}),
Router.route('/chat', {
	waitOn: function(){
		Meteor.subscribe('users');
		Meteor.subscribe('groups');
		if (Meteor.userId()){
			return Meteor.subscribe('messages');
		}
	},
	data: function(){
		return Messages.find({}, { sort: { time: 1}});
	},
	action: function(){
		this.render('chat');
		fastRender: true;
	}
});
Router.route('/login', {
	action: function(){
		if (!Meteor.user()) {
			this.render('login');
		}
		else {
			Router.go('/');
		}
		fastRender: true;
	}
});
Router.route('/register', {
	action: function(){
    if (!Meteor.user()) {
  		this.render('register');
    }
    else {
      Router.go('/');
    }
		fastRender: true;
	}
});
Router.route('/logout', {
	action: function(){
		const user = Meteor.user() && Meteor.user().username;

    Meteor.logout();
    user && toastr.info("Utilizatorul " + user + " a fost delogat cu succes !", "SUCCESS");
    Router.go('/');
	}
})
