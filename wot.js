(function () {
	'use strict';

	angular.module('app', ['irontec.simpleChat']);

	angular.module('app').controller('Shell', Shell);
	Shell.$inject = ['$scope', 'authFactory'];
	function Shell($scope, authFactory) {

		var vm = this;
		vm.database = setupFirebase();
		vm.messages = [];
		vm.loggedIn = false;
		vm.loginError = false;
		var chatMessages = localStorage.getItem('chat-messages');

		if (chatMessages != null) {
			JSON.parse(localStorage.getItem('chat-messages') || []).forEach(function (value) {
				vm.messages.push({
					'username': value.username,
					'content': value.content
				});
			});
		}
		var chats = vm.database.ref('/chats');
		chats.on('value', function (updatedChats) {
			vm.messages.length = 0;
			getMessageObjects(updatedChats);
			localStorage.setItem('chat-messages', JSON.stringify(vm.messages));
			$scope.$apply();
		});

		vm.username = 'Matt';

		vm.sendMessage = function (message, username) {
			if (message && message !== '' && username) {
				vm.messages.push({
					'username': username,
					'content': message
				});
			}
		};

		vm.syncMessage = function (message, username) {
			var chat = vm.database.ref('/chats').push();
			chat.set({
				'username': username,
				'content': message
			});
		};

		vm.login = function (username, password) {
			authFactory.getToken().then(
				function (response) {

					if (!response.data.error) {
						var token = response.data.access_token;
						authFactory.userLogin(token, username, password).then(
							function (response) {
								console.log(response.data.error);
							},
							function (response) {
								console.log(response.status);
								console.log(response);
							}
						);
					} else {
						vm.loginError = true;
					}

				},
				function (response) {
					vm.loginError = true;
				}
			);
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

		function getMessageObjects(updatedChats) {
			updatedChats.forEach(function (message) {
				var value = message.val();
				vm.messages.push({
					'username': value.username,
					'content': value.content
				});
			});
		}

	}

})();
