Template.login.onCreated(function(){
	$('html, body').css({
		'background':'none',
		'background-color':'#E0E0E0'
	})
});

Template.login.rendered = function(){
  $('#valid').validate({
    rules : {
      usernameOrEmail : {
        required: true
      },
      password : {
        required: true
      }
    },
    messages : {
      usernameOrEmail : {
        required: "Please enter your username or email.",
      },
      password : {
        required: "Please enter a password."
      }
    }
  })
};

Template.login.events({
	'click .MyRegister': function(){
		Router.go('/register');
	},
	'submit .login-form' : function(e, t){
    e.preventDefault();
    // retrieve the input field values
    var password = t.find('#login-password').value
      , usernameOrEmail = t.find('#login-usernameOrEmail').value

      // Trim and validate your fields here.... 

      // If validation passes, supply the appropriate fields to the
      // Meteor.loginWithPassword() function.
      Meteor.loginWithPassword(usernameOrEmail, password, function(err){
	      if (err){
	      	if (err.reason){
	      		toastr.error(err.reason, "ERROR");
	      	}
	      	else {
	      		toastr.error("Internal Server Error!", "ERROR");
	      	}
	      }
	      else{
	      	toastr.info("Utilizatorul " + Meteor.user().username + 
	      		" a fost autentificat cu succes !", "SUCCESS" );
	        Router.go('/');
	      }
	    });
      return false; 
    }
});
