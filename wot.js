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
		if (localStorage.getItem('wot-username')) {
			vm.loggedIn = true;
			vm.username = localStorage.getItem('wot-username');
			vm.employeename = localStorage.getItem('wot-empname');
		}
        vm.loginError = false;
        var chatMessages = localStorage.getItem('chat-messages');

        var hashTable = {
            'HR': ['employee_1', 'employee_2'],
            'Account': ['employee_3', 'employee_2'],
            'Manager': ['employee_4', 'employee_1', 'employee_5'],
        };

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
                apiKey: "AIzaSyCRFBUPohPbIL3otszLBr3MQPp5bPXU04I",
                authDomain: "hackathon-d2f81.firebaseapp.com",
                databaseURL: "https://hackathon-d2f81.firebaseio.com/",
                projectId: "hackathon-d2f81",
                storageBucket: "hackathon-d2f81.appspot.com",
                messagingSenderId: "712027018772"
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

        var message = function ($id, $receiver, $username, $content) {
            this.id = $id;
            this.receiver = $receiver;
            this.username = $username;
            this.content = $content;
            this.date = $timeStamp;

        }

        function refactor(msg, username) {
            if (msg.length <= 0) {
                return null;
            }
            var temp = [];
            var keywords = msg.split("#");

            angular.forEach(keywords, function (value, key) {
                if (key != 0) {
                    temp = temp.concat(hashTable[value]);
                } else {
                    msg = value;
                }
            });

            temp = arrayUnique(temp);
            return new message('1', temp, username, msg);
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
            var receiverList = messageObject.receiver;
            if (messageObject.username === vm.username || (receiverList != undefined && receiverList.indexOf(vm.username) > -1)) {
                return true;
            } else {
                return false;
            }
        }

    }

})();
