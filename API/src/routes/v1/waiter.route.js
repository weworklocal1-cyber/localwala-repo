/**
 * LocalWala – Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * WeWorkLocal Private Limited
 *
 * This source code is confidential.
 * Unauthorized copying, redistribution, resale, publication,
 * modification, or use of this source code in any public or
 * commercial repository is strictly prohibited.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 */

const appAuth = require('../../middlewares/appAuth');
const validate = require('../../middlewares/validate');

const WaiterValidation = require('../../validations/waiter.validation');
const RestaurantTableValidation = require('../../validations/restaurant.table.validation');
const TableOrderCartItemValidation = require('../../validations/table.order.cart.item.validation');
const AuthValidation = require('../../validations/auth.validation');
const UserNotificationSettingValidation = require('../../validations/user.notification.setting.validation');
const UserValidation = require('../../validations/user.validation');

const FoodController = require('../../controllers/food.controller');
const RestaurantTableController = require('../../controllers/restaurant.table.controller');
const WaiterController = require('../../controllers/waiter.controller');
const TableOrderCartItemController = require('../../controllers/table.order.cart.item.controller');
const AuthController = require('../../controllers/auth.controller');
const UserNotificationSettingController = require('../../controllers/user.notification.setting.controller');
const UserController = require('../../controllers/user.controller');
const UserDeleteAccountReasonController = require('../../controllers/user.delete.account.reason.controller');

module.exports.register = function register(route) {
  route({
    method: 'GET',
    url: '/profile/user/:id',
    preHandler: [
      appAuth('waiter_profile'),
      validate(AuthValidation.profileValidation),
    ],
    handler: AuthController.getMyProfile,
  });
  route({
    method: 'PATCH',
    url: '/profile/update/:id',
    preHandler: [
      appAuth('update_waiter_profile'),
      validate(AuthValidation.updateProfileValidation),
    ],
    handler: AuthController.updateMyProfile,
  });
  route({
    method: 'GET',
    url: '/foods/foodList/:restaurant',
    preHandler: [
      appAuth('foodList'),
      validate(WaiterValidation.foodListValidation),
    ],
    handler: FoodController.getRestaurantFoodFromWaiter,
  });
  route({
    method: 'GET',
    url: '/restaurant/tableList/:vendor',
    preHandler: [
      appAuth('restaurantTableList'),
      validate(RestaurantTableValidation.waiterTableListValidation),
    ],
    handler: RestaurantTableController.waiterTableList,
  });
  route({
    method: 'GET',
    url: '/foodListForOrder/:vendor',
    preHandler: [
      appAuth('waiterFoodListForOrders'),
      validate(WaiterValidation.foodListForOrderValidation),
    ],
    handler: WaiterController.waiterFoodList,
  });
  route({
    method: 'GET',
    url: '/waiterInitialFoodSearch/:vendor',
    preHandler: [
      appAuth('waiterInitialFoodSearch'),
      validate(WaiterValidation.waiterInitialFoodValidation),
    ],
    handler: WaiterController.waiterFoodSearchInitialData,
  });
  route({
    method: 'GET',
    url: '/waiterFoodSearch/:vendor/:searchQuery',
    preHandler: [
      appAuth('waiterFoodSearch'),
      validate(WaiterValidation.waiterFoodSearchValidation),
    ],
    handler: WaiterController.waiterFoodSearch,
  });
  route({
    method: 'POST',
    url: '/addItemToCart/',
    preHandler: [
      appAuth('addItemToCart'),
      validate(TableOrderCartItemValidation.addItemToCartValidation),
    ],
    handler: TableOrderCartItemController.addItemToCart,
  });
  route({
    method: 'GET',
    url: '/ongoingTableOrder/:vendor/:tableId',
    preHandler: [
      appAuth('ongoingTableOrder'),
      validate(TableOrderCartItemValidation.ongoingTableItemValidation),
    ],
    handler: TableOrderCartItemController.ongoingTableItems,
  });

  // Account Settings Routes//
  route({
    method: 'PATCH',
    url: '/account_setting/update_password/:id',
    preHandler: [
      appAuth('update_password'),
      validate(UserValidation.updatePasswordValidation),
    ],
    handler: UserController.updatePassword,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_email/:id',
    preHandler: [
      appAuth('update_email'),
      validate(UserValidation.updateEmailValidation),
    ],
    handler: UserController.updateEmail,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_email_after_verification/:id',
    preHandler: [
      appAuth('update_email'),
      validate(UserValidation.updateEmailAfterVerificationValidation),
    ],
    handler: UserController.updateEmailAfterVerification,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_mobile_number/:id',
    preHandler: [
      appAuth('update_mobile_number'),
      validate(UserValidation.updateMobileValidation),
    ],
    handler: UserController.updateMobileNumber,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_mobile_number_after_verification/:id',
    preHandler: [
      appAuth('update_mobile_number'),
      validate(UserValidation.updateMobileAfterVerificationValidation),
    ],
    handler: UserController.updateMobileAfterVerification,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_mobile_number_after_firebase_verification/:id',
    preHandler: [
      appAuth('update_mobile_number'),
      validate(UserValidation.updateMobileAfterFirebaseVerificationValidation),
    ],
    handler: UserController.updateMobileAfterFirebaseVerification,
  });
  route({
    method: 'GET',
    url: '/account_setting/notification_setting/:id',
    preHandler: [
      appAuth('notification_setting'),
      validate(UserNotificationSettingValidation.idValidation),
    ],
    handler: UserNotificationSettingController.getNotificationSettings,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/notification_setting/:id',
    preHandler: [
      appAuth('notification_setting'),
      validate(UserNotificationSettingValidation.updateSettingValidation),
    ],
    handler: UserNotificationSettingController.updateNotificationSetting,
  });
  route({
    method: 'GET',
    url: '/delete_account_reason_list',
    preHandler: [appAuth('delete_account_reason_list')],
    handler: UserDeleteAccountReasonController.geWaiterActiveReason,
  });
  route({
    method: 'POST',
    url: '/account_setting/delete_account',
    preHandler: [
      appAuth('delete_account'),
      validate(UserValidation.deleteUserAccountValidation),
    ],
    handler: UserController.waiterDeleteAccount,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_locale/',
    preHandler: [
      appAuth('update_locale'),
      validate(UserValidation.updateLocaleValidation),
    ],
    handler: UserController.updateUserLocale,
  });
  // Account Settings Routes//
};
