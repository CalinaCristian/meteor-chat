Meteor.methods({
	addUserToFriends: function(added, adder){
		var addedUserRequests = Meteor.users.findOne({_id: added}).friendsRequests;
		var adderUserPendings = Meteor.users.findOne({_id: adder}).friendsAwaiting;

		addedUserRequests.push(adder);
		adderUserPendings.push(added);

		Meteor.users.update({_id: added}, {
			$set: {
				friendsRequests: addedUserRequests
			}
		});

		Meteor.users.update({_id: adder}, {
			$set: {
				friendsAwaiting: adderUserPendings
			}
		});
	},
	cancelAddUserToFriends: function(added, adder){
		var addedUserRequests = Meteor.users.findOne({_id: added}).friendsRequests;
		var adderUserPendings = Meteor.users.findOne({_id: adder}).friendsAwaiting;

		addedUserRequests.splice(addedUserRequests.indexOf(adder),1);
		adderUserPendings.splice(adderUserPendings.indexOf(added),1);

		Meteor.users.update({_id: added}, {
			$set: {
				friendsRequests: addedUserRequests
			}
		});

		Meteor.users.update({_id: adder}, {
			$set: {
				friendsAwaiting: adderUserPendings
			}
		});
	},
	acceptUserAdd: function(adder, added){
		var addedUserRequests = Meteor.users.findOne({_id: added}).friendsRequests;
		var adderUserPendings = Meteor.users.findOne({_id: adder}).friendsAwaiting;

		var addedUserFriends = Meteor.users.findOne({_id: added}).friends;
		var adderUserFriends = Meteor.users.findOne({_id: adder}).friends;

		addedUserFriends.push(adder);
		adderUserFriends.push(added);

		addedUserRequests.splice(addedUserRequests.indexOf(adder),1);
		adderUserPendings.splice(adderUserPendings.indexOf(added),1);

		Meteor.users.update({_id: added}, {
			$set: {
				friendsRequests: addedUserRequests,
				friends: addedUserFriends
			}
		});

		Meteor.users.update({_id: adder}, {
			$set: {
				friendsAwaiting: adderUserPendings,
				friends: adderUserFriends
			}
		});
	},
	declineUserAdd: function(adder, added){
		var addedUserRequests = Meteor.users.findOne({_id: added}).friendsRequests;
		var adderUserPendings = Meteor.users.findOne({_id: adder}).friendsAwaiting;

		addedUserRequests.splice(addedUserRequests.indexOf(adder),1);
		adderUserPendings.splice(adderUserPendings.indexOf(added),1);

		Meteor.users.update({_id: added}, {
			$set: {
				friendsRequests: addedUserRequests,
			}
		});

		Meteor.users.update({_id: adder}, {
			$set: {
				friendsAwaiting: adderUserPendings,
			}
		});
	},
	removeFriend: function(removed, remover){
		var removedUserFriends = Meteor.users.findOne({_id: removed}).friends;
		var removerUserFriends = Meteor.users.findOne({_id: remover}).friends;

		removedUserFriends.splice(removedUserFriends.indexOf(remover),1);
		removerUserFriends.splice(removerUserFriends.indexOf(removed),1);

		Meteor.users.update({_id: removed}, {
			$set: {
				friends: removedUserFriends
			}
		});

		Meteor.users.update({_id: remover}, {
			$set: {
				friends: removerUserFriends
			}
		});
	}
});