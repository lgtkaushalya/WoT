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
		vm.username = 'Matt';
		vm.showTypingSection = false;
		if (localStorage.getItem('wot-username')) {
			vm.loggedIn = true;
			vm.username = localStorage.getItem('wot-username');
			vm.employeename = localStorage.getItem('wot-empname');
		}
		vm.loginError = false;
		var chatMessages = localStorage.getItem('chat-messages');

		vm.hashTable = {
			'HR': ['employee_1', 'employee_2'],
			'Account': ['employee_3', 'employee_2'],
			'Manager': ['employee_4', 'employee_1', 'employee_5'],
		};

		if (chatMessages != null) {
			JSON.parse(localStorage.getItem('chat-messages') || []).forEach(function (value) {
				vm.messages.push(value);
			});
		}

		var chats = vm.database.ref('/threads');
		chats.on('value', function (updatedChats) {
			vm.messages.length = 0;
			getMessageObjects(updatedChats);
			localStorage.setItem('chat-messages', JSON.stringify(vm.messages));
			$scope.$apply();
		});

		vm.syncMessage = function (message, username) {
			var message = refactor(message, username);
			// var chat = vm.database.ref('/chats').push();
			// chat.set(message);
		};

		vm.initiateThread = function (threadId) {			
			vm.showTypingSection = true;
			vm.messages.length = 0;
			if (!threadId) {
				vm.thread = null;
				vm.threadId = vm.username + '_' + new Date().getTime();
			} else {
				vm.threadId = threadId;
				var dbRef = vm.database.ref('/threads');

				dbRef.once('value', function (values) {
					values.forEach(function (value) {
						temp = value.val();
						if (temp.id === vm.threadId) {
							vm.thread = temp;
							vm.threadKey = value.key;
							vm.messages = temp.messages;
						}
					});

				});
				vm.thread = vm.database.ref('/threads/' + threadId);
				vm.messages = vm.database.ref('/threads/' + threadId + '/messages').push();
			}
		}

		vm.login = function (username, password) {
			authFactory.getToken().then(
				function (response) {

					if (!response.data.error) {
						var token = response.data.access_token;
						authFactory.userLogin(token, username, password).then(
							function (response) {
								if (response.data.error) {
									vm.loginError = true;
								} else {
									if (response.data.login) {
										vm.loggedIn = true;
										var user = response.data.user;
										vm.username = user.userName.charAt(0).toUpperCase() + user.userName.slice(1);
										vm.employeename = user.employeeName;
										localStorage.setItem('wot-username', vm.username);
										localStorage.setItem('wot-empname', vm.employeename);
									}
								}
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
				apiKey: "AIzaSyDi-YHiXAEZEx5FIYiO8oLxpOOLTz_oRQg",
				authDomain: "orange-wot-e738e.firebaseapp.com",
				databaseURL: "https://orange-wot-e738e.firebaseio.com",
				projectId: "orange-wot-e738e",
				storageBucket: "orange-wot-e738e.appspot.com",
				messagingSenderId: "607271143051"
			};

			firebase.initializeApp(config);
			return firebase.database();
		}

		function getMessageObjects(updatedChats) {
			updatedChats.forEach(function (message) {
				var value = message.val();
				if (checkOwnership(value)) {
					vm.messages.push(value);
				}
			});
		}

		var coversation = function ($parties, $messages, $id, $oneToOne) {
			this.id = $id;
			this.parties = $parties;
			this.messages = $messages;
			this.oneToOne = $oneToOne;
		}

		var message = function ($id, $username, $content, $timeStamp) {
			this.id = $id;
			this.username = $username;
			this.content = $content;
			this.date = $timeStamp;
		}

		function refactor(msg, username) {
			if (msg.length <= 0) {
				return null;
			}
			var temp = '';
			var dbRef = vm.database.ref('/threads');
			var threadKey = "";
			var currentThread = "";
			var newThread = false;

			var miliseconds = new Date().getTime();
			var dateString = new Date();

			if (vm.thread) {
				currentThread = vm.thread;
			} else {
				currentThread = new coversation();
				currentThread.id = vm.threadId;

				var temp = [username];
				var keywords = msg.split("#");

				if (keywords.length > 1) {
					angular.forEach(keywords, function (value, key) {

						if (key != 0) {
							temp = temp.concat((vm.hashTable[value]));
						} else {
							msg = value;
						}
					});
				}

				temp = arrayUnique(temp);
				currentThread.parties = temp;
				currentThread.messages = [];
				currentThread.oneToOne = '1';
				currentThread.content = msg;
				currentThread.username = vm.username;
				currentThread.date = dateString;
				vm.database.ref('/threads/' + vm.threadId).set(currentThread);
				vm.thread = currentThread;
				newThread = true;
			}


			var msgObject = new message(miliseconds, vm.username, msg, dateString);
			vm.database.ref('/threads/' + vm.threadId + '/messages/' + miliseconds).set(msgObject);
		}

		function arrayUnique(array) {
			var a = array.concat();
			for (var i = 0; i < a.length; ++i) {
				for (var j = i + 1; j < a.length; ++j) {
					if (a[i] === a[j])
						a.splice(j--, 1);
				}
			}
			return a;
		}

		function checkOwnership(messageObject) {
			var receiverList = messageObject.parties;
			if (receiverList != undefined && receiverList.indexOf(vm.username) > -1) {
				return true;
			} else {
				return false;
			}
		}

		function pickRandomReceiver(receiverList) {
			var length = receiverList.length;
			if (length > 0) {
				var randomVal = Math.floor((Math.random() * (length - 1)))
				return [receiverList[randomVal]];
			} else {
				return [];
			}
		}
	}
})();
