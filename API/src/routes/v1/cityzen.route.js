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
const OrdersValidation = require('../../validations/orders.validation');
const LocalityValidation = require('../../validations/locality.validation');
const RestaurantValidation = require('../../validations/restaurant.validation');
const RestaurantJoiningRequestValidation = require('../../validations/restaurant.joining.request.validation');
const WaiterValidation = require('../../validations/waiter.validation');
const DriverValidation = require('../../validations/driver.validation');
const DeliverymanJoiningRequestValidation = require('../../validations/deliveryman.joining.request.validation');
const CityValidation = require('../../validations/city.validation');
const AuthValidation = require('../../validations/auth.validation');
const PosOrTableOrderValidation = require('../../validations/pos.or.table.order.validation');
const TableOrderValidation = require('../../validations/table.order.validation');
const FoodValidation = require('../../validations/food.validation');
const VendorSubCategoryValidation = require('../../validations/vendor.sub.category.validation');
const AddonsValidation = require('../../validations/addons.validation');
const FoodTaxationValidation = require('../../validations/food.taxation.validation');
const SubscriptionTiffinPackageValidation = require('../../validations/subscription.tiffin.packages.validation');
const UserPurchasedTiffinSubscriptionValidation = require('../../validations/user.purchased.tiffin.subscriptions.validation');
const RefundRequestValidation = require('../../validations/refund.request.validation');
const TiffinSubscriptionRefundRequestValidation = require('../../validations/tiffin.subscription.refund.request.validation');
const DiningBookingRefundRequestValidation = require('../../validations/dining.booking.refund.request.validation');
const DiningBookingValidation = require('../../validations/dining.booking.validation');
const RestaurantCampaignValidation = require('../../validations/restaurant.campaign.validation');
const RestaurantCampaignRequestValidation = require('../../validations/restaurant.campaign.request.validation');
const DiningCampaignValidation = require('../../validations/dining.campaign.validation');
const DiningCampaignRequestValidation = require('../../validations/dining.campaign.request.validation');
const FoodCampaignValidation = require('../../validations/food.campaign.validation');
const FoodCampaignRequestValidation = require('../../validations/food.campaign.request.validation');
const FileValidation = require('../../validations/file.validation');
const BannersValidation = require('../../validations/banner.validation');
const CouponValidation = require('../../validations/coupon.validation');
const DiningCouponValidation = require('../../validations/dining.coupon.validation');
const CollectCashValidation = require('../../validations/collect.cash.validation');
const WithdrawalRequestValidation = require('../../validations/withdrawal.request.validation');
const DisbursementValidation = require('../../validations/disbursement.validation');
const KitchenOwnerValidation = require('../../validations/kitchen.owner.validation');
const ChatRoomValidation = require('../../validations/chat.room.validation');
const ReportIssueRestaurantReasonValidation = require('../../validations/report.issue.restaurant.reason.validation');
const HideRestaurantReasonValidation = require('../../validations/hide.restaurant.reason.validation');

const UserController = require('../../controllers/user.controller');
const OrdersController = require('../../controllers/orders.controller');
const LocalityController = require('../../controllers/locality.controller');
const RestaurantController = require('../../controllers/restaurant.controller');
const RestaurantJoiningRequestController = require('../../controllers/restaurant.joining.request.controller');
const WaiterController = require('../../controllers/waiter.controller');
const ReportIssueRestaurantController = require('../../controllers/report.issue.restaurant.controller');
const HideRestaurantController = require('../../controllers/hide.restaurant.controller');
const DriverController = require('../../controllers/driver.controller');
const DeliverymanJoiningRequestController = require('../../controllers/deliveryman.joining.request.controller');
const MediaController = require('../../controllers/media.controller');
const CityController = require('../../controllers/city.controller');
const PosOrTableOrderController = require('../../controllers/pos.or.table.order.controller');
const TableOrderController = require('../../controllers/table.order.controller');
const FoodController = require('../../controllers/food.controller');
const SubCategoryController = require('../../controllers/sub.category.controller');
const VendorSubCategoryController = require('../../controllers/vendor.sub.category.controller');
const AddonsController = require('../../controllers/addons.controller');
const FoodTaxationController = require('../../controllers/food.taxation.controller');
const SubscriptionTiffinPackageController = require('../../controllers/subscription.tiffin.package.controller');
const UserPurchasedTiffinSubscriptionController = require('../../controllers/user.purchased.tiffin.subscription.controller');
const RefundRequestController = require('../../controllers/refund.request.controller');
const TiffinSubscriptionRefundRequestController = require('../../controllers/tiffin.subscription.refund.request.controller');
const DiningBookingRefundRequestController = require('../../controllers/dining.booking.refund.request.controller');
const ComplaintsController = require('../../controllers/complaints.controller');
const RestaurantComplaintsController = require('../../controllers/restaurant.complaints.controller');
const DiningBookingController = require('../../controllers/dining.booking.controller');
const RestaurantCampaignController = require('../../controllers/restaurant.campaign.controller');
const RestaurantCampaignRequestController = require('../../controllers/restaurant.campaign.request.controller');
const DiningCampaignController = require('../../controllers/dining.campaign.controller');
const DiningCampaignRequestController = require('../../controllers/dining.campaign.request.controller');
const FoodCampaignController = require('../../controllers/food.campaign.controller');
const FoodCampaignRequestController = require('../../controllers/food.campaign.request.controller');
const BannersController = require('../../controllers/banners.controller');
const CouponController = require('../../controllers/coupon.controller');
const DiningCouponController = require('../../controllers/dining.coupon.controller');
const CollectCashController = require('../../controllers/collect.cash.controller');
const WithdrawalRequestController = require('../../controllers/withdrawal.request.controller');
const DisbursementController = require('../../controllers/disbursement.controller');
const RestaurantPayoutMethodController = require('../../controllers/restaurant.payout.method.controller');
const WalletController = require('../../controllers/wallet.controller');
const ReviewRatingController = require('../../controllers/review.ratings.controller');
const DeliverymanPayoutMethodController = require('../../controllers/deliveryman.payout.method.controller');
const UserAddressController = require('../../controllers/user.address.controller');
const FavouriteController = require('../../controllers/favourite.controller');
const KitchenOwnerController = require('../../controllers/kitchen.owner.controller');
const FcmController = require('../../controllers/fcm.notification.controller');
const NotificationListController = require('../../controllers/notification.list.controller');
const ChatRoomController = require('../../controllers/chat.room.controller');
const SupportChatRoomController = require('../../controllers/support.chat.room.controller');

