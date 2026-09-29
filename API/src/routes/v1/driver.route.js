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

const DriverValidation = require('../../validations/driver.validation');
const OrdersValidation = require('../../validations/orders.validation');
const OrderDeliveryProofValidation = require('../../validations/order.delivery.proof.validation');
const UserValidation = require('../../validations/user.validation');
const ReviewRatingValidation = require('../../validations/review.ratings.validation');
const DeliverymanPayoutMethodValidation = require('../../validations/deliveryman.payout.method.validation');
const WalletValidation = require('../../validations/wallet.validation');
const WithdrawalRequestValidation = require('../../validations/withdrawal.request.validation');
const ChatRoomValidation = require('../../validations/chat.room.validation');
const UserNotificationSettingValidation = require('../../validations/user.notification.setting.validation');

const DriverController = require('../../controllers/driver.controller');
const RestaurantController = require('../../controllers/restaurant.controller');
const DriverOfflineMessageController = require('../../controllers/driver.offline.messages.controller');
const OrdersController = require('../../controllers/orders.controller');
const OrdersCancellationReasonController = require('../../controllers/order.cancellation.reason.controller');
const OrderDeliveryProofController = require('../../controllers/order.delivery.proof.controller');
const UserController = require('../../controllers/user.controller');
const ReviewRatingController = require('../../controllers/review.ratings.controller');
const DeliverymanPayoutMethodController = require('../../controllers/deliveryman.payout.method.controller');
const WithdrawalMethodController = require('../../controllers/withdrawal.method.controller');
const WalletController = require('../../controllers/wallet.controller');
const WithdrawalRequestController = require('../../controllers/withdrawal.request.controller');
const ChatRoomController = require('../../controllers/chat.room.controller');
const SupportChatRoomController = require('../../controllers/support.chat.room.controller');
const UserNotificationSettingController = require('../../controllers/user.notification.setting.controller');
const UserDeleteAccountReasonController = require('../../controllers/user.delete.account.reason.controller');
const NotificationListController = require('../../controllers/notification.list.controller');

