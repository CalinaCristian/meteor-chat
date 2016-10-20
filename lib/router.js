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
	action: function(){
		this.render('chat');
		fastRender: true;
	}
});
Router.route('/login', {
	action: function(){
		this.render('login');
		fastRender: true;
	}
});
Router.route('/register', {
	action: function(){
		this.render('register');
		fastRender: true;
	}
});