(function() {
  'use strict';

  angular.module('app', ['irontec.simpleChat']);

  angular.module('app').controller('Shell', Shell);

  function Shell($scope) {

    var vm = this;
    vm.database = setupFirebase();
    vm.messages = [];

    var chats = vm.database.ref('/chats');
    chats.on('value', function(updatedChats) {
	vm.messages.length = 0;
	updatedChats.forEach(function(message) {
	    var value = message.val();
	    vm.messages.push({
		'username': value.username,
       		'content': value.content
	    });
	});
	$scope.$apply();	
    });

    vm.username = 'Matt';

    vm.sendMessage = function(message, username) {
      if(message && message !== '' && username) {
        vm.messages.push({
          'username': username,
          'content': message
        });
      }
    };

    vm.syncMessage = function(message, username) {
	var chat = vm.database.ref('/chats').push();
	chat.set({
    	    'username': username,
    	    'content': message
 	});
    };

    function setupFirebase() {
	    var config = {
	apiKey: "AIzaSyAgWGcekF_2zb2wOajz15J4TLWl-e-NaN4",
	authDomain: "orange-wot.firebaseapp.com",
	databaseURL: "https://orange-wot.firebaseio.com",
	projectId: "orange-wot",
	storageBucket: "orange-wot.appspot.com",
	messagingSenderId: "785108208926"
	    };

	    firebase.initializeApp(config);
	return firebase.database();
    }

  }

})();
