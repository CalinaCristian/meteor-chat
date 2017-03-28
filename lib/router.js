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
		this.render('register');
		fastRender: true;
	}
});
Router.route('/logout', {
	action: function(){
		if (!Meteor.user()) {
      Router.go('/login');
		}
		else {
			var user = Meteor.user().username;
	    Meteor.logout();
	    toastr.info("Utilizatorul " + user + " a fost delogat cu succes !", "SUCCESS");
	    setTimeout(function(){
	      Router.go('/login');
	    },1000);
		}
	}
})
