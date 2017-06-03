(function () {
	'use strict';

	angular.module('irontec.simpleChat', []);
	angular.module('irontec.simpleChat').directive('irontecSimpleChat', ['$timeout', SimpleChat]);

	angular.module('irontec.simpleChat').directive('loginForm', [SimpleLogin]);

	function SimpleLogin() {
		return {
			restrict: 'E',
			scope: {
				submitFunction: '&',
				loginStatus: '='
			},
			template: '<div class="row"> <div class="col-xs-12"> <form name="loginForm"> <div class="form-group"> <label for="username">Username</label> <input type="text" name="username" ng-model="username" required="required" class="form-control"/> </div> <div class="form-group"> <label for="password">Password</label> <input type="password" name="password" ng-model="password" required="required" class="form-control"/> </div> <button type="submit" ng-disabled="!loginForm.$valid" ng-class="{\'btn-default\':!loginForm.$valid,\'btn-success\':loginForm.$valid}" ng-click="login()" class="btn btn-sm chat-submit-button">Login</button> <span ng-show="loginError && !loginForm.$valid" class="label label-danger"> <b>Error With Login</b> Please try again. </span></form> </div> </div>',
			replace: 'true',
			controller: LoginCtrl

		}
	}

	LoginCtrl.$inject = ['$scope'];

	function LoginCtrl($scope) {
		$scope.loginError = $scope.loginStatus;
		$scope.login = function () {
			$scope.submitFunction()($scope.username, $scope.password);
		}
	}

	function SimpleChat($timeout) {
		var directive = {
			restrict: 'EA',
			templateUrl: 'chatTemplate.html',
			replace: true,
			scope: {
				messages: '=',
				username: '=',
				myUserId: '=',
				inputPlaceholderText: '@',
				submitButtonText: '@',
				title: '@',
				theme: '@',
				submitFunction: '&',
				visible: '=',
				infiniteScroll: '&',
				expandOnNew: '='
			},
			link: link,
			controller: ChatCtrl,
			controllerAs: 'vm'
		};

		function link(scope, element) {
			if (!scope.inputPlaceholderText) {
				scope.inputPlaceholderText = 'Write your message here...';

			}

			if (!scope.submitButtonText || scope.submitButtonText === '') {
				scope.submitButtonText = 'Send';
			}

			if (!scope.title) {
				scope.title = 'Chat';
			}

			scope.$msgContainer = $('.msg-container-base'); // BS angular $el jQuery lite won't work for scrolling
			scope.$chatInput = $(element).find('.chat-input');

			var elWindow = scope.$msgContainer[0];
			scope.$msgContainer.bind('scroll', _.throttle(function () {
				var scrollHeight = elWindow.scrollHeight;
				if (elWindow.scrollTop <= 10) {
					scope.historyLoading = true; // disable jump to bottom
					scope.$apply(scope.infiniteScroll);
					$timeout(function () {
						scope.historyLoading = false;
						if (scrollHeight !== elWindow.scrollHeight) // don't scroll down if nothing new added
							scope.$msgContainer.scrollTop(360); // scroll down for loading 4 messages
					}, 150);
				}
			}, 300));
		}

		return directive;
	}

	ChatCtrl.$inject = ['$scope', '$timeout'];

	function ChatCtrl($scope, $timeout) {
		var vm = this;

		vm.isHidden = false;
		vm.messages = $scope.messages;
		vm.username = $scope.username;
		vm.myUserId = $scope.myUserId;
		vm.inputPlaceholderText = $scope.inputPlaceholderText;
		vm.submitButtonText = $scope.submitButtonText;
		vm.title = $scope.title;
		vm.theme = 'chat-th-' + $scope.theme;
		vm.writingMessage = '';
		vm.panelStyle = { 'display': 'block' };
		vm.chatButtonClass = 'fa-angle-double-down icon_minim';

		vm.toggle = toggle;
		vm.close = close;
		vm.submitFunction = submitFunction;

		function submitFunction() {
			$scope.submitFunction()(vm.writingMessage, vm.username);
			vm.writingMessage = '';
			scrollToBottom();
		}

		$scope.$watch('visible', function () { // make sure scroll to bottom on visibility change w/ history items
			scrollToBottom();
			$timeout(function () {
				$scope.$chatInput.focus();
			}, 250);
		});
		$scope.$watch('messages.length', function () {
			if (!$scope.historyLoading) scrollToBottom(); // don't scrollToBottom if just loading history
			if ($scope.expandOnNew && vm.isHidden) {
				toggle();
			}
		});

		function scrollToBottom() {
			$timeout(function () { // use $timeout so it runs after digest so new height will be included
				$scope.$msgContainer.scrollTop($scope.$msgContainer[0].scrollHeight);
			}, 200, false);
		}

		function close() {
			$scope.visible = false;
		}

		function toggle() {
			if (vm.isHidden) {
				vm.chatButtonClass = 'fa-angle-double-down icon_minim';
				vm.panelStyle = { 'display': 'block' };
				vm.isHidden = false;
				scrollToBottom();
			} else {
				vm.chatButtonClass = 'fa-expand icon_minim';
				vm.panelStyle = { 'display': 'none' };
				vm.isHidden = true;
			}
		}
	}
})();
