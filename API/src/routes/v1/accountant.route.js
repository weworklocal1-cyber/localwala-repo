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
const AdminExpenseValidation = require('../../validations/admin.expense.validation');
const RestaurantValidation = require('../../validations/restaurant.validation');
const DisbursementValidation = require('../../validations/disbursement.validation');
const CollectCashValidation = require('../../validations/collect.cash.validation');
const DriverValidation = require('../../validations/driver.validation');
const WithdrawalMethodValidation = require('../../validations/withdrawal.method.validation');
const WithdrawalRequestValidation = require('../../validations/withdrawal.request.validation');
const OrdersValidation = require('../../validations/orders.validation');
const PosOrTableOrderValidation = require('../../validations/pos.or.table.order.validation');
const TableOrderValidation = require('../../validations/table.order.validation');
const UserPurchasedTiffinSubscriptionValidation = require('../../validations/user.purchased.tiffin.subscriptions.validation');
const DiningBookingValidation = require('../../validations/dining.booking.validation');
const WalletValidation = require('../../validations/wallet.validation');
const PaymentConfigValidation = require('../../validations/payment.config.validation');
const FoodValidation = require('../../validations/food.validation');
const ChatRoomValidation = require('../../validations/chat.room.validation');

const UserController = require('../../controllers/user.controller');
const OrdersController = require('../../controllers/orders.controller');
const AdminExpenseController = require('../../controllers/admin.expense.controller');
const CityController = require('../../controllers/city.controller');
const RestaurantController = require('../../controllers/restaurant.controller');
const PosOrTableOrderController = require('../../controllers/pos.or.table.order.controller');
const TableOrderController = require('../../controllers/table.order.controller');
const WalletController = require('../../controllers/wallet.controller');
const PaymentInitiationController = require('../../controllers/payment.initiation.controller');
const DiningBookingController = require('../../controllers/dining.booking.controller');
const FoodController = require('../../controllers/food.controller');
const DriverController = require('../../controllers/driver.controller');
const DisbursementController = require('../../controllers/disbursement.controller');
const CollectCashController = require('../../controllers/collect.cash.controller');
const WithdrawalMethodController = require('../../controllers/withdrawal.method.controller');
const MediaController = require('../../controllers/media.controller');
const WithdrawalRequestController = require('../../controllers/withdrawal.request.controller');
const UserPurchasedTiffinSubscriptionController = require('../../controllers/user.purchased.tiffin.subscription.controller');
const NotificationListController = require('../../controllers/notification.list.controller');
const ChatRoomController = require('../../controllers/chat.room.controller');

