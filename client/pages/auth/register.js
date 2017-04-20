Template.register.onCreated(function(){
  $('html, body').css({
    'background':'none',
    'background-color':'#E0E0E0'
  })
});

Template.register.rendered = function(){
  if (window.innerHeight < 768) {
    toastr.options = {
      "positionClass": "toast-bottom-center"
    }
  }
  $('#valid').validate({
    rules : {
      email : {
        required: true,
        email: true
      },
      username : {
        required: true,
        minlength: 3,
        maxlength: 25
      },
      password : {
        required: true
      },
      passwordConf : {
        required: true
      }
    },
    messages : {
      email : {
        required: "Please enter your email address.",
        email: "Please enter a valid email address."
      },
      username : {
        required: "Please enter an username.",
        minlength: "At least 3 characters required.",
        maxlength: "Maximum number of characters is 25."
      },
      password : {
        required: "Please enter a password."
      },
      passwordConf : {
        required: "Please confirm your password."
      }
    }
  })
};

Template.register.events({
  'click #MyLogin': function(){
    Router.go('/login');
  },
  'submit .register-form' : function(e, t){
  e.preventDefault();
  // retrieve the input field values
  const email = t.find('#register-email').value
    , password = t.find('#register-password').value
    , confPassword = t.find('#register-passwordConf').value
    , username = t.find('#register-username').value

    if (password.length < 6){
      toastr.error("Lungimea parolei este prea mica!", "ERROR!");
    }
    else if (password != confPassword) {
      toastr.error("Cele doua parole introduse nu se potrivesc ", "ERROR");
    }
    else {
      //RANDOM COLOR GENERATOR FOR EACH USER.
      const letters = '0123456789ABCDEF'.split('');
      let color = '#';

      for (let i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      Accounts.createUser({
        email,
        username,
        password,
        color
      }, function(err){
        if (err){
          if (err.reason){
            toastr.error(err.reason, "ERROR");
          }
          else {
            toastr.error("Internal Server Error!", "ERROR");
          }
        } else {
          toastr.info("Utilizatorul " + username + " a fost creat.", "SUCCESS")
          Router.go('/');
        }
      });
    }

    return false;
  }
});
