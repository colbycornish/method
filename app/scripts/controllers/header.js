/**
 * @ngdoc function
 * @name methodApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the methodApp
 */

angular.module('Volusion.controllers')
	.controller('HeaderCtrl', ['$rootScope', '$scope', '$timeout', '$filter', 'translate', 'vnCart', 'vnContentManager', 'vnAppConfig', 'vnSearchManager', 'snapRemote',
		function ($rootScope, $scope, $timeout, $filter, translate, vnCart, vnContentManager, vnAppConfig, vnSearchManager, snapRemote) {

			'use strict';

            $scope.showSearchMobile = true;
            $scope.showSearchDesktop = false;
            $scope.searchLocal = vnSearchManager.getSearchText() || '';

			$scope.device = $rootScope.device;

            translate.addParts('common');
			translate.addParts('header');

			$scope.getCartItemsCount = function () {
				return vnCart.getCartItemsCount();
			};

			$rootScope.snapToggle = function (side) {
				if ($scope.device.info.shortname === 'desktop') {
					snapRemote.toggle(side);
				} else {
					snapRemote.getSnapper().then(function(snapper) {
						if(side === snapper.state().state) {
							snapper.close();
						} else {
							snapper.expand(side);
						}
					});
				}
			};

			$rootScope.openLeftNav = function(){
				$rootScope.closeCart();
				snapRemote.getSnapper().then(function(snapper) {
					snapper.open('left');
				});
			};

			$scope.$watch(
				function () {
					return vnContentManager.getHeaderState();
				},
				function (state) {
					$scope.headerState = state;
				}, true);

			$scope.$watch(
				function () {
					return vnContentManager.getCheckoutHeaderState();
				},
				function (state) {
					$scope.checkoutHeaderState = state;
				}, true);

		}]);
