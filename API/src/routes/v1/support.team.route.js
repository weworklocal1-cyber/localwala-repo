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

module.exports.register = function register(route) {
  route({
    method: 'GET',
    url: '/web_guard/:id',
    preHandler: [
      webAuth('web_guard'),
      validate(UserValidation.webGuardValidation),
    ],
    handler: UserController.supportTeamProfile,
  });

  route({
    method: 'GET',
    url: '/dashboard',
    preHandler: [webAuth('support_chats')],
    handler: SupportChatRoomController.filterChatList,
  });
  route({
    method: 'POST',
    url: '/chat_message_initial',
    preHandler: [
      webAuth('support_chats'),
      validate(ChatRoomValidation.supportChatValidation),
    ],
    handler: SupportChatRoomController.getInitialChatSupportMessages,
  });
  route({
    method: 'POST',
    url: '/fetche_more_result',
    preHandler: [
      webAuth('support_chats'),
      validate(ChatRoomValidation.supportChatValidation),
    ],
    handler: SupportChatRoomController.fetchMoreSupportMessages,
  });
  route({
    method: 'POST',
    url: '/chat/send/',
    preHandler: [
      webAuth('support_chats'),
      validate(ChatRoomValidation.sendChatMessageValidation),
    ],
    handler: SupportChatRoomController.saveSupportMessage,
  });
  route({
    method: 'GET',
    url: '/order_detail/:id',
    preHandler: [
      webAuth('order_detail'),
      validate(OrdersValidation.orderDetailSupportTeamValidation),
    ],
    handler: OrdersController.supportTeamOrderDetail,
  });
  route({
    method: 'GET',
    url: '/booking_detail/:bookingId',
    preHandler: [
      webAuth('booking_detail'),
      validate(DiningBookingValidation.supportTeamDiningValidation),
    ],
    handler: DiningBookingController.supportTeamBookingDetail,
  });
  route({
    method: 'GET',
    url: '/purchase_detail/:id',
    preHandler: [
      webAuth('purchase_detail'),
      validate(UserPurchasedTiffinSubscriptionValidation.supportTeamPurchaseDetailValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.supportTeamPurchaseDetail,
  });
  route({
    method: 'POST',
    url: '/resolve_support_chat',
    preHandler: [
      webAuth('support_chats'),
      validate(ChatRoomValidation.resolveSupportChatValidation),
    ],
    handler: SupportChatRoomController.resolveSupportChat,
  });
  route({
    method: 'GET',
    url: '/export_chats/:id',
    preHandler: [
      webAuth('support_chats'),
      validate(ChatRoomValidation.exportSupportChatValidation),
    ],
    handler: SupportChatRoomController.exportSupportChat,
  });
  route({
    method: 'GET',
    url: '/support_team_chat_list/:id',
    preHandler: [
      webAuth('support_chats'),
      validate(ChatRoomValidation.supportTeamChatValidation),
    ],
    handler: SupportChatRoomController.supportTeamChat,
  });
  route({
    method: 'GET',
    url: '/customer_list',
    preHandler: [webAuth('customer_list')],
    handler: UserController.customerList,
  });
  route({
    method: 'GET',
    url: '/customer_detail/:id',
    preHandler: [
      webAuth('customer_list'),
      validate(UserValidation.supportTeamCustomerDetailValidation),
    ],
    handler: UserController.supportTeamCustomerDetail,
  });
  route({
    method: 'GET',
    url: '/restaurant_initial',
    preHandler: [webAuth('restaurant_list')],
    handler: RestaurantController.restauratReportInitialFilter,
  });
  route({
    method: 'GET',
    url: '/restaurant_list',
    preHandler: [webAuth('restaurant_list')],
    handler: RestaurantController.supportTeamRestaurantList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail/:id',
    preHandler: [
      webAuth('restaurant_list'),
      validate(RestaurantValidation.supportTeamRestaurantValidation),
    ],
    handler: RestaurantController.supportTeamRestaurantDetail,
  });

  route({
    method: 'GET',
    url: '/all_cities',
    preHandler: [webAuth('cities_list')],
    handler: CityController.getAll,
  });
  route({
    method: 'GET',
    url: '/deliveryman_list',
    preHandler: [webAuth('deliveryman_list')],
    handler: DriverController.supportTeamDeliverymanList,
  });

  route({
    method: 'GET',
    url: '/support_team_profile/:id',
    preHandler: [
      webAuth('support_team_profile'),
      validate(UserValidation.supportTeamProfileValidation),
    ],
    handler: UserController.getSupportTeamProfile,
  });
  route({
    method: 'PATCH',
    url: '/update_support_team/:id',
    preHandler: [
      webAuth('update_support_team'),
      validate(UserValidation.updateSupportTeamProfileValidation),
    ],
    handler: UserController.updateSupportTeamProfile,
  });
  route({
    method: 'PATCH',
    url: '/update_support_team_password/:id',
    preHandler: [
      webAuth('update_support_team_password'),
      validate(UserValidation.updateSupportTeamPasswordValidation),
    ],
    handler: UserController.updateSupportTeamPassword,
  });

  route({
    method: 'GET',
    url: '/support_team_header_content/:id',
    preHandler: [
      webAuth('support_team_header_content'),
      validate(UserValidation.supportTeamHeaderValidation),
    ],
    handler: NotificationListController.supportTeamHeaderContent,
  });
};
