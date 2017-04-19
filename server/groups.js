Meteor.methods({
	createGroup: function(doc){
		if (Groups.findOne({name: doc})){
			throw new Meteor.Error( 500, 'Exista deja un grup cu numele acesta.');
		}
		Groups.insert({
			name: doc,
			owner: Meteor.userId(),
			users: []
		})
	},
	removeGroup: function(doc){
		if (doc.owner == Meteor.userId()){
			Messages.find({groupId: doc._id}).fetch().map(function(mesaj){
				Messages.remove({_id: mesaj._id});
			})
			Groups.remove({
				_id: doc._id
			})
		}
	},
	addUserToMyGroup: function(doc){
		if (!Groups.findOne({owner: Meteor.userId()})){
			throw new Meteor.Error( 501, 'Nu aveti un grup in care sa introduceti userul.');
		}
		var group = Groups.findOne({owner: Meteor.userId()})
		var usersArray = group.users;
		usersArray.push(doc._id);

		Groups.update({_id: group._id}, {
			$set: {
				users: usersArray
			}
		})

		const user = Meteor.users.findOne({_id: doc._id}).username;

		Messages.insert({
			 name: "System",
			 time: Date.now(),
			 sender: Meteor.userId(),
			 message: "User " + user.toUpperCase() + " has been added to the group.",
			 reciever: group.users,
			 group: true,
			 groupId: group._id
		});
	},
	leaveGroup: function(id){
		if (!Groups.findOne({_id: id})) {
			throw new Meteor.Error(502, 'Grupul pe care doriti sa-l parasiti nu exista.');
		}
		var group = Groups.findOne({_id: id});
		var usersArray = group.users;
		usersArray.splice(usersArray.indexOf(Meteor.userId()), 1);

		Groups.update({_id: id}, {
			$set: {
				users: usersArray
			}
		})

		const user = Meteor.user().username;

		Messages.insert({
      name: "System",
      time: Date.now(),
      sender: Meteor.userId(),
      message: "User " + user.toUpperCase() + " has left the group.",
      reciever: group.users,
      group: true,
      groupId: group._id
    });
	}
});
