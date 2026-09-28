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

const express = require('express');
const webAuth = require('../../middlewares/webAuth');
const validate = require('../../middlewares/validate');

const UserValidation = require('../../validations/user.validation');
const ChatRoomValidation = require('../../validations/chat.room.validation');
const OrdersValidation = require('../../validations/orders.validation');
const DiningBookingValidation = require('../../validations/dining.booking.validation');
const UserPurchasedTiffinSubscriptionValidation = require('../../validations/user.purchased.tiffin.subscriptions.validation');
const RestaurantValidation = require('../../validations/restaurant.validation');

const UserController = require('../../controllers/user.controller');
const SupportChatRoomController = require('../../controllers/support.chat.room.controller');
const OrdersController = require('../../controllers/orders.controller');
const DiningBookingController = require('../../controllers/dining.booking.controller');
const UserPurchasedTiffinSubscriptionController = require('../../controllers/user.purchased.tiffin.subscription.controller');
const RestaurantController = require('../../controllers/restaurant.controller');
const CityController = require('../../controllers/city.controller');
const DriverController = require('../../controllers/driver.controller');
const NotificationListController = require('../../controllers/notification.list.controller');

const router = express.Router();

router.get(
  '/web_guard/:id',
  webAuth('web_guard'),
  validate(UserValidation.webGuardValidation),
  UserController.supportTeamProfile
);

router.get('/dashboard', webAuth('support_chats'), SupportChatRoomController.filterChatList);
router.post(
  '/chat_message_initial',
  webAuth('support_chats'),
  validate(ChatRoomValidation.supportChatValidation),
  SupportChatRoomController.getInitialChatSupportMessages
);
router.post(
  '/fetche_more_result',
  webAuth('support_chats'),
  validate(ChatRoomValidation.supportChatValidation),
  SupportChatRoomController.fetchMoreSupportMessages
);
router.post(
  '/chat/send/',
  webAuth('support_chats'),
  validate(ChatRoomValidation.sendChatMessageValidation),
  SupportChatRoomController.saveSupportMessage
);
router.get(
  '/order_detail/:id',
  webAuth('order_detail'),
  validate(OrdersValidation.orderDetailSupportTeamValidation),
  OrdersController.supportTeamOrderDetail
);
router.get(
  '/booking_detail/:bookingId',
  webAuth('booking_detail'),
  validate(DiningBookingValidation.supportTeamDiningValidation),
  DiningBookingController.supportTeamBookingDetail
);
router.get(
  '/purchase_detail/:id',
  webAuth('purchase_detail'),
  validate(UserPurchasedTiffinSubscriptionValidation.supportTeamPurchaseDetailValidation),
  UserPurchasedTiffinSubscriptionController.supportTeamPurchaseDetail
);
router.post(
  '/resolve_support_chat',
  webAuth('support_chats'),
  validate(ChatRoomValidation.resolveSupportChatValidation),
  SupportChatRoomController.resolveSupportChat
);
router.get(
  '/export_chats/:id',
  webAuth('support_chats'),
  validate(ChatRoomValidation.exportSupportChatValidation),
  SupportChatRoomController.exportSupportChat
);
router.get(
  '/support_team_chat_list/:id',
  webAuth('support_chats'),
  validate(ChatRoomValidation.supportTeamChatValidation),
  SupportChatRoomController.supportTeamChat
);
router.get('/customer_list', webAuth('customer_list'), UserController.customerList);
router.get(
  '/customer_detail/:id',
  webAuth('customer_list'),
  validate(UserValidation.supportTeamCustomerDetailValidation),
  UserController.supportTeamCustomerDetail
);
router.get(
  '/restaurant_initial',
  webAuth('restaurant_list'),
  RestaurantController.restauratReportInitialFilter
);
router.get(
  '/restaurant_list',
  webAuth('restaurant_list'),
  RestaurantController.supportTeamRestaurantList
);
router.get(
  '/restaurant_detail/:id',
  webAuth('restaurant_list'),
  validate(RestaurantValidation.supportTeamRestaurantValidation),
  RestaurantController.supportTeamRestaurantDetail
);

router.get('/all_cities', webAuth('cities_list'), CityController.getAll);
router.get(
  '/deliveryman_list',
  webAuth('deliveryman_list'),
  DriverController.supportTeamDeliverymanList
);

router.get(
  '/support_team_profile/:id',
  webAuth('support_team_profile'),
  validate(UserValidation.supportTeamProfileValidation),
  UserController.getSupportTeamProfile
);
router.patch(
  '/update_support_team/:id',
  webAuth('update_support_team'),
  validate(UserValidation.updateSupportTeamProfileValidation),
  UserController.updateSupportTeamProfile
);
router.patch(
  '/update_support_team_password/:id',
  webAuth('update_support_team_password'),
  validate(UserValidation.updateSupportTeamPasswordValidation),
  UserController.updateSupportTeamPassword
);

router.get(
  '/support_team_header_content/:id',
  webAuth('support_team_header_content'),
  validate(UserValidation.supportTeamHeaderValidation),
  NotificationListController.supportTeamHeaderContent
);

module.exports = router;

