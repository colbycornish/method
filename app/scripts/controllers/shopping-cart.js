/**
 * @ngdoc function
 * @name methodApp.controller:ShoppingCartCtrl
 * @description
 * # ShoppingCartCtrl
 * Controller of the methodApp
 */

angular.module('Volusion.controllers')
	.controller('ShoppingCartCtrl', ['$rootScope', '$scope', '$timeout', '$filter', '$window', 'translate', 'vnCart', 'notifications',
		function ($rootScope, $scope, $timeout, $filter, $window, translate, vnCart, notifications) {

			'use strict';

			$scope.cart = {};
			$scope.cartEmpty = true;
			$scope.calcSubtotal = 0;
			$scope.coupon = {
				'code' : '',
				'showApply' : false
			};
			$scope.couponsEmpty = false;
			$scope.loading = false;
			$scope.showGiftOption = false;
			$scope.visualCue = false;
			$rootScope.isCartOpen = false;

			translate.addParts('shopping-card');

			$rootScope.exitCartState = function () {
				history.back();
			};

			function updateCart(showSpinner, callback) {
				$scope.loading = showSpinner ? true : false;
				vnCart.updateCart()
					.then(function () {
						if (callback !== undefined && typeof callback === 'function') {
							callback();
						}
					});
			}

			$scope.getCartItemsCount = function () {
				return vnCart.getCartItemsCount();
			};

			$scope.deleteItem = function (id) {
				$scope.cart.items = $filter('filter')($scope.cart.items, function (item) {
					return item.id !== id;
				});

				updateCart(true);
			};

			$scope.changeQty = function (item, amount, timeout) {
				item.qty = (item.qty === '') ? 1 : amount;

				$timeout.cancel($scope.debounceUpdateCart);

				if(timeout === undefined){
					updateCart(false);
				}
				else{
					$scope.debounceUpdateCart = $timeout(function(){
						updateCart(false);
					}, timeout);
				}
			};

			$scope.resetGiftOptions = function () {

				// ng-change transcludes the scope of the input so the [changed] model
				// is available into child scope [this]
				if ($scope.cart.misc.isGift) {
					// Gift options are shown - show vusual cue
					$scope.visualCue = true;

					$timeout(function () {
						$scope.visualCue = false;
					}, 3000);

					return;
				}

				angular.forEach($scope.cart.items, function (item) {
					if (item.isGiftWrapAvailable) {
						if (item.giftWrap.selected) {
							item.giftWrap.selected = false;
						}
					}
				});

				updateCart(true);
			};

			$scope.addGiftWrap = function () {
				updateCart(false);
			};

			$scope.addGiftMsg = function () {
				updateCart(false);
			};

			$scope.applyCoupon = function () {
				if($scope.coupon.code.length > 0){
					$scope.cart.discounts = $filter('filter')($scope.cart.discounts, function (coupon) {
						return coupon.couponCode !== $scope.coupon.code;
					});

					$scope.cart.discounts.push({ 'couponCode': $scope.coupon.code });

					updateCart(true, function () {
						$scope.coupon.showApply = false;
						$scope.coupon.code = '';
						if ($scope.cart.serviceErrors.length === 0 && $scope.cart.warnings.length === 0) {
							$scope.togglePromoList(true);
						}
					});
				}
			};

			$scope.deleteCoupon = function (id) {
				$scope.cart.discounts = $filter('filter')($scope.cart.discounts, function (coupon) {
					return coupon.id !== id;
				});

				$scope.couponsEmpty = ($scope.cart.discounts.length > 0) ? false : true;

				updateCart(true);
			};

			$rootScope.$on('cartUpdated', function(){
				$scope.cart = vnCart.getCart();

				if ($scope.cart.warnings && $scope.cart.warnings.length > 0 ||
					$scope.cart.serviceErrors && $scope.cart.serviceErrors.length > 0) {
					notifications.displayWarnings($scope.cart.warnings);
					notifications.displayErrors($scope.cart.serviceErrors);
					$rootScope.$emit('vnScroll.cart');
				}

				if($scope.cart !== undefined){
					if ($scope.cart.totals !== undefined) {
						$scope.calcSubtotal = $scope.cart.totals.items + $scope.cart.totals.discounts + $scope.cart.totals.giftWrap;
						$scope.cartEmpty = ($scope.cart.totals.qty > 0) ? false : true;
					}

					if ($scope.cart.discounts !== undefined) {
						$scope.couponsEmpty = ($scope.cart.discounts.length > 0) ? false : true;
					}

					if ($scope.cart.items !== undefined) {
						// set gift option if any item has gift wrap selected
						for (var i = 0; i < $scope.cart.items.length; i++) {
							if ($scope.cart.items[i].giftWrap.selected) {
								$scope.showGiftOption = true;
							}
						}
					}
				}
				
				$scope.loading = false;
			});
			
		}]);