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

const UserValidation = require('../../validations/user.validation');
const UserNotificationSettingValidation = require('../../validations/user.notification.setting.validation');
const FoodValidation = require('../../validations/food.validation');
const KitchenOwnerValidation = require('../../validations/kitchen.owner.validation');

const UserController = require('../../controllers/user.controller');
const UserNotificationSettingController = require('../../controllers/user.notification.setting.controller');
const UserDeleteAccountReasonController = require('../../controllers/user.delete.account.reason.controller');
const FoodController = require('../../controllers/food.controller');
const KitchenOwnerController = require('../../controllers/kitchen.owner.controller');
const NotificationListController = require('../../controllers/notification.list.controller');

module.exports.register = function register(route) {
  // Kitchen Profile Routes //
  route({
    method: 'GET',
    url: '/profile/me/:uid',
    preHandler: [
      appAuth('kitchen_owner_detail'),
      validate(UserValidation.getKitchenOwnerProfileValidation),
    ],
    handler: UserController.kitchenOwnerProfile,
  });
  route({
    method: 'PATCH',
    url: '/profile/update/:id',
    preHandler: [
      appAuth('update_kitchen_owner_detail'),
      validate(UserValidation.updateKitchenOwnerValidation),
    ],
    handler: UserController.updateKitchenOwnerProfile,
  });
  // Kitchen Profile Routes //

  // Foods Routes //
  route({
    method: 'GET',
    url: '/food_list/:id',
    preHandler: [
      appAuth('food_list'),
      validate(FoodValidation.kitchenOwnerFoodListValidation),
    ],
    handler: FoodController.kitchenOwnerFoodList,
  });
  route({
    method: 'GET',
    url: '/foods/kitchen_food_detail/:id/:owner',
    preHandler: [
      appAuth('kitchen_food_detail'),
      validate(FoodValidation.kitchenOwnerFoodDetailValidation),
    ],
    handler: FoodController.kitchenOwnerFoodDetail,
  });
  route({
    method: 'PATCH',
    url: '/foods/update_meta_detail/:foodId',
    preHandler: [
      appAuth('update_food'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.updateMetaInfo,
  });
  route({
    method: 'GET',
    url: '/foods/addon_list/:owner',
    preHandler: [
      appAuth('kitchen_food_detail'),
      validate(FoodValidation.kitchenOwnerAddonValidation),
    ],
    handler: FoodController.kitchenOwnerAddonList,
  });
  route({
    method: 'PATCH',
    url: '/foods/update/:id/:owner',
    preHandler: [
      appAuth('update_food'),
      validate(FoodValidation.kitchenUpdateStockValidation),
    ],
    handler: FoodController.kitchenOwnerUpdateFood,
  });
  // Foods Routes //

  // Orders Routes //
  route({
    method: 'POST',
    url: '/orders/list',
    preHandler: [
      appAuth('order_list'),
      validate(KitchenOwnerValidation.kitchenOrderValidation),
    ],
    handler: KitchenOwnerController.kitchenOrder,
  });
  route({
    method: 'PATCH',
    url: '/orders/prepare/:order/:owner',
    preHandler: [
      appAuth('prepare_order'),
      validate(KitchenOwnerValidation.prepareKitchenOrderValidation),
    ],
    handler: KitchenOwnerController.preparingKitchenOrder,
  });
  route({
    method: 'PATCH',
    url: '/orders/complete/:order/:owner',
    preHandler: [
      appAuth('complete_order'),
      validate(KitchenOwnerValidation.completeKitchenOrderValidation),
    ],
    handler: KitchenOwnerController.completeKitchenOrder,
  });
  route({
    method: 'GET',
    url: '/orders/order_detail/:order/:owner',
    preHandler: [
      appAuth('kitchen_order_detail'),
      validate(KitchenOwnerValidation.kitchenOrderDetailValidation),
    ],
    handler: KitchenOwnerController.kitchenOrderDetail,
  });
  // Orders Routes //

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
    url: '/delete_account_reason_list',
    preHandler: [appAuth('delete_account_reason_list')],
    handler: UserDeleteAccountReasonController.getKitchenActionReason,
  });
  route({
    method: 'POST',
    url: '/account_setting/delete_account',
    preHandler: [
      appAuth('delete_account'),
      validate(UserValidation.deleteUserAccountValidation),
    ],
    handler: UserController.kitchenDeleteAccount,
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

  // Notification Routes //
  route({
    method: 'POST',
    url: '/notification/list/',
    preHandler: [
      appAuth('notification_list'),
      validate(UserValidation.notificationListValidation),
    ],
    handler: NotificationListController.getMyNotificationList,
  });
  route({
    method: 'GET',
    url: '/notification/readAll/:user',
    preHandler: [
      appAuth('mark_all_read'),
      validate(UserValidation.idValidation),
    ],
    handler: NotificationListController.readAllNotification,
  });
  // Notification Routes //
};