module.exports.register = function register(route) {
  // Restaurant Routes //
  route({
    method: 'POST',
    url: '/restaurant/trending',
    preHandler: [
      appAuth('trendingRestaurantNearMe'),
      validate(DriverValidation.driverNearTrendingRestaurantValidation),
    ],
    handler: RestaurantController.driverNearTrendingRestaurant,
  });
  // Restaurant Routes //

  // Driver Offline Messages Routes //
  route({
    method: 'GET',
    url: '/driver_offline_messages/getMessagesList',
    preHandler: [appAuth('getOfflineMessages')],
    handler: DriverOfflineMessageController.getOfflineMessageList,
  });
  // Driver Offline Messages Routes //

  // Driver Routes //
  route({
    method: 'GET',
    url: '/drivers/goOffline/:uid/:reasonId',
    preHandler: [
      appAuth('goOffline'),
      validate(DriverValidation.goOfflineValidation),
    ],
    handler: DriverController.goOfflnie,
  });
  route({
    method: 'GET',
    url: '/drivers/goOnline/:uid',
    preHandler: [
      appAuth('goOnline'),
      validate(DriverValidation.goOnlineValidation),
    ],
    handler: DriverController.goOnline,
  });
  route({
    method: 'POST',
    url: '/updateMyGeoLocation',
    preHandler: [
      appAuth('updateMyLocation'),
      validate(DriverValidation.updateMyLocationValidation),
    ],
    handler: DriverController.updateMyLocation,
  });
  // Driver Routes //

  // Orders Route //
  route({
    method: 'GET',
    url: '/orders/newOrder/:driverId',
    preHandler: [
      appAuth('newOrders'),
      validate(OrdersValidation.driverValidation),
    ],
    handler: OrdersController.getDriverNewOrderList,
  });
  route({
    method: 'GET',
    url: '/cancellation/driver',
    preHandler: [appAuth('cancellationReason')],
    handler: OrdersCancellationReasonController.getDriverCancellationList,
  });
  route({
    method: 'POST',
    url: '/orders/acceptOrder',
    preHandler: [
      appAuth('acceptOrder'),
      validate(OrdersValidation.orderAcceptValidation),
    ],
    handler: OrdersController.driverAcceptOrder,
  });
  route({
    method: 'POST',
    url: '/orders/rejectOrder/',
    preHandler: [
      appAuth('rejectOrder'),
      validate(OrdersValidation.orderDriverRejectValidation),
    ],
    handler: OrdersController.driverRejectOrder,
  });
  route({
    method: 'GET',
    url: '/orders/activeOrder/:driverId',
    preHandler: [
      appAuth('activeOrder'),
      validate(OrdersValidation.driverValidation),
    ],
    handler: OrdersController.driverActiveOrder,
  });
  route({
    method: 'GET',
    url: '/orders/orderDetails/:id',
    preHandler: [
      appAuth('driverOrderDetails'),
      validate(OrdersValidation.orderIdValidation),
    ],
    handler: OrdersController.driverOrderDetails,
  });
  route({
    method: 'GET',
    url: '/orders/driverReachRestaurant/:id',
    preHandler: [
      appAuth('reachedRestaurant'),
      validate(OrdersValidation.orderIdValidation),
    ],
    handler: OrdersController.driverReachedRestaurant,
  });
  route({
    method: 'POST',
    url: '/orders/driverPickupOrder',
    preHandler: [
      appAuth('driverPickupOrder'),
      validate(OrdersValidation.orderPickupValidation),
    ],
    handler: OrdersController.driverPickupOrder,
  });
  route({
    method: 'POST',
    url: '/orders/driverReachCustomer',
    preHandler: [
      appAuth('reachedCustomer'),
      validate(OrdersValidation.driverReachedCustomerValidation),
    ],
    handler: OrdersController.driverReachedCustomer,
  });
  route({
    method: 'POST',
    url: '/orders/driverDeliverOrder',
    preHandler: [
      appAuth('driverDeliverOrder'),
      validate(OrdersValidation.driverDeliverOrderValidation),
    ],
    handler: OrdersController.driverDeliverOrder,
  });
  route({
    method: 'POST',
    url: '/orders/orderList/',
    preHandler: [
      appAuth('orderList'),
      validate(DriverValidation.orderListValidation),
    ],
    handler: OrdersController.driverOrderList,
  });
  // Orders Route //

  // Order Delivery Proof Routes //
  route({
    method: 'POST',
    url: '/proof/save',
    preHandler: [
      appAuth('saveProof'),
      validate(OrderDeliveryProofValidation.saveProof),
    ],
    handler: OrderDeliveryProofController.saveProof,
  });
  // Order Delivery Proof Routes //

  // Driver Profile Routes //
  route({
    method: 'GET',
    url: '/profile/me/:uid',
    preHandler: [
      appAuth('getDriverProfile'),
      validate(UserValidation.getDriverProfileValidation),
    ],
    handler: UserController.getMyDriverProfile,
  });
  route({
    method: 'PATCH',
    url: '/profile/update/:id',
    preHandler: [
      appAuth('updateDeliveryProfile'),
      validate(UserValidation.updateDeliverymanValidation),
    ],
    handler: UserController.updateDeliverymanProfile,
  });
  // Driver Profile Routes //

  // Review Routes //
  route({
    method: 'POST',
    url: '/reviews/deliveryman',
    preHandler: [
      appAuth('getDeliverymanReviewList'),
      validate(ReviewRatingValidation.getDeliverymanReviewValidation),
    ],
    handler: ReviewRatingController.getDeliverymanReviewList,
  });
  // Review Routes //

  // Deposite Routes //
  route({
    method: 'GET',
    url: '/depositeDetail/:deliveryman',
    preHandler: [
      appAuth('depositeDetail'),
      validate(DriverValidation.getDeliveryDepositeDetailValidation),
    ],
    handler: DriverController.getDeliveryDepositeDetail,
  });
  // Deposite Routes //

  // Payout Method Routes //
  route({
    method: 'GET',
    url: '/payoutMethod/list',
    preHandler: [appAuth('payoutMethodList')],
    handler: WithdrawalMethodController.withdrawalMethodListDeliveryman,
  });
  route({
    method: 'POST',
    url: '/payoutMethod/createPayoutMethod',
    preHandler: [
      appAuth('createPayoutMethod'),
      validate(DeliverymanPayoutMethodValidation.createPayoutMethodValidation),
    ],
    handler: DeliverymanPayoutMethodController.create,
  });
  route({
    method: 'GET',
    url: '/payoutMethod/myPayoutList/:deliveryman',
    preHandler: [
      appAuth('getPayoutMethodList'),
      validate(DeliverymanPayoutMethodValidation.deliverymanValidation),
    ],
    handler: DeliverymanPayoutMethodController.getMyPayoutMethodList,
  });
  route({
    method: 'DELETE',
    url: '/payoutMethod/deleteMethod/:id/:deliveryman',
    preHandler: [
      appAuth('deletePayoutMethod'),
      validate(DeliverymanPayoutMethodValidation.deletePayoutMethodValidation),
    ],
    handler: DeliverymanPayoutMethodController.deletePayoutMethod,
  });
  route({
    method: 'GET',
    url: '/payoutMethod/detail/:id/:deliveryman',
    preHandler: [
      appAuth('getPayoutMethodDetail'),
      validate(DeliverymanPayoutMethodValidation.payoutMethodDetailValidation),
    ],
    handler: DeliverymanPayoutMethodController.getPayoutMethodDetail,
  });
  route({
    method: 'PATCH',
    url: '/payoutMethod/updatePayoutMethod',
    preHandler: [
      appAuth('updatePayoutMethod'),
      validate(DeliverymanPayoutMethodValidation.updatePayoutMethodValidation),
    ],
    handler: DeliverymanPayoutMethodController.updatePayoutMethodDetail,
  });
  route({
    method: 'PATCH',
    url: '/payoutMethod/changeDefaultPayoutMethod',
    preHandler: [
      appAuth('updatePayoutMethod'),
      validate(DeliverymanPayoutMethodValidation.changeDefaultPayoutMethodValidation),
    ],
    handler: DeliverymanPayoutMethodController.changeDefaultPayoutMethod,
  });
  // Payout Method Routes //

  // Wallet Routes //
  route({
    method: 'GET',
    url: '/wallet/getWalletTransaction/:user',
    preHandler: [
      appAuth('getWalletTransaction'),
      validate(UserValidation.idValidation),
    ],
    handler: WalletController.deliverymanWalletTransaction,
  });
  route({
    method: 'GET',
    url: '/wallet/withdrawalDetail/:deliveryman',
    preHandler: [
      appAuth('withdrawalDetail'),
      validate(WalletValidation.deliverymanWalletWithdrawalDetailValidation),
    ],
    handler: WalletController.deliverymanWalletWithdrawalDetail,
  });
  // Wallet Routes //

  // Withdrawal Routes //
  route({
    method: 'POST',
    url: '/wallet/requestWithdrawal',
    preHandler: [
      appAuth('withdrawalRequest'),
      validate(WithdrawalRequestValidation.createDeliverymanWithdrawalRequestValidation),
    ],
    handler: WithdrawalRequestController.createDeliverymanWithdrawalRequest,
  });
  route({
    method: 'GET',
    url: '/wallet/withdrawalHistory/:deliveryman',
    preHandler: [
      appAuth('withdrawalHistory'),
      validate(WithdrawalRequestValidation.deliverymanHistoryValidation),
    ],
    handler: WithdrawalRequestController.deliverymanWithdrawalHistory,
  });
  // Withdrawal Routes //

  // Deliveryman Insight //
  route({
    method: 'GET',
    url: '/insight/overall/:uid',
    preHandler: [
      appAuth('driverInsight'),
      validate(DriverValidation.deliverymanInsightValidation),
    ],
    handler: DriverController.deliverymanInsight,
  });
  // Deliveryman Insight //

  /// Chat Messages Routes //
  route({
    method: 'POST',
    url: '/chat_room/fetchMessages/',
    preHandler: [
      appAuth('fetchChatMessages'),
      validate(ChatRoomValidation.checkChatRoomValidation),
    ],
    handler: ChatRoomController.checkChatRoom,
  });
  route({
    method: 'POST',
    url: '/chat_room/sendMessage/',
    preHandler: [
      appAuth('sendChatMessage'),
      validate(ChatRoomValidation.sendChatMessageValidation),
    ],
    handler: ChatRoomController.saveNewMessage,
  });
  route({
    method: 'GET',
    url: '/chat_room/list/:user',
    preHandler: [
      appAuth('getChatList'),
      validate(ChatRoomValidation.chatListValidation),
    ],
    handler: ChatRoomController.getMyConversionList,
  });
  route({
    method: 'POST',
    url: '/chat_room/conversion',
    preHandler: [
      appAuth('getChatConversion'),
      validate(ChatRoomValidation.getChatConversionValidation),
    ],
    handler: ChatRoomController.getChatConversion,
  });
  /// Chat Messages Routes //

  // Support Chat Message Routes //
  route({
    method: 'POST',
    url: '/support_chat_room/fetchMessages/',
    preHandler: [
      appAuth('fetchChatMessages'),
      validate(ChatRoomValidation.supportChatRoomValidation),
    ],
    handler: SupportChatRoomController.checkChatRoom,
  });
  route({
    method: 'GET',
    url: '/support_chat_room/list/:user',
    preHandler: [
      appAuth('getChatList'),
      validate(ChatRoomValidation.chatListValidation),
    ],
    handler: SupportChatRoomController.mySupportChat,
  });
  route({
    method: 'POST',
    url: '/support_chat_room/sendMessage/',
    preHandler: [
      appAuth('sendChatMessage'),
      validate(ChatRoomValidation.sendChatMessageValidation),
    ],
    handler: SupportChatRoomController.saveNewMessage,
  });
  route({
    method: 'POST',
    url: '/support_chat_room/conversion',
    preHandler: [
      appAuth('getChatConversion'),
      validate(ChatRoomValidation.getChatConversionValidation),
    ],
    handler: SupportChatRoomController.getChatConversion,
  });
  // Support Chat Message Routes //

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
    handler: UserDeleteAccountReasonController.geDeliverymanActiveReason,
  });
  route({
    method: 'POST',
    url: '/account_setting/delete_account',
    preHandler: [
      appAuth('delete_account'),
      validate(UserValidation.deleteDeliverymanAccountValidation),
    ],
    handler: UserController.deliverymanDeleteAccount,
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