module.exports.register = function register(route) {
  route({
    method: 'GET',
    url: '/web_guard/:id',
    preHandler: [
      webAuth('web_guard'),
      validate(UserValidation.webGuardValidation),
    ],
    handler: UserController.accountantProfile,
  });

  route({
    method: 'GET',
    url: '/dashboard',
    preHandler: [webAuth('dashboard')],
    handler: OrdersController.accountantDashboard,
  });
  route({
    method: 'GET',
    url: '/expense_initial',
    preHandler: [webAuth('expense_report')],
    handler: AdminExpenseController.getInitialResponse,
  });
  route({
    method: 'GET',
    url: '/expense',
    preHandler: [webAuth('expense_report')],
    handler: AdminExpenseController.getExpenseList,
  });
  route({
    method: 'POST',
    url: '/save_expense',
    preHandler: [
      webAuth('expense_report'),
      validate(AdminExpenseValidation.saveExpenseValidation),
    ],
    handler: AdminExpenseController.create,
  });

  route({
    method: 'GET',
    url: '/city_list',
    preHandler: [webAuth('city_list')],
    handler: CityController.getAll,
  });
  route({
    method: 'GET',
    url: '/regular_order_report',
    preHandler: [
      webAuth('order_report'),
      validate(OrdersValidation.orderReportValidation),
    ],
    handler: OrdersController.orderReports,
  });
  route({
    method: 'GET',
    url: '/restaurant_with_city/:cityId',
    preHandler: [
      webAuth('restaurant_list'),
      validate(RestaurantValidation.restaurantByCityIdLimitedDetailsValidation),
    ],
    handler: RestaurantController.getRestaurantsByCityIdLimitedDetailsForAdmin,
  });
  route({
    method: 'GET',
    url: '/pos_order_report',
    preHandler: [
      webAuth('order_report'),
      validate(OrdersValidation.orderReportValidation),
    ],
    handler: PosOrTableOrderController.posOrderReport,
  });
  route({
    method: 'GET',
    url: '/table_order_report',
    preHandler: [
      webAuth('order_report'),
      validate(OrdersValidation.orderReportValidation),
    ],
    handler: TableOrderController.tableOrderReport,
  });
  route({
    method: 'GET',
    url: '/wallet_transaction_report/',
    preHandler: [webAuth('wallet_report')],
    handler: WalletController.getTransactionReport,
  });
  route({
    method: 'GET',
    url: '/payment_transaction_report/',
    preHandler: [webAuth('payment_report')],
    handler: PaymentInitiationController.getPaymentInitiateReport,
  });
  route({
    method: 'GET',
    url: '/dining_booking_report',
    preHandler: [webAuth('order_report')],
    handler: DiningBookingController.diningBookingReport,
  });
  route({
    method: 'GET',
    url: '/food_report/',
    preHandler: [webAuth('food_report')],
    handler: FoodController.foodReport,
  });
  route({
    method: 'GET',
    url: '/restaurant_report_initial',
    preHandler: [webAuth('restaurant_report')],
    handler: RestaurantController.restauratReportInitialFilter,
  });
  route({
    method: 'GET',
    url: '/restaurant_report',
    preHandler: [webAuth('restaurant_report')],
    handler: RestaurantController.restaurantReport,
  });
  route({
    method: 'GET',
    url: '/customer_report',
    preHandler: [webAuth('customer_report')],
    handler: UserController.customerReport,
  });
  route({
    method: 'GET',
    url: '/deliveryman_report',
    preHandler: [webAuth('deliveryman_report')],
    handler: DriverController.deliverymanReport,
  });

  route({
    method: 'GET',
    url: '/restaurant_initial_disbursement',
    preHandler: [webAuth('disbursement_report')],
    handler: DisbursementController.disbursementTransactionInitial,
  });
  route({
    method: 'GET',
    url: '/restaurant_disbursement',
    preHandler: [webAuth('disbursement_report')],
    handler: DisbursementController.restaurantDisbursementTransactionReport,
  });
  route({
    method: 'GET',
    url: '/restaurant_disbursement_detail/:id',
    preHandler: [
      webAuth('disbursement_report'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.restaurantDisbursementDetail,
  });
  route({
    method: 'GET',
    url: '/accept_restaurant_disbursement/:id',
    preHandler: [
      webAuth('disbursement_report'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.acceptRestaurantDisburment,
  });
  route({
    method: 'GET',
    url: '/deliveryman_initial_disbursement',
    preHandler: [webAuth('disbursement_report')],
    handler: DisbursementController.deliverymanDisbursementTransactionInitial,
  });
  route({
    method: 'GET',
    url: '/deliveryman_disbursement',
    preHandler: [webAuth('disbursement_report')],
    handler: DisbursementController.deliverymanDisbursementTransactionReport,
  });
  route({
    method: 'GET',
    url: '/deliveryman_disbursement_detail/:id',
    preHandler: [
      webAuth('disbursement_report'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.deliverymanDisbursementDetail,
  });
  route({
    method: 'GET',
    url: '/accept_deliveryman_disbursement/:id',
    preHandler: [
      webAuth('disbursement_report'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.acceptDeliverymanDisbursment,
  });
  route({
    method: 'GET',
    url: '/reject_restaurant_disbursement/:id',
    preHandler: [
      webAuth('disbursement_report'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.rejectRestaurantDisburment,
  });

  route({
    method: 'GET',
    url: '/collect_cash_list',
    preHandler: [
      webAuth('collect_cash'),
      validate(CollectCashValidation.collectCashListValidation),
    ],
    handler: CollectCashController.get,
  });
  route({
    method: 'GET',
    url: '/deliveryman_with_city/:city',
    preHandler: [
      webAuth('deliveryman_list'),
      validate(DriverValidation.driverByCityValidation),
    ],
    handler: DriverController.getDeliverymanFromCity,
  });
  route({
    method: 'GET',
    url: '/restaurant_cash_in_hand/:vendor',
    preHandler: [
      webAuth('restaurant_cash_in_hand'),
      validate(RestaurantValidation.vendorCashInHandValidation),
    ],
    handler: RestaurantController.getRestaurantCashInHand,
  });
  route({
    method: 'GET',
    url: '/deliveryman_cash_in_hand/:deliveryman',
    preHandler: [
      webAuth('deliveryman_cash_in_hand'),
      validate(DriverValidation.deliverymanCashInHandValidation),
    ],
    handler: DriverController.getDeliverymanCashInHand,
  });
  route({
    method: 'POST',
    url: '/restaurant_clear_cash_in_hand',
    preHandler: [
      webAuth('restaurant_cash_in_hand'),
      validate(RestaurantValidation.collectCashValidation),
    ],
    handler: RestaurantController.clearCashInHandAndUpdateWallet,
  });
  route({
    method: 'POST',
    url: '/deliveryman_clear_cash_in_hand',
    preHandler: [
      webAuth('deliveryman_cash_in_hand'),
      validate(DriverValidation.collectCashValidation),
    ],
    handler: DriverController.clearCashInHand,
  });

  route({
    method: 'GET',
    url: '/withdrawal_method_list',
    preHandler: [webAuth('withdrawal_method')],
    handler: WithdrawalMethodController.methodList,
  });
  route({
    method: 'DELETE',
    url: '/delete_withdrawal_method/:methodId',
    preHandler: [
      webAuth('delete_withdrawal_method'),
      validate(WithdrawalMethodValidation.idValidation),
    ],
    handler: WithdrawalMethodController.drop,
  });
  route({
    method: 'PATCH',
    url: '/update_withdrawal_method/:methodId',
    preHandler: [
      webAuth('update_withdrawal_method'),
      validate(WithdrawalMethodValidation.idValidation),
    ],
    handler: WithdrawalMethodController.update,
  });
  route({
    method: 'PATCH',
    url: '/update_default_withdrawal_method/:methodId',
    preHandler: [
      webAuth('update_withdrawal_method'),
      validate(WithdrawalMethodValidation.idValidation),
    ],
    handler: WithdrawalMethodController.updateDefault,
  });
  route({
    method: 'GET',
    url: '/withdrawal_method_detail/:methodId',
    preHandler: [
      webAuth('withdrawal_method'),
      validate(WithdrawalMethodValidation.idValidation),
    ],
    handler: WithdrawalMethodController.withdrawalMethodDetail,
  });
  route({
    method: 'POST',
    url: '/create_withdrawal_method',
    preHandler: [
      webAuth('create_withdrawal_method'),
      validate(WithdrawalMethodValidation.createWithdrawalMethodValidation),
    ],
    handler: WithdrawalMethodController.create,
  });

  route({
    method: 'GET',
    url: '/media_list',
    preHandler: [webAuth('media_list')],
    handler: MediaController.get,
  });

  route({
    method: 'GET',
    url: '/restaurant_withdrawal_request',
    preHandler: [
      webAuth('restaurant_withdrawal_request'),
      validate(WithdrawalRequestValidation.allValidation),
    ],
    handler: WithdrawalRequestController.getRestaurantWithdrawalRequest,
  });
  route({
    method: 'GET',
    url: '/deliveryman_withdrawal_request',
    preHandler: [webAuth('deliveryman_withdrawal_request')],
    handler: WithdrawalRequestController.getDeliverymanWithdrawalRequest,
  });

  route({
    method: 'GET',
    url: '/withdrawal_request_detail/:id',
    preHandler: [
      webAuth('withdrawal_request_detail'),
      validate(WithdrawalRequestValidation.idValidation),
    ],
    handler: WithdrawalRequestController.withdrawalRequestDetail,
  });
  route({
    method: 'POST',
    url: '/approve_withdrawal_request',
    preHandler: [
      webAuth('approve_withdrawal_request'),
      validate(WithdrawalRequestValidation.approveWithdrawalRequestValidation),
    ],
    handler: WithdrawalRequestController.approveWithdrawalRequest,
  });
  route({
    method: 'POST',
    url: '/decline_withdrawal_request',
    preHandler: [
      webAuth('decline_withdrawal_request'),
      validate(WithdrawalRequestValidation.declineWithdrawalRequestValidation),
    ],
    handler: WithdrawalRequestController.declineWithdrawalRequest,
  });
  route({
    method: 'GET',
    url: '/restaurant_disbursement_list',
    preHandler: [webAuth('disbursement_report')],
    handler: DisbursementController.restaurantDisbursement,
  });
  route({
    method: 'GET',
    url: '/restaurant_disbursement_report/:id',
    preHandler: [
      webAuth('disbursement_report'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.restaurantDisbursementReport,
  });
  route({
    method: 'GET',
    url: '/deliveryman_disbursement_list',
    preHandler: [webAuth('disbursement_report')],
    handler: DisbursementController.deliverymanDisbursement,
  });
  route({
    method: 'GET',
    url: '/deliveryman_disbursement_report/:id',
    preHandler: [
      webAuth('disbursement_report'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.deliverymanDisbursementReport,
  });
  route({
    method: 'GET',
    url: '/reject_deliveryman_disbursement/:id',
    preHandler: [
      webAuth('disbursement_report'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.rejectDeliverymanDisbursment,
  });

  route({
    method: 'GET',
    url: '/regular_order_detail/:id',
    preHandler: [
      webAuth('order_detail'),
      validate(OrdersValidation.orderDetailAdminValidation),
    ],
    handler: OrdersController.getOrderDetailAdmin,
  });
  route({
    method: 'GET',
    url: '/pos_order_detail/:id',
    preHandler: [
      webAuth('order_detail'),
      validate(PosOrTableOrderValidation.adminPosOrderDetailValidation),
    ],
    handler: PosOrTableOrderController.adminPosOrderDetail,
  });
  route({
    method: 'GET',
    url: '/table_order_detail/:id',
    preHandler: [
      webAuth('order_detail'),
      validate(TableOrderValidation.adminTableOrderDetailValidation),
    ],
    handler: TableOrderController.adminTableOrderDetail,
  });
  route({
    method: 'GET',
    url: '/tiffin_packages_purchase_detail/:id',
    preHandler: [
      webAuth('order_detail'),
      validate(UserPurchasedTiffinSubscriptionValidation.purchaseDetailValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.getPurchaseDetailAdmin,
  });
  route({
    method: 'GET',
    url: '/dining_booking_detail/:bookingId',
    preHandler: [
      webAuth('order_detail'),
      validate(DiningBookingValidation.bookingInformationAdminValidation),
    ],
    handler: DiningBookingController.getDiningBookingInfoAdmin,
  });

  route({
    method: 'GET',
    url: '/customer_detail/:user',
    preHandler: [
      webAuth('customer_detail'),
      validate(UserValidation.idValidation),
    ],
    handler: UserController.customerDetail,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/:id',
    preHandler: [
      webAuth('deliveryman_detail'),
      validate(DriverValidation.deliverymanInformationValidation),
    ],
    handler: DriverController.deliverymanInformation,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail/:id',
    preHandler: [
      webAuth('restaurant_detail'),
      validate(RestaurantValidation.vendorInformationValidation),
    ],
    handler: RestaurantController.vendorInformation,
  });
  route({
    method: 'GET',
    url: '/accountant_header_content',
    preHandler: [webAuth('accountant_header_content')],
    handler: NotificationListController.accountantHeaderContent,
  });
  route({
    method: 'GET',
    url: '/accountant_profile/:id',
    preHandler: [
      webAuth('accountant_profile'),
      validate(UserValidation.accountantProfileValidation),
    ],
    handler: UserController.getAccountantProfile,
  });
  route({
    method: 'PATCH',
    url: '/update_accountant/:id',
    preHandler: [
      webAuth('update_accountant'),
      validate(UserValidation.updateAccountantProfileValidation),
    ],
    handler: UserController.updateAccountantProfile,
  });
  route({
    method: 'PATCH',
    url: '/update_accountant_password/:id',
    preHandler: [
      webAuth('update_accountant_password'),
      validate(UserValidation.updateAccountantPasswordValidation),
    ],
    handler: UserController.updateAccountantPassword,
  });

  // Import & Export Routes //
  route({
    method: 'GET',
    url: '/cash_collected/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(CollectCashValidation.exportValidation),
    ],
    handler: CollectCashController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/restaurant_withdrawal_request/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(WithdrawalRequestValidation.exportValidation),
    ],
    handler: WithdrawalRequestController.exportRestaurantRequestCollection,
  });
  route({
    method: 'GET',
    url: '/deliveryman_withdrawal_request/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(WithdrawalRequestValidation.exportValidation),
    ],
    handler: WithdrawalRequestController.exportDeliverymanRequestCollection,
  });
  route({
    method: 'GET',
    url: '/withdrawal_method/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(WithdrawalMethodValidation.exportValidation),
    ],
    handler: WithdrawalMethodController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/restaurant_disbursement/export/:type/:status',
    preHandler: [
      webAuth('export_collection'),
      validate(DisbursementValidation.exportValidation),
    ],
    handler: DisbursementController.exportRestaurantCollection,
  });
  route({
    method: 'GET',
    url: '/disbursement/restaurant_report/export/:id/:type',
    preHandler: [
      webAuth('export_collection'),
      validate(DisbursementValidation.exportDisbursementReportValidation),
    ],
    handler: DisbursementController.exportRestaurantDisbursementCollection,
  });
  route({
    method: 'GET',
    url: '/deliveryman_disbursement/export/:type/:status',
    preHandler: [
      webAuth('export_collection'),
      validate(DisbursementValidation.exportValidation),
    ],
    handler: DisbursementController.exportDeliverymanCollection,
  });
  route({
    method: 'GET',
    url: '/disbursement/deliveryman_report/export/:id/:type',
    preHandler: [
      webAuth('export_collection'),
      validate(DisbursementValidation.exportDisbursementReportValidation),
    ],
    handler: DisbursementController.exportDeliverymanDisbursementCollection,
  });
  route({
    method: 'GET',
    url: '/expense/export/:type/:status',
    preHandler: [
      webAuth('export_collection'),
      validate(AdminExpenseValidation.exportValidation),
    ],
    handler: AdminExpenseController.exportQueryCollection,
  });
  route({
    method: 'GET',
    url: '/reports/orders/export',
    preHandler: [
      webAuth('export_collection'),
      validate(OrdersValidation.exportOrderReportValidation),
    ],
    handler: OrdersController.exportRegularOrderReportCollection,
  });
  route({
    method: 'GET',
    url: '/reports/pos_orders/export',
    preHandler: [
      webAuth('export_collection'),
      validate(PosOrTableOrderValidation.exportPOSOrderValidation),
    ],
    handler: PosOrTableOrderController.exportPOSOrderReportCollection,
  });
  route({
    method: 'GET',
    url: '/reports/table_orders/export',
    preHandler: [
      webAuth('export_collection'),
      validate(TableOrderValidation.exportTableOrderValidation),
    ],
    handler: TableOrderController.exportTableOrderReportCollection,
  });
  route({
    method: 'GET',
    url: '/reports/wallet_transaction/export',
    preHandler: [
      webAuth('export_collection'),
      validate(WalletValidation.exportTransactionValidation),
    ],
    handler: WalletController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/reports/payment_transaction/export',
    preHandler: [
      webAuth('export_collection'),
      validate(PaymentConfigValidation.exportPaymentValidation),
    ],
    handler: PaymentInitiationController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/reports/dining_booking/export',
    preHandler: [
      webAuth('export_collection'),
      validate(DiningBookingValidation.exportReportValidation),
    ],
    handler: DiningBookingController.exportReportCollection,
  });
  route({
    method: 'GET',
    url: '/reports/food_report/export',
    preHandler: [
      webAuth('export_collection'),
      validate(FoodValidation.exportReportValidation),
    ],
    handler: FoodController.exportReportCollection,
  });
  route({
    method: 'GET',
    url: '/reports/restaurant/export',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantValidation.exportReportValidation),
    ],
    handler: RestaurantController.exportRestaurantReportCollection,
  });
  route({
    method: 'GET',
    url: '/reports/customer/export',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportCustomerReportValidation),
    ],
    handler: UserController.exportRawCustomerReportCollection,
  });
  route({
    method: 'GET',
    url: '/reports/deliveryman/export',
    preHandler: [
      webAuth('export_collection'),
      validate(DriverValidation.exportDeliverymanReportValidation),
    ],
    handler: DriverController.exportDeliverymanReportCollection,
  });
  route({
    method: 'GET',
    url: '/reports/restaurant_disbursement/export',
    preHandler: [
      webAuth('export_collection'),
      validate(DisbursementValidation.exportRestaurantReportValidation),
    ],
    handler: DisbursementController.exportRestaurantDisbursementReportCollection,
  });
  route({
    method: 'GET',
    url: '/reports/deliveryman_disbursement/export',
    preHandler: [
      webAuth('export_collection'),
      validate(DisbursementValidation.exportDeliverymanReportValidation),
    ],
    handler: DisbursementController.exportDeliverymanDisbursementReportCollection,
  });
  // Import & Export Routes //

  // Accountant User Contact Detail Routes //
  route({
    method: 'GET',
    url: '/user_contact_detail/:id',
    preHandler: [
      webAuth('user_contact_detail'),
      validate(UserValidation.adminUserContactDetailValidation),
    ],
    handler: UserController.adminUserContactDetail,
  });
  // Accountant User Contact Detail Routes //

  /// Chat Messages Routes //
  route({
    method: 'POST',
    url: '/chat_room/fetch_messages/',
    preHandler: [
      webAuth('regular_chat_messages'),
      validate(ChatRoomValidation.checkChatRoomValidation),
    ],
    handler: ChatRoomController.checkChatRoom,
  });
  route({
    method: 'GET',
    url: '/regular_chat_messages/:id',
    preHandler: [
      webAuth('regular_chat_messages'),
      validate(ChatRoomValidation.cityzenChatMessagesValidation),
    ],
    handler: ChatRoomController.cityzenGetChatMessages,
  });
  route({
    method: 'POST',
    url: '/chat_room/send_regular_message/',
    preHandler: [
      webAuth('send_regular_message'),
      validate(ChatRoomValidation.sendChatMessageValidation),
    ],
    handler: ChatRoomController.saveNewMessage,
  });
  /// Chat Messages Routes //
};