module.exports.register = function register(route) {
  route({
    method: 'GET',
    url: '/web_guard/:id',
    preHandler: [
      webAuth('web_guard'),
      validate(UserValidation.webGuardValidation),
    ],
    handler: UserController.cityMasterTeamProfile,
  });

  route({
    method: 'GET',
    url: '/dashboard/:master',
    preHandler: [
      webAuth('dashboard'),
      validate(AuthValidation.cityMasterValidation),
    ],
    handler: OrdersController.cityzenDashboard,
  });

  route({
    method: 'POST',
    url: '/localities/save/:master',
    preHandler: [
      webAuth('create_locality'),
      validate(LocalityValidation.createLocalityCityzenValidation),
    ],
    handler: LocalityController.createFromCityzen,
  });
  route({
    method: 'GET',
    url: '/localities/getAll/:master',
    preHandler: [
      webAuth('localities'),
      validate(LocalityValidation.cityMasterValidation),
    ],
    handler: LocalityController.getByCityzen,
  });
  route({
    method: 'PATCH',
    url: '/localities/update/:localityId',
    preHandler: [
      webAuth('update_locality'),
      validate(LocalityValidation.idValidation),
    ],
    handler: LocalityController.updateFromCityzen,
  });
  route({
    method: 'PATCH',
    url: '/localities/update_status/:localityId',
    preHandler: [
      webAuth('update_locality'),
      validate(LocalityValidation.idValidation),
    ],
    handler: LocalityController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/localities/delete_locality/:localityId',
    preHandler: [
      webAuth('delete_locality'),
      validate(LocalityValidation.idValidation),
    ],
    handler: LocalityController.drop,
  });

  route({
    method: 'GET',
    url: '/media_files/:userId',
    preHandler: [webAuth('media_files')],
    handler: MediaController.getVendorMedia,
  });

  route({
    method: 'GET',
    url: '/restaurant_list/:master',
    preHandler: [
      webAuth('restaurant_list'),
      validate(RestaurantValidation.cityMasterValidation),
    ],
    handler: RestaurantController.cityzenRestaurants,
  });
  route({
    method: 'PATCH',
    url: '/update_restaurant_status/:restaurantId',
    preHandler: [
      webAuth('update_restaurant'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.updateStatus,
  });
  route({
    method: 'GET',
    url: '/outlet_list/:master',
    preHandler: [
      webAuth('restaurant_list'),
      validate(RestaurantValidation.cityMasterValidation),
    ],
    handler: RestaurantController.cityzenOutlets,
  });

  route({
    method: 'GET',
    url: '/restaurant_register_request_list/:status/:master',
    preHandler: [
      webAuth('restaurant_register_request_list'),
      validate(RestaurantJoiningRequestValidation.cityzenStatusValidation),
    ],
    handler: RestaurantJoiningRequestController.cityzenJoiningRequestList,
  });
  route({
    method: 'DELETE',
    url: '/delete_restaurant_register_request/:id',
    preHandler: [
      webAuth('delete_restaurant_register_request'),
      validate(RestaurantJoiningRequestValidation.idValidation),
    ],
    handler: RestaurantJoiningRequestController.deleteRequest,
  });

  route({
    method: 'GET',
    url: '/filter_restaurant_data',
    preHandler: [webAuth('restaurant_list')],
    handler: RestaurantController.cityzenFilterQueryData,
  });
  route({
    method: 'POST',
    url: '/filter_restaurant',
    preHandler: [
      webAuth('restaurant_list'),
      validate(RestaurantValidation.cityzenFilterQueryValidation),
    ],
    handler: RestaurantController.cityzenFilterQuery,
  });

  route({
    method: 'GET',
    url: '/waiter_list/:master',
    preHandler: [
      webAuth('waiter_list'),
      validate(WaiterValidation.cityMasterValidation),
    ],
    handler: WaiterController.cityzenWaiterList,
  });
  route({
    method: 'PATCH',
    url: '/update_waiter_status/:waiterId',
    preHandler: [
      webAuth('update_waiter'),
      validate(WaiterValidation.updateWaiterStatusValidation),
    ],
    handler: WaiterController.updateWaiterStatus,
  });

  // Kitchen Owner Routes //
  route({
    method: 'GET',
    url: '/kitchen_owners_list/:master',
    preHandler: [
      webAuth('get_kitchen_owner_list'),
      validate(KitchenOwnerValidation.cityMasterValidation),
    ],
    handler: KitchenOwnerController.cityzenKitchenOwnerList,
  });
  route({
    method: 'PATCH',
    url: '/kitchen_owner/update_kitchen_status/:kitchenId',
    preHandler: [
      webAuth('update_kitchen_status'),
      validate(KitchenOwnerValidation.updateKitchenOwnerStatusValidation),
    ],
    handler: KitchenOwnerController.updateKitchenOwnerStatus,
  });
  route({
    method: 'GET',
    url: '/kitchen_owner/info/:kitchenId',
    preHandler: [
      webAuth('kitchen_owner_info'),
      validate(KitchenOwnerValidation.idValidation),
    ],
    handler: KitchenOwnerController.getById,
  });
  route({
    method: 'PATCH',
    url: '/kitchen_owner/update_detail/:userId',
    preHandler: [
      webAuth('update_kitchen_owner'),
      validate(KitchenOwnerValidation.updateKitchenOwnerInfoValidation),
    ],
    handler: KitchenOwnerController.updateKitchenOwnerInfo,
  });
  // Kitchen Owner Routes //

  route({
    method: 'GET',
    url: '/restaurant_report_issue_list/:master',
    preHandler: [
      webAuth('restaurant_report_issue_list'),
      validate(ReportIssueRestaurantReasonValidation.cityMasterValidation),
    ],
    handler: ReportIssueRestaurantController.cityzenReportsList,
  });
  route({
    method: 'GET',
    url: '/hidden_restaurant_list/:master',
    preHandler: [
      webAuth('hidden_restaurant_list'),
      validate(HideRestaurantReasonValidation.cityMasterValidation),
    ],
    handler: HideRestaurantController.cityzentHiddenRestaurantList,
  });
  route({
    method: 'GET',
    url: '/system_deliveryman_list/:master',
    preHandler: [
      webAuth('deliveryman_list'),
      validate(DriverValidation.cityMasterValidation),
    ],
    handler: DriverController.cityzenSystemDriver,
  });
  route({
    method: 'PATCH',
    url: '/update_status_deliveryman/:driverId',
    preHandler: [
      webAuth('update_deliveryman'),
      validate(DriverValidation.idValidation),
    ],
    handler: DriverController.updateStatus,
  });
  route({
    method: 'GET',
    url: '/vendor_deliveyman_list/:master',
    preHandler: [
      webAuth('deliveryman_list'),
      validate(DriverValidation.cityMasterValidation),
    ],
    handler: DriverController.cityzenVendorDriverList,
  });

  route({
    method: 'GET',
    url: '/deliveryman_joining_request/:status/:master',
    preHandler: [
      webAuth('deliveryman_joining_request'),
      validate(DeliverymanJoiningRequestValidation.cityzenValidation),
    ],
    handler: DeliverymanJoiningRequestController.cityzentJoiningRequestList,
  });
  route({
    method: 'DELETE',
    url: '/delete_deliveryman_request/:id',
    preHandler: [
      webAuth('delete_deliveryman_request'),
      validate(DeliverymanJoiningRequestValidation.idValidation),
    ],
    handler: DeliverymanJoiningRequestController.deleteRequest,
  });

  route({
    method: 'GET',
    url: '/media_list',
    preHandler: [webAuth('media_list')],
    handler: MediaController.get,
  });

  route({
    method: 'GET',
    url: '/waiter_detail/:waiterId',
    preHandler: [
      webAuth('waiter_detail'),
      validate(WaiterValidation.idValidation),
    ],
    handler: WaiterController.getById,
  });
  route({
    method: 'PATCH',
    url: '/update_waiter_detail/:userId',
    preHandler: [
      webAuth('update_waiter'),
      validate(WaiterValidation.updateWaiterInfoValidation),
    ],
    handler: WaiterController.updateWaiterInfo,
  });

  route({
    method: 'GET',
    url: '/basic_data_for_new_restaurant/:master',
    preHandler: [
      webAuth('create_restaurant'),
      validate(AuthValidation.cityMasterValidation),
    ],
    handler: RestaurantController.cityzenBasicDataForNewRestaurant,
  });
  route({
    method: 'GET',
    url: '/restaurant_deep_detail/:restaurantId',
    preHandler: [
      webAuth('restaurant_detail'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.cityzenRestuarantGetById,
  });
  route({
    method: 'PATCH',
    url: '/update_restaurant_detail/:restaurantId/:master',
    preHandler: [
      webAuth('update_restaurant'),
      validate(RestaurantValidation.cityzenUpdateValidation),
    ],
    handler: RestaurantController.cityzenUpdateRestaurant,
  });
  route({
    method: 'POST',
    url: '/create_restaurant/:master',
    preHandler: [
      webAuth('create_restaurant'),
      validate(RestaurantValidation.cityzenCreateVendor),
    ],
    handler: RestaurantController.cityzenRegisterVendorAccount,
  });

  route({
    method: 'GET',
    url: '/localities_from_city/:cityId',
    preHandler: [
      webAuth('localities'),
      validate(CityValidation.idValidation),
    ],
    handler: LocalityController.getByCityId,
  });

  route({
    method: 'GET',
    url: '/restaurant_register_request_detail/:id',
    preHandler: [
      webAuth('restaurant_register_request_detail'),
      validate(RestaurantJoiningRequestValidation.idValidation),
    ],
    handler: RestaurantJoiningRequestController.cityzenGetDetail,
  });
  route({
    method: 'PATCH',
    url: '/reject_restaurant_register_request/:id',
    preHandler: [
      webAuth('reject_restaurant_register_request'),
      validate(RestaurantJoiningRequestValidation.rejectValidation),
    ],
    handler: RestaurantJoiningRequestController.rejectRequest,
  });
  route({
    method: 'POST',
    url: '/accept_restaurant_register_request/:id/:master',
    preHandler: [
      webAuth('accept_restaurant_register_request'),
      validate(RestaurantJoiningRequestValidation.cityzenApproveValidation),
    ],
    handler: RestaurantJoiningRequestController.cityzenApproveRequest,
  });

  route({
    method: 'GET',
    url: '/deliveryman_basic_data/:master',
    preHandler: [
      webAuth('create_deliveryman'),
      validate(AuthValidation.cityMasterValidation),
    ],
    handler: DriverController.cityzenBasicData,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/:driverId',
    preHandler: [
      webAuth('deliveryman_detail'),
      validate(DriverValidation.idValidation),
    ],
    handler: DriverController.cityzenDeliverymanGetById,
  });
  route({
    method: 'PATCH',
    url: '/update_deliveryman_detail/:driverId/:master',
    preHandler: [
      webAuth('update_deliveryman'),
      validate(DriverValidation.cityzenUpdateValidation),
    ],
    handler: DriverController.cityzenUpdate,
  });
  route({
    method: 'POST',
    url: '/create_deliveryman/:master',
    preHandler: [
      webAuth('create_deliveryman'),
      validate(DriverValidation.cityzenCreateDriver),
    ],
    handler: DriverController.cityzenRegisterDriverAccount,
  });
  route({
    method: 'GET',
    url: '/deliveryman_joining_detail/:id',
    preHandler: [
      webAuth('deliveryman_joining_detail'),
      validate(DeliverymanJoiningRequestValidation.idValidation),
    ],
    handler: DeliverymanJoiningRequestController.cityzenGetDetail,
  });
  route({
    method: 'PATCH',
    url: '/reject_deliveryman_register_request/:id',
    preHandler: [
      webAuth('reject_deliveryman_register_request'),
      validate(DeliverymanJoiningRequestValidation.rejectValidation),
    ],
    handler: DeliverymanJoiningRequestController.rejectRequest,
  });
  route({
    method: 'POST',
    url: '/approve_deliveryman_register_request/:id/:master',
    preHandler: [
      webAuth('approve_deliveryman_register_request'),
      validate(DeliverymanJoiningRequestValidation.cityzenApproveValidation),
    ],
    handler: DeliverymanJoiningRequestController.cityzenApproveRequest,
  });

  route({
    method: 'GET',
    url: '/pos_initial/:master',
    preHandler: [
      webAuth('pos_order'),
      validate(AuthValidation.cityMasterValidation),
    ],
    handler: CityController.cityzenPos,
  });
  route({
    method: 'GET',
    url: '/pos_categories/:restaurantId',
    preHandler: [
      webAuth('pos_order'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.posRestaurantData,
  });
  route({
    method: 'POST',
    url: '/pos_food_list/',
    preHandler: [
      webAuth('pos_order'),
      validate(RestaurantValidation.posFoodListWebValidation),
    ],
    handler: RestaurantController.getPosFoodDataWeb,
  });
  route({
    method: 'GET',
    url: '/pos_search/:vendor/:searchQuery',
    preHandler: [
      webAuth('pos_order'),
      validate(RestaurantValidation.posFoodSearchValidation),
    ],
    handler: RestaurantController.posFoodSearch,
  });
  route({
    method: 'GET',
    url: '/pos_customer_detail/:user',
    preHandler: [
      webAuth('pos_order'),
      validate(UserValidation.idValidation),
    ],
    handler: UserController.adminPosCustomerDetail,
  });

  route({
    method: 'GET',
    url: '/search_customer/:name',
    preHandler: [
      webAuth('search_customer'),
      validate(UserValidation.searchUser),
    ],
    handler: UserController.findUserWithName,
  });
  route({
    method: 'POST',
    url: '/pos_create_customer',
    preHandler: [
      webAuth('create_customer'),
      validate(AuthValidation.cityzenAddCustomerValidation),
    ],
    handler: UserController.cityzenCreateCustomer,
  });
  route({
    method: 'POST',
    url: '/pos_place_order',
    preHandler: [
      webAuth('pos_order'),
      validate(OrdersValidation.cityzenPOSOrderValidation),
    ],
    handler: OrdersController.placePOSCityzenOrder,
  });

  route({
    method: 'GET',
    url: '/orders_count/:master',
    preHandler: [
      webAuth('order_list'),
      validate(AuthValidation.cityMasterValidation),
    ],
    handler: OrdersController.cityzenOrderCounts,
  });
  route({
    method: 'GET',
    url: '/order_list/:master',
    preHandler: [
      webAuth('order_list'),
      validate(OrdersValidation.cityzenOrderValidation),
    ],
    handler: OrdersController.cityzenOrderList,
  });
  route({
    method: 'GET',
    url: '/cityzen_order_detail/:id',
    preHandler: [
      webAuth('order_detail'),
      validate(OrdersValidation.orderDetailAdminValidation),
    ],
    handler: OrdersController.getOrderDetailAdmin,
  });
  route({
    method: 'GET',
    url: '/cityzen_order_invoice/:id',
    preHandler: [
      webAuth('order_detail'),
      validate(OrdersValidation.adminInvoiceValidation),
    ],
    handler: OrdersController.adminOrderInvoice,
  });
  route({
    method: 'GET',
    url: '/un_assinged_order_list/:master',
    preHandler: [
      webAuth('order_list'),
      validate(OrdersValidation.cityzenUnAssignedOrderValidation),
    ],
    handler: OrdersController.cityzenUnAssignedOrderList,
  });
  route({
    method: 'GET',
    url: '/fetch_deliveryman_near_order/:id/:restaurant',
    preHandler: [
      webAuth('fetch_deliveryman_near_order'),
      validate(OrdersValidation.findDriverValidation),
    ],
    handler: OrdersController.fetchDriverNearToOrder,
  });
  route({
    method: 'POST',
    url: '/assign_order_deliveryman',
    preHandler: [
      webAuth('assign_order_deliveryman'),
      validate(OrdersValidation.assignDriverOrderAdminValidation),
    ],
    handler: OrdersController.assignDriverOrderAdmin,
  });

  route({
    method: 'GET',
    url: '/pos_order_list/:master',
    preHandler: [
      webAuth('pos_order_list'),
      validate(PosOrTableOrderValidation.cityMasterValidation),
    ],
    handler: PosOrTableOrderController.cityzenPosOrderList,
  });
  route({
    method: 'GET',
    url: '/cityzen_pos_order_detail/:id',
    preHandler: [
      webAuth('pos_order_detail'),
      validate(PosOrTableOrderValidation.cityzenPosOrderDetailValidation),
    ],
    handler: PosOrTableOrderController.cityzenPosOrderDetail,
  });
  route({
    method: 'GET',
    url: '/cityzen_pos_order_invoice/:id',
    preHandler: [
      webAuth('pos_order_detail'),
      validate(PosOrTableOrderValidation.orderInvoiceValidation),
    ],
    handler: PosOrTableOrderController.adminPOSOrderInvoice,
  });

  route({
    method: 'GET',
    url: '/table_order_list/:master',
    preHandler: [
      webAuth('table_order_list'),
      validate(TableOrderValidation.cityMasterValidation),
    ],
    handler: TableOrderController.cityzenTableOrderList,
  });
  route({
    method: 'GET',
    url: '/cityzen_table_order_detail/:id',
    preHandler: [
      webAuth('table_order_detail'),
      validate(TableOrderValidation.cityzenTableOrderDetailValidation),
    ],
    handler: TableOrderController.cityzenTableOrderDetail,
  });
  route({
    method: 'GET',
    url: '/cityzen_table_order_invoice/:id',
    preHandler: [
      webAuth('table_order_detail'),
      validate(TableOrderValidation.orderInvoiceValidation),
    ],
    handler: TableOrderController.adminTableOrderInvoice,
  });

  route({
    method: 'GET',
    url: '/food_list/:master',
    preHandler: [
      webAuth('food_list'),
      validate(FoodValidation.cityMasterValidation),
    ],
    handler: FoodController.cityzenFoodList,
  });
  route({
    method: 'PATCH',
    url: '/update_food_meta_detail/:foodId',
    preHandler: [
      webAuth('update_food'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.updateMetaInfo,
  });
  route({
    method: 'GET',
    url: '/food_detail/:foodId',
    preHandler: [
      webAuth('food_detail'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.adminFoodDetail,
  });

  route({
    method: 'GET',
    url: '/restaurant_cityzen/:master',
    preHandler: [
      webAuth('restaurant_cityzen'),
      validate(AuthValidation.cityMasterValidation),
    ],
    handler: RestaurantController.cityzenRestaurantsLimitedDetails,
  });
  route({
    method: 'GET',
    url: '/food_get_basic_data/:restaurant',
    preHandler: [
      webAuth('create_food'),
      validate(FoodValidation.myFoodValidation),
    ],
    handler: FoodController.getBasicData,
  });
  route({
    method: 'GET',
    url: '/sub_cateories_list/:category',
    preHandler: [webAuth('categories_list')],
    handler: SubCategoryController.getActiveByCategoryId,
  });
  route({
    method: 'GET',
    url: '/vendor_sub_categories_list/:category/:restaurant',
    preHandler: [
      webAuth('categories_list'),
      validate(VendorSubCategoryValidation.mySubCategoryByCateIdValidation),
    ],
    handler: VendorSubCategoryController.getAllSubCategoryById,
  });
  route({
    method: 'POST',
    url: '/create_food',
    preHandler: [
      webAuth('create_food'),
      validate(FoodValidation.createFood),
    ],
    handler: FoodController.create,
  });
  route({
    method: 'GET',
    url: '/food_deep_detail/:foodId',
    preHandler: [
      webAuth('food_detail'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.getFoodInfoForAdmin,
  });
  route({
    method: 'PATCH',
    url: '/update_food_detail/:foodId',
    preHandler: [
      webAuth('update_food'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.update,
  });
  route({
    method: 'DELETE',
    url: '/delete_food/:foodId',
    preHandler: [
      webAuth('delete_food'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.drop,
  });

  route({
    method: 'GET',
    url: '/addons_list/:master',
    preHandler: [
      webAuth('addon_list'),
      validate(AddonsValidation.cityMasterValidation),
    ],
    handler: AddonsController.cityzenAddonList,
  });
  route({
    method: 'PATCH',
    url: '/update_addons/:addonId',
    preHandler: [
      webAuth('update_addon'),
      validate(AddonsValidation.idValidation),
    ],
    handler: AddonsController.update,
  });
  route({
    method: 'POST',
    url: '/create_addon',
    preHandler: [
      webAuth('create_addon'),
      validate(AddonsValidation.createAddons),
    ],
    handler: AddonsController.create,
  });
  route({
    method: 'DELETE',
    url: '/delete_addons/:addonId',
    preHandler: [
      webAuth('delete_addons'),
      validate(AddonsValidation.idValidation),
    ],
    handler: AddonsController.drop,
  });

  route({
    method: 'GET',
    url: '/restaurant_food_taxation_list/:master',
    preHandler: [
      webAuth('restaurant_food_taxation_list'),
      validate(FoodTaxationValidation.cityMasterValidation),
    ],
    handler: FoodTaxationController.cityzenTaxationList,
  });
  route({
    method: 'DELETE',
    url: '/delete_food_taxation/:restaurant',
    preHandler: [
      webAuth('delete_food_taxation'),
      validate(FoodTaxationValidation.deleteAdminValidation),
    ],
    handler: FoodTaxationController.deleteTaxationAdmin,
  });

  route({
    method: 'GET',
    url: '/tiffin_packages_list/:master',
    preHandler: [
      webAuth('tiffin_packages'),
      validate(SubscriptionTiffinPackageValidation.cityMasterValidation),
    ],
    handler: SubscriptionTiffinPackageController.cityzenPackageList,
  });
  route({
    method: 'GET',
    url: '/food_list_for_tiffin_packages/:restaurant',
    preHandler: [
      webAuth('tiffin_packages'),
      validate(SubscriptionTiffinPackageValidation.getBasicValidation),
    ],
    handler: SubscriptionTiffinPackageController.getBasic,
  });
  route({
    method: 'POST',
    url: '/create_tiffin_package/',
    preHandler: [
      webAuth('create_tiffin_package'),
      validate(SubscriptionTiffinPackageValidation.createSubscriptionTiffinValidation),
    ],
    handler: SubscriptionTiffinPackageController.create,
  });
  route({
    method: 'GET',
    url: '/tiffin_package_details/:id/:restaurant',
    preHandler: [
      webAuth('tiffin_packages'),
      validate(SubscriptionTiffinPackageValidation.idValidation),
    ],
    handler: SubscriptionTiffinPackageController.getById,
  });
  route({
    method: 'PATCH',
    url: '/update_tiffin_package/:id',
    preHandler: [
      webAuth('update_tiffin_package'),
      validate(SubscriptionTiffinPackageValidation.updateValidation),
    ],
    handler: SubscriptionTiffinPackageController.updatePackage,
  });
  route({
    method: 'PATCH',
    url: '/update_tiffin_package_status/:id',
    preHandler: [
      webAuth('update_tiffin_package'),
      validate(SubscriptionTiffinPackageValidation.updateAdminStatusValidation),
    ],
    handler: SubscriptionTiffinPackageController.updatePackageStatus,
  });
  route({
    method: 'DELETE',
    url: '/delete_tiffin_package/:id',
    preHandler: [
      webAuth('delete_tiffin_package'),
      validate(SubscriptionTiffinPackageValidation.deleteValidation),
    ],
    handler: SubscriptionTiffinPackageController.drop,
  });
  route({
    method: 'POST',
    url: '/customer_purchased_tiffin_package_list/',
    preHandler: [
      webAuth('tiffin_packages'),
      validate(UserPurchasedTiffinSubscriptionValidation.purchasedSubscriptionListAdminValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.getPurchaseListForAdmin,
  });
  route({
    method: 'GET',
    url: '/customer_purchased_tiffin_package_detail/:id',
    preHandler: [
      webAuth('tiffin_packages'),
      validate(UserPurchasedTiffinSubscriptionValidation.purchaseDetailValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.getPurchaseDetailAdmin,
  });
  route({
    method: 'GET',
    url: '/tiffin_subscription_order_list/:master',
    preHandler: [
      webAuth('order_list'),
      validate(OrdersValidation.cityzenSubscriptionOrderValidation),
    ],
    handler: OrdersController.cityzenSubscriptionOrderList,
  });

  route({
    method: 'GET',
    url: '/order_refund_request/:master',
    preHandler: [
      webAuth('order_refund_request'),
      validate(RefundRequestValidation.cityMasterValidation),
    ],
    handler: RefundRequestController.cityzenRefundRequest,
  });
  route({
    method: 'GET',
    url: '/order_refund_request_detail/:requestId',
    preHandler: [
      webAuth('order_refund_request'),
      validate(RefundRequestValidation.getRefundRequestInfoValidation),
    ],
    handler: RefundRequestController.getRefundRequestInfo,
  });
  route({
    method: 'POST',
    url: '/refund_request/refundFromMerchant',
    preHandler: [
      webAuth('refund_from_merchant'),
      validate(RefundRequestValidation.refundFromMerchantValidation),
    ],
    handler: RefundRequestController.refundFromMerchant,
  });
  route({
    method: 'POST',
    url: '/refund_request/approve',
    preHandler: [
      webAuth('approve_refund_request'),
      validate(RefundRequestValidation.approveRefundRequestValidation),
    ],
    handler: RefundRequestController.approveRefundRequest,
  });
  route({
    method: 'POST',
    url: '/refund_request/cancel',
    preHandler: [
      webAuth('cancel_refund_request'),
      validate(RefundRequestValidation.cancelRefundRequestValidation),
    ],
    handler: RefundRequestController.cancelRefundRequest,
  });

  route({
    method: 'GET',
    url: '/tiffin_subscription_refund_request_list/:master',
    preHandler: [
      webAuth('tiffin_subscription_refund_request'),
      validate(TiffinSubscriptionRefundRequestValidation.cityMasterValidation),
    ],
    handler: TiffinSubscriptionRefundRequestController.cityzenRefundRequest,
  });
  route({
    method: 'GET',
    url: '/tiffin_subscription_refund_request_detail/:requestId',
    preHandler: [
      webAuth('tiffin_subscription_refund_request'),
      validate(
      TiffinSubscriptionRefundRequestValidation.getTiffinSubscriptionRefundRequestInfoValidation
    ),
    ],
    handler: TiffinSubscriptionRefundRequestController.getTiffinSubscriptionRefundRequestInfo,
  });
  route({
    method: 'POST',
    url: '/tiffin_subscription_refund_request/refundFromMerchant',
    preHandler: [
      webAuth('refund_tiffin_subscription_from_merchant'),
      validate(TiffinSubscriptionRefundRequestValidation.refundFromMerchantValidation),
    ],
    handler: TiffinSubscriptionRefundRequestController.refundFromMerchant,
  });
  route({
    method: 'POST',
    url: '/tiffin_subscription_refund_request/approve',
    preHandler: [
      webAuth('approve_tiffin_subscription_refund_request'),
      validate(TiffinSubscriptionRefundRequestValidation.approveRefundRequestValidation),
    ],
    handler: TiffinSubscriptionRefundRequestController.approveRefundRequest,
  });
  route({
    method: 'POST',
    url: '/tiffin_subscription_refund_request/cancel',
    preHandler: [
      webAuth('cancel_tiffin_subscription_refund_request'),
      validate(TiffinSubscriptionRefundRequestValidation.cancelRefundRequestValidation),
    ],
    handler: TiffinSubscriptionRefundRequestController.cancelRefundRequest,
  });

  route({
    method: 'GET',
    url: '/dining_booking_refund_request_list/:master',
    preHandler: [
      webAuth('dining_booking_refund_request'),
      validate(DiningBookingRefundRequestValidation.cityMasterValidation),
    ],
    handler: DiningBookingRefundRequestController.cityzenRefundRequest,
  });
  route({
    method: 'GET',
    url: '/dining_booking_refund_request/info/:requestId',
    preHandler: [
      webAuth('dining_booking_refund_request'),
      validate(DiningBookingRefundRequestValidation.getRefundRequestInfoValidation),
    ],
    handler: DiningBookingRefundRequestController.getRefundRequestInfo,
  });
  route({
    method: 'POST',
    url: '/dining_booking_refund_request/refundFromMerchant',
    preHandler: [
      webAuth('refund_dining_booking_from_merchant'),
      validate(DiningBookingRefundRequestValidation.refundFromMerchantValidation),
    ],
    handler: DiningBookingRefundRequestController.refundFromMerchant,
  });
  route({
    method: 'POST',
    url: '/dining_booking_refund_request/approve',
    preHandler: [
      webAuth('approve_dining_booking_refund_request'),
      validate(DiningBookingRefundRequestValidation.approveRefundRequestValidation),
    ],
    handler: DiningBookingRefundRequestController.approveRefundRequest,
  });
  route({
    method: 'POST',
    url: '/dining_booking_refund_request/cancel',
    preHandler: [
      webAuth('cancel_dining_booking_refund_request'),
      validate(DiningBookingRefundRequestValidation.cancelRefundRequestValidation),
    ],
    handler: DiningBookingRefundRequestController.cancelRefundRequest,
  });

  route({
    method: 'GET',
    url: '/orders_complaint_list/:master',
    preHandler: [
      webAuth('orders_complaint'),
      validate(UserValidation.cityzenComplaintValidation),
    ],
    handler: ComplaintsController.cityzenComplaints,
  });
  route({
    method: 'GET',
    url: '/restaurant_complaints_list/:master',
    preHandler: [
      webAuth('restaurant_complaint'),
      validate(UserValidation.cityzenRestaurantComplaintValidation),
    ],
    handler: RestaurantComplaintsController.cityzenComplaints,
  });

  route({
    method: 'GET',
    url: '/dining_booking_count/:master',
    preHandler: [
      webAuth('dining_booking_list'),
      validate(AuthValidation.cityMasterValidation),
    ],
    handler: DiningBookingController.cityzenDiningBookingCount,
  });
  route({
    method: 'GET',
    url: '/dining_booking_list/:master',
    preHandler: [
      webAuth('dining_booking_list'),
      validate(DiningBookingValidation.cityzenBookingValidation),
    ],
    handler: DiningBookingController.cityzenDiningBookingList,
  });
  route({
    method: 'GET',
    url: '/dining_booking_detail/:bookingId',
    preHandler: [
      webAuth('dining_booking_detail'),
      validate(DiningBookingValidation.bookingInformationAdminValidation),
    ],
    handler: DiningBookingController.getDiningBookingInfoAdmin,
  });

  route({
    method: 'GET',
    url: '/restaurant_campaign_list/:master',
    preHandler: [
      webAuth('restaurant_campaign'),
      validate(RestaurantCampaignValidation.cityMasterValidation),
    ],
    handler: RestaurantCampaignController.cityzenCampaignList,
  });
  route({
    method: 'PATCH',
    url: '/update_restaurant_campaign_status/:campaignId',
    preHandler: [
      webAuth('update_restaurant_campaign'),
      validate(RestaurantCampaignValidation.idValidation),
    ],
    handler: RestaurantCampaignController.updateStatus,
  });
  route({
    method: 'GET',
    url: '/restaurant_campaign_request_list/:campaignId',
    preHandler: [
      webAuth('restaurant_campaign_request'),
      validate(RestaurantCampaignRequestValidation.idValidation),
    ],
    handler: RestaurantCampaignRequestController.get,
  });
  route({
    method: 'GET',
    url: '/accept_restaurant_campaign_request/:campaignId/:restaurantId',
    preHandler: [
      webAuth('accept_restaurant_campaign_request'),
      validate(RestaurantCampaignValidation.leaveAndJoinCampaignValidation),
    ],
    handler: RestaurantCampaignController.joinCampaign,
  });
  route({
    method: 'DELETE',
    url: '/reject_restaurant_campaign_request/:campaignId',
    preHandler: [
      webAuth('reject_restaurant_campaign_request'),
      validate(RestaurantCampaignRequestValidation.idValidation),
    ],
    handler: RestaurantCampaignRequestController.drop,
  });
  route({
    method: 'GET',
    url: '/restaurant_campaign_detail/:id',
    preHandler: [
      webAuth('restaurant_campaign'),
      validate(RestaurantCampaignValidation.detailValidation),
    ],
    handler: RestaurantCampaignController.detail,
  });
  route({
    method: 'POST',
    url: '/create_restaurant_campaign/:master',
    preHandler: [
      webAuth('create_restaurant_campaign'),
      validate(RestaurantCampaignValidation.cityzenCreateRestaurantCampaign),
    ],
    handler: RestaurantCampaignController.cityzenCreateCampaign,
  });
  route({
    method: 'GET',
    url: '/restaurant_campaign_deep_detail/:campaignId',
    preHandler: [
      webAuth('restaurant_campaign'),
      validate(RestaurantCampaignValidation.idValidation),
    ],
    handler: RestaurantCampaignController.cityzenCampaignById,
  });
  route({
    method: 'PATCH',
    url: '/update_restaurant_campaign/:campaignId',
    preHandler: [
      webAuth('update_restaurant_campaign'),
      validate(RestaurantCampaignValidation.idValidation),
    ],
    handler: RestaurantCampaignController.update,
  });
  route({
    method: 'DELETE',
    url: '/delete_restaurant_campaign/:campaignId',
    preHandler: [
      webAuth('delete_restaurant_campaign'),
      validate(RestaurantCampaignValidation.idValidation),
    ],
    handler: RestaurantCampaignController.drop,
  });

  route({
    method: 'GET',
    url: '/dining_campaign_list/:master',
    preHandler: [
      webAuth('dining_campaign'),
      validate(DiningCampaignValidation.cityMasterValidation),
    ],
    handler: DiningCampaignController.cityzenCampaignList,
  });
  route({
    method: 'PATCH',
    url: '/update_dining_campaign_status/:campaignId',
    preHandler: [
      webAuth('update_dining_campaign'),
      validate(DiningCampaignValidation.idValidation),
    ],
    handler: DiningCampaignController.updateStatus,
  });

  route({
    method: 'GET',
    url: '/dining_campaign_request_list/:campaignId',
    preHandler: [
      webAuth('dining_campaign_request'),
      validate(DiningCampaignRequestValidation.idValidation),
    ],
    handler: DiningCampaignRequestController.get,
  });
  route({
    method: 'GET',
    url: '/accept_dining_campaign_request/:campaignId/:restaurantId',
    preHandler: [
      webAuth('accept_dining_campaign_request'),
      validate(DiningCampaignValidation.leaveAndJoinCampaignValidation),
    ],
    handler: DiningCampaignController.joinCampaign,
  });
  route({
    method: 'DELETE',
    url: '/reject_dining_campaign_request/:campaignId',
    preHandler: [
      webAuth('reject_dining_campaign_request'),
      validate(DiningCampaignRequestValidation.idValidation),
    ],
    handler: DiningCampaignRequestController.drop,
  });
  route({
    method: 'GET',
    url: '/dining_campaign_detail/:id',
    preHandler: [
      webAuth('dining_campaign'),
      validate(DiningCampaignValidation.detailValidation),
    ],
    handler: DiningCampaignController.detail,
  });

  route({
    method: 'POST',
    url: '/create_dining_campaign/:master',
    preHandler: [
      webAuth('create_dining_campaign'),
      validate(DiningCampaignValidation.cityzenCreateDiningCampaignValidation),
    ],
    handler: DiningCampaignController.cityzenCreateCampaign,
  });
  route({
    method: 'GET',
    url: '/dining_campaign_deep_detail/:campaignId',
    preHandler: [
      webAuth('dining_campaign'),
      validate(DiningCampaignValidation.idValidation),
    ],
    handler: DiningCampaignController.cityzenDeepDetail,
  });
  route({
    method: 'PATCH',
    url: '/update_dining_campaign/:campaignId',
    preHandler: [
      webAuth('update_dining_campaign'),
      validate(DiningCampaignValidation.idValidation),
    ],
    handler: DiningCampaignController.update,
  });
  route({
    method: 'DELETE',
    url: '/delete_dining_campaign/:campaignId',
    preHandler: [
      webAuth('delete_dining_campaign'),
      validate(DiningCampaignValidation.idValidation),
    ],
    handler: DiningCampaignController.drop,
  });

  route({
    method: 'GET',
    url: '/food_campaign_list/:master',
    preHandler: [
      webAuth('food_campaign'),
      validate(FoodCampaignValidation.cityMasterValidation),
    ],
    handler: FoodCampaignController.cityzenCampaignList,
  });
  route({
    method: 'PATCH',
    url: '/update_food_campaign_status/:campaignId',
    preHandler: [
      webAuth('update_food_campaign'),
      validate(FoodCampaignValidation.idValidation),
    ],
    handler: FoodCampaignController.updateStatus,
  });
  route({
    method: 'GET',
    url: '/food_campaign_detail/:id',
    preHandler: [
      webAuth('food_campaign'),
      validate(FoodCampaignValidation.detailValidation),
    ],
    handler: FoodCampaignController.detail,
  });

  route({
    method: 'GET',
    url: '/food_campaign_request_list/:campaignId',
    preHandler: [
      webAuth('food_campaign_request'),
      validate(FoodCampaignRequestValidation.idValidation),
    ],
    handler: FoodCampaignRequestController.get,
  });
  route({
    method: 'GET',
    url: '/accept_food_campaign_request/:campaignId/:foodId',
    preHandler: [
      webAuth('accept_food_campaign_request'),
      validate(FoodCampaignValidation.leaveAndJoinCampaignIdValidation),
    ],
    handler: FoodCampaignController.joinCampaign,
  });
  route({
    method: 'DELETE',
    url: '/reject_food_campaign_request/:campaignId',
    preHandler: [
      webAuth('reject_food_campaign_request'),
      validate(FoodCampaignRequestValidation.idValidation),
    ],
    handler: FoodCampaignRequestController.drop,
  });
  route({
    method: 'GET',
    url: '/food_list_for_campaign/:restaurantId',
    preHandler: [
      webAuth('food_list_for_campaign'),
      validate(FoodCampaignValidation.restaurantIdValidation),
    ],
    handler: FoodCampaignController.getFoodByRestaurantId,
  });
  route({
    method: 'POST',
    url: '/create_food_campaign/:master',
    preHandler: [
      webAuth('create_food_campaign'),
      validate(FoodCampaignValidation.cityzenCreateFoodCampaign),
    ],
    handler: FoodCampaignController.cityzenCreateCampaign,
  });
  route({
    method: 'GET',
    url: '/food_campaign_deep_detail/:campaignId',
    preHandler: [
      webAuth('food_campaign'),
      validate(FoodCampaignValidation.idValidation),
    ],
    handler: FoodCampaignController.cityzenDeepDetail,
  });
  route({
    method: 'PATCH',
    url: '/update_food_campaign/:campaignId',
    preHandler: [
      webAuth('update_food_campaign'),
      validate(FoodCampaignValidation.idValidation),
    ],
    handler: FoodCampaignController.update,
  });
  route({
    method: 'DELETE',
    url: '/delete_food_campaign/:campaignId',
    preHandler: [
      webAuth('delete_food_campaign'),
      validate(FoodCampaignValidation.idValidation),
    ],
    handler: FoodCampaignController.drop,
  });

  route({
    method: 'GET',
    url: '/media_files_list/:master',
    preHandler: [
      webAuth('media_files_list'),
      validate(AuthValidation.cityMasterValidation),
    ],
    handler: MediaController.cityzenMediaFiles,
  });
  route({
    method: 'DELETE',
    url: '/delete_media_files/:path',
    preHandler: [
      webAuth('delete_media_files'),
      validate(FileValidation.pathValidation),
    ],
    handler: MediaController.drop,
  });

  route({
    method: 'GET',
    url: '/banners_list/:master',
    preHandler: [
      webAuth('banners_list'),
      validate(BannersValidation.cityMasterValidation),
    ],
    handler: BannersController.cityzenBannerList,
  });
  route({
    method: 'PATCH',
    url: '/update_banner_status/:bannerId',
    preHandler: [
      webAuth('update_banner'),
      validate(BannersValidation.idValidation),
    ],
    handler: BannersController.updateStatus,
  });

  route({
    method: 'GET',
    url: '/food_list_from_city/:master',
    preHandler: [
      webAuth('food_list_from_city'),
      validate(AuthValidation.cityMasterValidation),
    ],
    handler: FoodController.cityzenFoodListForBanner,
  });
  route({
    method: 'POST',
    url: '/create_banner/:master',
    preHandler: [
      webAuth('create_banner'),
      validate(BannersValidation.cityzenCreateBanner),
    ],
    handler: BannersController.cityzenCreateBanner,
  });
  route({
    method: 'PATCH',
    url: '/update_banner/:bannerId/:master',
    preHandler: [
      webAuth('update_banner'),
      validate(BannersValidation.cityzenUpdateValidation),
    ],
    handler: BannersController.cityzenUpdate,
  });
  route({
    method: 'DELETE',
    url: '/delete_banner/:bannerId',
    preHandler: [
      webAuth('delete_banner'),
      validate(BannersValidation.idValidation),
    ],
    handler: BannersController.drop,
  });

  route({
    method: 'GET',
    url: '/coupon_list/:master',
    preHandler: [
      webAuth('coupon_list'),
      validate(CouponValidation.cityMasterValidation),
    ],
    handler: CouponController.cityzenCouponList,
  });
  route({
    method: 'PATCH',
    url: '/update_meta_coupon/:id',
    preHandler: [
      webAuth('update_coupon'),
      validate(CouponValidation.idValidation),
    ],
    handler: CouponController.updateMeta,
  });
  route({
    method: 'GET',
    url: '/coupon_detail/:id',
    preHandler: [
      webAuth('coupon_list'),
      validate(CouponValidation.detailValidation),
    ],
    handler: CouponController.couponDetail,
  });
  route({
    method: 'GET',
    url: '/redeem_order_list/:id',
    preHandler: [
      webAuth('redeem_order_list'),
      validate(OrdersValidation.couponValidation),
    ],
    handler: OrdersController.couponOrders,
  });

  route({
    method: 'POST',
    url: '/create_coupon/:master',
    preHandler: [
      webAuth('create_coupon'),
      validate(CouponValidation.cityzenCreateCoupon),
    ],
    handler: CouponController.cityzenCreateCoupon,
  });
  route({
    method: 'GET',
    url: '/coupon_deep_detail/:id',
    preHandler: [
      webAuth('coupon_list'),
      validate(CouponValidation.idValidation),
    ],
    handler: CouponController.cityzenCouponDetail,
  });
  route({
    method: 'PATCH',
    url: '/update_coupon/:id',
    preHandler: [
      webAuth('update_coupon'),
      validate(CouponValidation.idValidation),
    ],
    handler: CouponController.cityzenUpdateCoupon,
  });
  route({
    method: 'DELETE',
    url: '/delete_coupon/:id',
    preHandler: [
      webAuth('delete_coupon'),
      validate(CouponValidation.idValidation),
    ],
    handler: CouponController.drop,
  });

  route({
    method: 'GET',
    url: '/new_coupon_request/:master',
    preHandler: [
      webAuth('new_coupon_request'),
      validate(CouponValidation.cityMasterValidation),
    ],
    handler: CouponController.cityzenCouponRequest,
  });

  route({
    method: 'GET',
    url: '/dining_coupon_list/:master',
    preHandler: [
      webAuth('dining_coupon_list'),
      validate(DiningCouponValidation.cityMasterValidation),
    ],
    handler: DiningCouponController.cityzenCouponList,
  });
  route({
    method: 'PATCH',
    url: '/update_dining_coupon_meta/:id',
    preHandler: [
      webAuth('update_dining_coupon'),
      validate(DiningCouponValidation.idValidation),
    ],
    handler: DiningCouponController.updateMeta,
  });
  route({
    method: 'GET',
    url: '/dining_coupon_detail/:id',
    preHandler: [
      webAuth('dining_coupon_list'),
      validate(DiningCouponValidation.detailValidation),
    ],
    handler: DiningCouponController.couponDetail,
  });
  route({
    method: 'GET',
    url: '/coupon_dining_booking/:id',
    preHandler: [
      webAuth('dining_booking_list'),
      validate(DiningBookingValidation.couponValidation),
    ],
    handler: DiningBookingController.couponBooking,
  });
  route({
    method: 'POST',
    url: '/create_dining_coupon/:master',
    preHandler: [
      webAuth('create_dining_coupon'),
      validate(DiningCouponValidation.cityzenCreateCoupon),
    ],
    handler: DiningCouponController.cityzenCreateCoupon,
  });
  route({
    method: 'GET',
    url: '/dining_coupon_deep_detail/:id',
    preHandler: [
      webAuth('dining_coupon_list'),
      validate(DiningCouponValidation.idValidation),
    ],
    handler: DiningCouponController.cityzenDeepDetail,
  });
  route({
    method: 'PATCH',
    url: '/update_dining_coupon/:id',
    preHandler: [
      webAuth('update_dining_coupon'),
      validate(DiningCouponValidation.idValidation),
    ],
    handler: DiningCouponController.cityzenUpdateCoupon,
  });
  route({
    method: 'DELETE',
    url: '/delete_dining_coupon/:id',
    preHandler: [
      webAuth('delete_dining_coupon'),
      validate(DiningCouponValidation.idValidation),
    ],
    handler: DiningCouponController.drop,
  });
  route({
    method: 'GET',
    url: '/new_dining_coupon_request/:master',
    preHandler: [
      webAuth('new_dining_coupon_request'),
      validate(DiningCouponValidation.cityMasterValidation),
    ],
    handler: DiningCouponController.cityzenCouponRequest,
  });

  route({
    method: 'GET',
    url: '/cash_collection_list/:master',
    preHandler: [
      webAuth('cash_collection'),
      validate(CollectCashValidation.cityzenCollectCashListValidation),
    ],
    handler: CollectCashController.cityzenCollectionList,
  });

  route({
    method: 'GET',
    url: '/deliveryman_with_city/:master',
    preHandler: [
      webAuth('deliveryman_with_city'),
      validate(AuthValidation.cityMasterValidation),
    ],
    handler: DriverController.cityzenDeliverymanList,
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
      webAuth('restaurant_clear_cash_in_hand'),
      validate(RestaurantValidation.collectCashValidation),
    ],
    handler: RestaurantController.clearCashInHandAndUpdateWallet,
  });
  route({
    method: 'POST',
    url: '/deliveryman_clear_cash_in_hand',
    preHandler: [
      webAuth('deliveryman_clear_cash_in_hand'),
      validate(DriverValidation.collectCashValidation),
    ],
    handler: DriverController.clearCashInHand,
  });
  route({
    method: 'GET',
    url: '/restaurant_withdrawal_request/:master',
    preHandler: [
      webAuth('restaurant_withdrawal_request'),
      validate(WithdrawalRequestValidation.cityMasterValidation),
    ],
    handler: WithdrawalRequestController.cityzenRestaurantWithdrawal,
  });
  route({
    method: 'GET',
    url: '/deliveryman_withdrawal_request/:master',
    preHandler: [
      webAuth('deliveryman_withdrawal_request'),
      validate(WithdrawalRequestValidation.cityMasterValidation),
    ],
    handler: WithdrawalRequestController.cityzenDeliverymanWithdrawalRequest,
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
    url: '/restaurant_disbursement_list/:master',
    preHandler: [
      webAuth('restaurant_disbursement'),
      validate(DisbursementValidation.cityMasterValidation),
    ],
    handler: DisbursementController.cityzenRestaurantDisbursement,
  });
  route({
    method: 'GET',
    url: '/restaurant_disbursement_detail/:id',
    preHandler: [
      webAuth('restaurant_disbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.restaurantDisbursementDetail,
  });
  route({
    method: 'GET',
    url: '/accept_restaurant_disbursement/:id',
    preHandler: [
      webAuth('accept_restaurant_disbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.acceptRestaurantDisburment,
  });
  route({
    method: 'GET',
    url: '/decline_restaurant_disbursement/:id',
    preHandler: [
      webAuth('decline_restaurant_disbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.rejectRestaurantDisburment,
  });

  route({
    method: 'GET',
    url: '/deliveryman_disbursement_list/:master',
    preHandler: [
      webAuth('deliveryman_disbursement_list'),
      validate(DisbursementValidation.cityMasterValidation),
    ],
    handler: DisbursementController.cityzenDeliverymanDisbursement,
  });
  route({
    method: 'GET',
    url: '/deliveryman_disbursement_detail/:id',
    preHandler: [
      webAuth('deliveryman_disbursement_detail'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.deliverymanDisbursementDetail,
  });
  route({
    method: 'GET',
    url: '/accept_deliveryman_disbursement/:id',
    preHandler: [
      webAuth('accept_deliveryman_disbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.acceptDeliverymanDisbursment,
  });
  route({
    method: 'GET',
    url: '/decline_deliveryman_disbursement/:id',
    preHandler: [
      webAuth('decline_deliveryman_disbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.rejectDeliverymanDisbursment,
  });

  route({
    method: 'GET',
    url: '/restaurant_detail_info/:id',
    preHandler: [
      webAuth('restaurant_detail'),
      validate(RestaurantValidation.vendorInformationValidation),
    ],
    handler: RestaurantController.vendorInformation,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_order_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: OrdersController.vendorOrderList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_pos_order_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: PosOrTableOrderController.vendorPosOrderList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_table_order_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: TableOrderController.vendorTableOrderList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_booking_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: DiningBookingController.vendorBookingList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_food_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: FoodController.vendorFoodList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_waiter_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: WaiterController.vendorWaiterList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_deliveryman_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: DriverController.vendorDeliverymanList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_tiffin_packages_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: SubscriptionTiffinPackageController.vendorTiffinPackageList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_all_refund_request',
    preHandler: [webAuth('restaurant_detail')],
    handler: OrdersController.vendorAllRefundRequest,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_order_refund_request',
    preHandler: [webAuth('restaurant_detail')],
    handler: OrdersController.vendorOrderRefundRequest,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_tiffin_subscription_refund_request',
    preHandler: [webAuth('restaurant_detail')],
    handler: OrdersController.vendorTiffinRefundRequest,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_dining_refund_request',
    preHandler: [webAuth('restaurant_detail')],
    handler: OrdersController.vendorDiningRefundRequest,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_complaint_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: ComplaintsController.vendorComplaintList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_order_complaint_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: ComplaintsController.vendorUserOrderComplaintList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_own_complaint_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: ComplaintsController.vendorOwnOrderComplaintList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_outlet_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: RestaurantController.vendorOutletList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_disbursement_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: DisbursementController.vendorDisbursementList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_collected_cash_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: CollectCashController.vendorCollectedCashList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_payout_accounts',
    preHandler: [webAuth('restaurant_detail')],
    handler: RestaurantPayoutMethodController.vendorPayoutAccounts,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_withdrawal_request_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: WithdrawalRequestController.vendorWithdrawalRequest,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_wallet_transactions',
    preHandler: [webAuth('restaurant_detail')],
    handler: WalletController.vendorTransactionList,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_all_reviews',
    preHandler: [webAuth('restaurant_detail')],
    handler: ReviewRatingController.vendorAllReviews,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_vendor_food_reviews',
    preHandler: [webAuth('restaurant_detail')],
    handler: ReviewRatingController.vendorFoodReviews,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_own_reviews',
    preHandler: [webAuth('restaurant_detail')],
    handler: ReviewRatingController.vendorReviews,
  });
  route({
    method: 'GET',
    url: '/restaurant_detail_media_files',
    preHandler: [webAuth('restaurant_detail')],
    handler: MediaController.vendorMediaFiles,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/kitchen_owner_list',
    preHandler: [webAuth('restaurant_detail')],
    handler: KitchenOwnerController.vendorKitchenOwnerList,
  });

  route({
    method: 'GET',
    url: '/deliveryman_detail_info/:id',
    preHandler: [
      webAuth('deliveryman_detail'),
      validate(DriverValidation.deliverymanInformationValidation),
    ],
    handler: DriverController.deliverymanInformation,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail_order_list',
    preHandler: [webAuth('deliveryman_detail')],
    handler: OrdersController.deliverymanOrderList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail_complaints',
    preHandler: [webAuth('deliveryman_detail')],
    handler: ComplaintsController.deliverymanComplaintList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail_complaint_vendor',
    preHandler: [webAuth('deliveryman_detail')],
    handler: ComplaintsController.deliverymanRestaurantComplaintList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail_complaint_orders',
    preHandler: [webAuth('deliveryman_detail')],
    handler: ComplaintsController.deliverymanUserOrderComplaintList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail_disbursement_list',
    preHandler: [webAuth('deliveryman_detail')],
    handler: DisbursementController.deliverymanDisbursementList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail_collected_cash_list',
    preHandler: [webAuth('deliveryman_detail')],
    handler: CollectCashController.deliverymanCollectedCashList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail_payout_accounts',
    preHandler: [webAuth('deliveryman_detail')],
    handler: DeliverymanPayoutMethodController.deliverymanPayoutAccounts,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail_withdrawal_request_list',
    preHandler: [webAuth('deliveryman_detail')],
    handler: WithdrawalRequestController.deliverymanWithdrawalRequest,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail_wallet_transactions',
    preHandler: [webAuth('deliveryman_detail')],
    handler: WalletController.deliverymanTransactionList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail_reviews',
    preHandler: [webAuth('deliveryman_detail')],
    handler: ReviewRatingController.deliverymanReviews,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail_media_files',
    preHandler: [webAuth('deliveryman_detail')],
    handler: MediaController.deliverymanMediaFiles,
  });

  route({
    method: 'GET',
    url: '/customer_detail_info/:user',
    preHandler: [
      webAuth('customer_detail'),
      validate(UserValidation.idValidation),
    ],
    handler: UserController.customerDetail,
  });
  route({
    method: 'GET',
    url: '/customer_detail_order_list',
    preHandler: [webAuth('customer_detail')],
    handler: OrdersController.customerOrderList,
  });
  route({
    method: 'GET',
    url: '/customer_detail_dining_booking_list',
    preHandler: [webAuth('customer_detail')],
    handler: DiningBookingController.customerDiningBooking,
  });
  route({
    method: 'GET',
    url: '/customer_detail_purchased_tiffin_packages',
    preHandler: [webAuth('customer_detail')],
    handler: UserPurchasedTiffinSubscriptionController.customerPurchasedPackages,
  });
  route({
    method: 'GET',
    url: '/customer_detail_delivery_address_list',
    preHandler: [webAuth('customer_detail')],
    handler: UserAddressController.customerAddressList,
  });
  route({
    method: 'GET',
    url: '/customer_detail_refund_request_list',
    preHandler: [webAuth('customer_detail')],
    handler: OrdersController.customerAllRefundRequest,
  });
  route({
    method: 'GET',
    url: '/customer_detail_order_refund_request',
    preHandler: [webAuth('customer_detail')],
    handler: OrdersController.customerOrderRefundList,
  });
  route({
    method: 'GET',
    url: '/customer_detail_tiffin_refund_request',
    preHandler: [webAuth('customer_detail')],
    handler: OrdersController.customerTiffinRefundList,
  });
  route({
    method: 'GET',
    url: '/customer_detail_dining_refund_request',
    preHandler: [webAuth('customer_detail')],
    handler: OrdersController.customerBookingRefundList,
  });
  route({
    method: 'GET',
    url: '/customer_detail_order_complaint_list',
    preHandler: [webAuth('customer_detail')],
    handler: ComplaintsController.customerComplaintList,
  });
  route({
    method: 'GET',
    url: '/customer_detail_favourite_list',
    preHandler: [webAuth('customer_detail')],
    handler: FavouriteController.customerAllFavourite,
  });
  route({
    method: 'GET',
    url: '/customer_detail_favourite_orders',
    preHandler: [webAuth('customer_detail')],
    handler: FavouriteController.customerFavouriteOrders,
  });
  route({
    method: 'GET',
    url: '/customer_detail_favourite_restaurants',
    preHandler: [webAuth('customer_detail')],
    handler: FavouriteController.customerFavouriteRestaurant,
  });
  route({
    method: 'GET',
    url: '/customer_detail_favourite_foods',
    preHandler: [webAuth('customer_detail')],
    handler: FavouriteController.customerFavouriteFood,
  });
  route({
    method: 'GET',
    url: '/customer_detail_hidden_restaurants',
    preHandler: [webAuth('customer_detail')],
    handler: HideRestaurantController.customerHiddenRestaurants,
  });
  route({
    method: 'GET',
    url: '/customer_detail_wallet_transactions',
    preHandler: [webAuth('customer_detail')],
    handler: WalletController.customerTransactionList,
  });
  route({
    method: 'GET',
    url: '/customer_detail_all_reviews',
    preHandler: [webAuth('customer_detail')],
    handler: ReviewRatingController.customerAllReviews,
  });
  route({
    method: 'GET',
    url: '/customer_detail_food_reviews',
    preHandler: [webAuth('customer_detail')],
    handler: ReviewRatingController.customerFoodReview,
  });
  route({
    method: 'GET',
    url: '/customer_detail_restaurant_reviews',
    preHandler: [webAuth('customer_detail')],
    handler: ReviewRatingController.customerRestaurantReview,
  });
  route({
    method: 'GET',
    url: '/customer_detail_deliveryman_reviews',
    preHandler: [webAuth('customer_detail')],
    handler: ReviewRatingController.customerDeliverymanReview,
  });
  route({
    method: 'GET',
    url: '/customer_detail_media_files',
    preHandler: [webAuth('customer_detail')],
    handler: MediaController.customerMediaFiles,
  });

  route({
    method: 'POST',
    url: '/send_notification/:id',
    preHandler: [
      webAuth('send_notification'),
      validate(UserValidation.cityzenSendNotificationValidation),
    ],
    handler: FcmController.cityzenSendNotificaiton,
  });

  route({
    method: 'GET',
    url: '/cityzen_profile/:id',
    preHandler: [
      webAuth('cityzen_profile'),
      validate(UserValidation.cityzenProfileValidation),
    ],
    handler: UserController.getCityzenProfile,
  });
  route({
    method: 'PATCH',
    url: '/update_cityzen/:id',
    preHandler: [
      webAuth('update_cityzen'),
      validate(UserValidation.updateCityzenProfileValidation),
    ],
    handler: UserController.updateCityzenProfile,
  });
  route({
    method: 'PATCH',
    url: '/update_cityzen_password/:id',
    preHandler: [
      webAuth('update_cityzen_password'),
      validate(UserValidation.updateCityzenPasswordValidation),
    ],
    handler: UserController.updateCityzenPassword,
  });

  route({
    method: 'GET',
    url: '/cityzen_team_header_content/:id',
    preHandler: [
      webAuth('cityzen_team_header_content'),
      validate(UserValidation.cityzenTeamHeaderValidation),
    ],
    handler: NotificationListController.cityzenHeaderContent,
  });

  route({
    method: 'GET',
    url: '/notification_list/:id',
    preHandler: [
      webAuth('notification_list'),
      validate(UserValidation.cityzenNotificationValidation),
    ],
    handler: NotificationListController.cityzenNotificationList,
  });

  route({
    method: 'GET',
    url: '/regular_chat_list/:id',
    preHandler: [
      webAuth('regular_chat_list'),
      validate(UserValidation.cityzenChatListValidation),
    ],
    handler: ChatRoomController.cityzenChatList,
  });
  route({
    method: 'GET',
    url: '/support_chat_list/:id',
    preHandler: [
      webAuth('support_chat_list'),
      validate(UserValidation.cityzenChatListValidation),
    ],
    handler: SupportChatRoomController.cityzenSupportChatList,
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
    method: 'GET',
    url: '/support_chat_messages/:id',
    preHandler: [
      webAuth('support_chat_messages'),
      validate(ChatRoomValidation.cityzenChatMessagesValidation),
    ],
    handler: SupportChatRoomController.cityzenChatMessages,
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
  route({
    method: 'POST',
    url: '/chat_room/send_support_message/',
    preHandler: [
      webAuth('send_support_message'),
      validate(ChatRoomValidation.sendChatMessageValidation),
    ],
    handler: SupportChatRoomController.saveSupportMessage,
  });

  // Cityzen User Contact Detail Routes //
  route({
    method: 'GET',
    url: '/user_contact_detail/:id',
    preHandler: [
      webAuth('user_contact_detail'),
      validate(UserValidation.adminUserContactDetailValidation),
    ],
    handler: UserController.adminUserContactDetail,
  });
  // Cityzen User Contact Detail Routes //

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
  /// Chat Messages Routes //
};
