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

const AddonsValidation = require('../../validations/addons.validation');
const VendorCategoryValidation = require('../../validations/vendor.category.validation');
const VendorSubCategoryValidation = require('../../validations/vendor.sub.category.validation');
const FoodValidation = require('../../validations/food.validation');
const DriverValidation = require('../../validations/driver.validation');
const CityValidation = require('../../validations/city.validation');
const RestaurantValidation = require('../../validations/restaurant.validation');
const RestaurantCampaignValidation = require('../../validations/restaurant.campaign.validation');
const RestaurantCampaignRequestValidation = require('../../validations/restaurant.campaign.request.validation');
const FoodCampaignValidation = require('../../validations/food.campaign.validation');
const FoodCampaignRequestValidation = require('../../validations/food.campaign.request.validation');
const OrdersValidation = require('../../validations/orders.validation');
const CouponValidation = require('../../validations/coupon.validation');
const SubscriptionTiffinPackageValidation = require('../../validations/subscription.tiffin.packages.validation');
const UserPurchasedTiffinSubscriptionValidation = require('../../validations/user.purchased.tiffin.subscriptions.validation');
const DiningCampaignValidation = require('../../validations/dining.campaign.validation');
const DiningCampaignRequestValidation = require('../../validations/dining.campaign.request.validation');
const RestaurantExtraDetailValidation = require('../../validations/restaurant.extra.detail.validation');
const DiningCouponValidation = require('../../validations/dining.coupon.validation');
const DiningBookingValidation = require('../../validations/dining.booking.validation');
const FoodTaxationValidation = require('../../validations/food.taxation.validation');
const ReviewRatingValidation = require('../../validations/review.ratings.validation');
const UserValidation = require('../../validations/user.validation');
const FileUploadValidation = require('../../validations/file.validation');
const RestaurantComplaintValidation = require('../../validations/restaurant.complaint.validation');
const AuthValidation = require('../../validations/auth.validation');
const WaiterValidation = require('../../validations/waiter.validation');
const RestaurantTableValidation = require('../../validations/restaurant.table.validation');
const RestaurantPayoutMethodValidation = require('../../validations/restaurant.payout.method.validation');
const WalletValidation = require('../../validations/wallet.validation');
const WithdrawalRequestValidation = require('../../validations/withdrawal.request.validation');
const PosOrTableOrderValidation = require('../../validations/pos.or.table.order.validation');
const TableOrderCartItemValidation = require('../../validations/table.order.cart.item.validation');
const TableOrderValidation = require('../../validations/table.order.validation');
const RestaurantExpenseValidation = require('../../validations/restaurant.expense.validation');
const ChatRoomValidation = require('../../validations/chat.room.validation');
const UserNotificationSettingValidation = require('../../validations/user.notification.setting.validation');
const KitchenOwnerValidation = require('../../validations/kitchen.owner.validation');

const AddonsController = require('../../controllers/addons.controller');
const VendorCategoryController = require('../../controllers/vendor.category.controller');
const RestaurantController = require('../../controllers/restaurant.controller');
const CategoryController = require('../../controllers/category.controller');
const SubCategoryController = require('../../controllers/sub.category.controller');
const VendorSubCategoryController = require('../../controllers/vendor.sub.category.controller');
const MediaController = require('../../controllers/media.controller');
const FoodController = require('../../controllers/food.controller');
const DriverController = require('../../controllers/driver.controller');
const LocalityController = require('../../controllers/locality.controller');
const RestaurantCampaignController = require('../../controllers/restaurant.campaign.controller');
const RestaurantCampaignRequestController = require('../../controllers/restaurant.campaign.request.controller');
const FoodCampaignController = require('../../controllers/food.campaign.controller');
const FoodCampaignRequestController = require('../../controllers/food.campaign.request.controller');
const OrdersController = require('../../controllers/orders.controller');
const OrdersCancellationReasonController = require('../../controllers/order.cancellation.reason.controller');
const CouponController = require('../../controllers/coupon.controller');
const SubscriptionTiffinPackageController = require('../../controllers/subscription.tiffin.package.controller');
const UserPurchasedTiffinSubscriptionController = require('../../controllers/user.purchased.tiffin.subscription.controller');
const DiningCampaignController = require('../../controllers/dining.campaign.controller');
const DiningCampaignRequestController = require('../../controllers/dining.campaign.request.controller');
const RestaurantExtraDetailController = require('../../controllers/restaurant.extra.details.controller');
const DiningCategoryController = require('../../controllers/dining.category.controller');
const DiningSettingController = require('../../controllers/dining.settings.controller');
const DiningCouponController = require('../../controllers/dining.coupon.controller');
const DiningBookingController = require('../../controllers/dining.booking.controller');
const DiningBookingCancellationReasonController = require('../../controllers/dining.cancellation.reason.controller');
const FoodTaxationController = require('../../controllers/food.taxation.controller');
const ReviewRatingController = require('../../controllers/review.ratings.controller');
const UserController = require('../../controllers/user.controller');
const RestaurantComplaintController = require('../../controllers/restaurant.complaints.controller');
const AuthController = require('../../controllers/auth.controller');
const WaiterController = require('../../controllers/waiter.controller');
const RestaurantTableController = require('../../controllers/restaurant.table.controller');
const WalletController = require('../../controllers/wallet.controller');
const WithdrawalMethodController = require('../../controllers/withdrawal.method.controller');
const RestaurantPayoutMethodController = require('../../controllers/restaurant.payout.method.controller');
const WithdrawalRequestController = require('../../controllers/withdrawal.request.controller');
const OrderSettingsController = require('../../controllers/order.settings.controller');
const PosOrTableOrderController = require('../../controllers/pos.or.table.order.controller');
const TableOrderCartItemController = require('../../controllers/table.order.cart.item.controller');
const TableOrderController = require('../../controllers/table.order.controller');
const RestaurantExpenseController = require('../../controllers/restaurant.expense.controller');
const SupportChatRoomController = require('../../controllers/support.chat.room.controller');
const ChatRoomController = require('../../controllers/chat.room.controller');
const UserNotificationSettingController = require('../../controllers/user.notification.setting.controller');
const UserDeleteAccountReasonController = require('../../controllers/user.delete.account.reason.controller');
const KitchenOwnerController = require('../../controllers/kitchen.owner.controller');
const NotificationListController = require('../../controllers/notification.list.controller');

module.exports.register = function register(route) {
  // Vendors Own Routes //
  route({
    method: 'GET',
    url: '/getMyProfile/:userId',
    preHandler: [webAuth('getVendorProfile')],
    handler: RestaurantController.getMyProfile,
  });
  // Vendors Own Routes //

  // Addons Routes //
  route({
    method: 'POST',
    url: '/addons/save',
    preHandler: [
      webAuth('createAddons'),
      validate(AddonsValidation.createAddons),
    ],
    handler: AddonsController.create,
  });
  route({
    method: 'GET',
    url: '/addons/getMyAddons/:restaurant',
    preHandler: [
      webAuth('getMyAddons'),
      validate(AddonsValidation.myAddonsValidation),
    ],
    handler: AddonsController.getMyAddons,
  });
  route({
    method: 'PATCH',
    url: '/addons/update/:addonId',
    preHandler: [
      webAuth('updateAddons'),
      validate(AddonsValidation.idValidation),
    ],
    handler: AddonsController.update,
  });
  route({
    method: 'DELETE',
    url: '/addons/delete/:addonId',
    preHandler: [
      webAuth('deleteAddons'),
      validate(AddonsValidation.idValidation),
    ],
    handler: AddonsController.drop,
  });
  // Addons Routes //

  // Category Routes //
  route({
    method: 'GET',
    url: '/category/getActive',
    preHandler: [webAuth('getActiveCategory')],
    handler: CategoryController.getActive,
  });
  // Category Routes //

  // Sub Category Routes //
  route({
    method: 'GET',
    url: '/sub_category/getActive',
    preHandler: [webAuth('getActiveSubCategory')],
    handler: SubCategoryController.getActive,
  });
  route({
    method: 'GET',
    url: '/sub_category/getByCategoryId/:category',
    preHandler: [webAuth('getActiveSubCategory')],
    handler: SubCategoryController.getActiveByCategoryId,
  });
  // Sub Category Routes //

  // Vendor Category Routes //
  route({
    method: 'POST',
    url: '/vendor_category/save',
    preHandler: [
      webAuth('createVendorCategory'),
      validate(VendorCategoryValidation.createCategory),
    ],
    handler: VendorCategoryController.create,
  });
  route({
    method: 'GET',
    url: '/vendor_category/getMyCategories/:restaurant',
    preHandler: [
      webAuth('getMyVendorCategories'),
      validate(VendorCategoryValidation.myCategoryValidation),
    ],
    handler: VendorCategoryController.getMyCategory,
  });
  route({
    method: 'PATCH',
    url: '/vendor_category/update/:categoryId',
    preHandler: [
      webAuth('updateVendorCategory'),
      validate(VendorCategoryValidation.idValidation),
    ],
    handler: VendorCategoryController.update,
  });
  route({
    method: 'DELETE',
    url: '/vendor_category/delete/:categoryId',
    preHandler: [
      webAuth('deleteVendorCategory'),
      validate(VendorCategoryValidation.idValidation),
    ],
    handler: VendorCategoryController.drop,
  });
  route({
    method: 'GET',
    url: '/vendor_category/getAllMyCategory/:restaurant',
    preHandler: [
      webAuth('getMyVendorCategories'),
      validate(VendorCategoryValidation.myCategoryValidation),
    ],
    handler: VendorCategoryController.getMyAllCategory,
  });
  // Vendor Category Routes //

  // Vendor Sub Category Routes //
  route({
    method: 'POST',
    url: '/vendor_sub_category/save',
    preHandler: [
      webAuth('createVendorSubCategory'),
      validate(VendorSubCategoryValidation.createSubCategory),
    ],
    handler: VendorSubCategoryController.create,
  });
  route({
    method: 'GET',
    url: '/vendor_sub_category/getMyCategories/:restaurant',
    preHandler: [
      webAuth('getMyVendorSubCategories'),
      validate(VendorSubCategoryValidation.mySubCategoryValidation),
    ],
    handler: VendorSubCategoryController.getMyCategory,
  });
  route({
    method: 'GET',
    url: '/vendor_sub_category/getActiveByCategoryId/:category/:restaurant',
    preHandler: [
      webAuth('getMyVendorSubCategories'),
      validate(VendorSubCategoryValidation.mySubCategoryByCateIdValidation),
    ],
    handler: VendorSubCategoryController.getAllSubCategoryById,
  });
  route({
    method: 'PATCH',
    url: '/vendor_sub_category/update/:subCategoryId',
    preHandler: [
      webAuth('updateVendorSubCategory'),
      validate(VendorSubCategoryValidation.idValidation),
    ],
    handler: VendorSubCategoryController.update,
  });
  route({
    method: 'DELETE',
    url: '/vendor_sub_category/delete/:subCategoryId',
    preHandler: [
      webAuth('deleteVendorSubCategory'),
      validate(VendorSubCategoryValidation.idValidation),
    ],
    handler: VendorSubCategoryController.drop,
  });
  // Vendor Sub Category Routes //

  // Food Routes //
  route({
    method: 'GET',
    url: '/foods/getBasicData/:restaurant',
    preHandler: [
      webAuth('createFood'),
      validate(FoodValidation.myFoodValidation),
    ],
    handler: FoodController.getBasicData,
  });
  route({
    method: 'POST',
    url: '/foods/save',
    preHandler: [
      webAuth('createFood'),
      validate(FoodValidation.createFood),
    ],
    handler: FoodController.create,
  });
  route({
    method: 'GET',
    url: '/foods/getMyFoods/:restaurant',
    preHandler: [
      webAuth('getMyFoods'),
      validate(FoodValidation.myFoodValidation),
    ],
    handler: FoodController.getMyFoods,
  });
  route({
    method: 'PATCH',
    url: '/foods/update/:foodId',
    preHandler: [
      webAuth('updateFood'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.update,
  });
  route({
    method: 'DELETE',
    url: '/foods/delete/:foodId',
    preHandler: [
      webAuth('deleteFood'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.drop,
  });
  route({
    method: 'PATCH',
    url: '/foods/updateMetaInfo/:foodId',
    preHandler: [
      webAuth('updateFood'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.updateMetaInfo,
  });
  route({
    method: 'GET',
    url: '/foods/getFoodInfo/:foodId/:restaurant',
    preHandler: [
      webAuth('getMyFoods'),
      validate(FoodValidation.foodInfoValidation),
    ],
    handler: FoodController.getFoodInfo,
  });
  route({
    method: 'GET',
    url: '/foods/getAllMainActiveCategories',
    preHandler: [webAuth('createFood')],
    handler: FoodController.getAllMainActiveCategories,
  });
  route({
    method: 'GET',
    url: '/foods/getAllMyAddonsList/:restaurant',
    preHandler: [webAuth('createFood')],
    handler: FoodController.getAllMyAddonsList,
  });
  route({
    method: 'GET',
    url: '/foods/getMyFoodApp/:restaurant',
    preHandler: [webAuth('getMyFoods')],
    handler: FoodController.getMyFoodApp,
  });
  route({
    method: 'GET',
    url: '/foods/getFoodInfoVendorApp/:foodId/:restaurant',
    preHandler: [
      webAuth('getMyFoods'),
      validate(FoodValidation.foodInfoValidation),
    ],
    handler: FoodController.getFoodIdVendorApp,
  });
  route({
    method: 'GET',
    url: '/foods/searchMenu/:vendor/:searchQuery',
    preHandler: [
      webAuth('searchMenu'),
      validate(FoodValidation.searchMenuValidation),
    ],
    handler: FoodController.searchMenuFood,
  });
  // Food Routes //

  // Media Routes //
  route({
    method: 'GET',
    url: '/media/getVendorMedia/:userId',
    preHandler: [webAuth('getVendorMedia')],
    handler: MediaController.getVendorMedia,
  });
  // Media Routes //

  // Driver Routes //
  route({
    method: 'POST',
    url: '/driver/save',
    preHandler: [
      webAuth('createDriver'),
      validate(DriverValidation.createVendorDriver),
    ],
    handler: DriverController.registerVendorDriverAccount,
  });
  route({
    method: 'GET',
    url: '/driver/getBasicData/:restaurant',
    preHandler: [
      webAuth('createDriver'),
      validate(DriverValidation.restaurantValidation),
    ],
    handler: DriverController.getVendorDriverBasicData,
  });
  route({
    method: 'GET',
    url: '/driver/getMyDriver/:restaurant',
    preHandler: [
      webAuth('getMyDriver'),
      validate(DriverValidation.restaurantValidation),
    ],
    handler: DriverController.getMyDriver,
  });
  route({
    method: 'PATCH',
    url: '/driver/updateStatus/:driverId',
    preHandler: [
      webAuth('updateDriver'),
      validate(DriverValidation.idValidation),
    ],
    handler: DriverController.updateStatus,
  });
  route({
    method: 'GET',
    url: '/driver/getById/:driverId',
    preHandler: [
      webAuth('getDriverById'),
      validate(DriverValidation.idValidation),
    ],
    handler: DriverController.getById,
  });
  route({
    method: 'PATCH',
    url: '/driver/update/:driverId',
    preHandler: [
      webAuth('updateDriver'),
      validate(DriverValidation.idValidation),
    ],
    handler: DriverController.update,
  });
  // Driver Routes //

  // Locality Routes //
  route({
    method: 'GET',
    url: '/localities/getByCityId/:cityId',
    preHandler: [
      webAuth('getLocalities'),
      validate(CityValidation.idValidation),
    ],
    handler: LocalityController.getByCityId,
  });
  // Locality Routes //

  // Outlet Routes //
  route({
    method: 'POST',
    url: '/outlet/save',
    preHandler: [
      webAuth('createOutlet'),
      validate(RestaurantValidation.createOutlet),
    ],
    handler: RestaurantController.registerOutletAccount,
  });
  route({
    method: 'GET',
    url: '/outlet/getBasicDataForNewOutlet',
    preHandler: [webAuth('createOutlet')],
    handler: RestaurantController.getBasicDataForNewOutlet,
  });
  route({
    method: 'GET',
    url: '/outlet/getBasicDataForNewOutletForApp',
    preHandler: [webAuth('createOutlet')],
    handler: RestaurantController.getBasicDataForNewOutletFromApp,
  });
  route({
    method: 'GET',
    url: '/outlet/getMyOutlets/:restaurantId',
    preHandler: [
      webAuth('getMyOutlets'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.getMyOutlets,
  });
  route({
    method: 'PATCH',
    url: '/outlet/updateStatus/:restaurantId',
    preHandler: [
      webAuth('updateOutlet'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.updateStatus,
  });
  route({
    method: 'GET',
    url: '/outlet/getById/:restaurantId',
    preHandler: [
      webAuth('getOutletById'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.getById,
  });
  route({
    method: 'GET',
    url: '/outlet/getByIdForApp/:id/:vendorId',
    preHandler: [
      webAuth('getOutletById'),
      validate(RestaurantValidation.getOutletDetailForAppValidation),
    ],
    handler: RestaurantController.getOutletDetailForApp,
  });
  route({
    method: 'PATCH',
    url: '/outlet/update/:restaurantId',
    preHandler: [
      webAuth('updateOutlet'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.updateOutlet,
  });
  // Outlet Routes //

  // Restaurant Campaign Routes //
  route({
    method: 'GET',
    url: '/restaurant_campaign/near_me/:restaurantId',
    preHandler: [
      webAuth('getRestaurantCampaignNearMe'),
      validate(RestaurantCampaignValidation.restaurantIdValidation),
    ],
    handler: RestaurantCampaignController.getCampaignNearMe,
  });
  route({
    method: 'DELETE',
    url: '/restaurant_campaign/leave/:campaignId/:restaurantId',
    preHandler: [
      webAuth('leaveRestaurantCampaign'),
      validate(RestaurantCampaignValidation.leaveAndJoinCampaignValidation),
    ],
    handler: RestaurantCampaignController.leaveCampaign,
  });

  route({
    method: 'POST',
    url: '/restaurant_campaign/join_request',
    preHandler: [
      webAuth('joinRestaurantCampaign'),
      validate(RestaurantCampaignRequestValidation.joinCampaignValidation),
    ],
    handler: RestaurantCampaignRequestController.requestCampaign,
  });
  // Restaurant Campaign Routes //

  // Food Campaign Routes //
  route({
    method: 'GET',
    url: '/food_campaign/near_me/:restaurantId',
    preHandler: [
      webAuth('getFoodCampaignNearMe'),
      validate(FoodCampaignValidation.restaurantIdValidation),
    ],
    handler: FoodCampaignController.getCampaignNearMe,
  });
  route({
    method: 'GET',
    url: '/food_campaign/getDetails/:campaignId/:restaurantId',
    preHandler: [
      webAuth('getFoodCampaignDetails'),
      validate(FoodCampaignValidation.restaurantAndCampaignIdValidation),
    ],
    handler: FoodCampaignController.getDetailsForCampaignRequest,
  });
  route({
    method: 'POST',
    url: '/food_campaign/join_request',
    preHandler: [
      webAuth('joinFoodCampaign'),
      validate(FoodCampaignRequestValidation.joinCampaignValidation),
    ],
    handler: FoodCampaignRequestController.requestCampaign,
  });

  route({
    method: 'DELETE',
    url: '/food_campaign/leave/:campaignId/:foodId',
    preHandler: [
      webAuth('leaveFoodCampaign'),
      validate(FoodCampaignValidation.leaveAndJoinCampaignIdValidation),
    ],
    handler: FoodCampaignController.leaveCampaign,
  });
  // Food Campaign Routes //

  // Restaurant Slots Routes //
  route({
    method: 'GET',
    url: '/getMySlots/:restaurantId',
    preHandler: [
      webAuth('getMySlots'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.getSlot,
  });
  route({
    method: 'PATCH',
    url: '/updateMySlots/:restaurantId',
    preHandler: [
      webAuth('updateSlots'),
      validate(RestaurantValidation.slotUpdateValidation),
    ],
    handler: RestaurantController.updateSlot,
  });
  route({
    method: 'PATCH',
    url: '/updateMySlotsWeb/:restaurantId',
    preHandler: [
      webAuth('updateSlots'),
      validate(RestaurantValidation.slotUpdateValidation),
    ],
    handler: RestaurantController.updateSlotWeb,
  });
  // Restaurant Slots Routes //

  // Orders Routes //
  route({
    method: 'POST',
    url: '/orders/getVendorOrders',
    preHandler: [
      webAuth('getVendorOrders'),
      validate(OrdersValidation.vendorOrderValidation),
    ],
    handler: OrdersController.getVendorOrder,
  });
  route({
    method: 'POST',
    url: '/orders/prepareOrder',
    preHandler: [
      webAuth('updateOrder'),
      validate(OrdersValidation.prepareOrderValidation),
    ],
    handler: OrdersController.prepareOrder,
  });
  route({
    method: 'POST',
    url: '/orders/acceptScheduleOrder',
    preHandler: [
      webAuth('updateOrder'),
      validate(OrdersValidation.acceptScheduleOrderValidation),
    ],
    handler: OrdersController.acceptScheduleOrder,
  });
  route({
    method: 'POST',
    url: '/orders/orderReady',
    preHandler: [
      webAuth('updateOrder'),
      validate(OrdersValidation.orderReadyValidation),
    ],
    handler: OrdersController.orderReady,
  });
  route({
    method: 'GET',
    url: '/drivers/activeDriver/:vendorId',
    preHandler: [
      webAuth('activeNearDriver'),
      validate(DriverValidation.nearActiveDriverValidation),
    ],
    handler: DriverController.getNearMeActiveDriver,
  });
  route({
    method: 'POST',
    url: '/orders/handover_to_driver',
    preHandler: [
      webAuth('updateOrder'),
      validate(OrdersValidation.orderHandoverToDriverValidation),
    ],
    handler: OrdersController.restaurantOrderHandoverDriver,
  });
  route({
    method: 'POST',
    url: '/orders/handover_to_customer',
    preHandler: [
      webAuth('updateOrder'),
      validate(OrdersValidation.orderHandoverToCustomerValidation),
    ],
    handler: OrdersController.restaurantOrderHandoverCustomer,
  });
  route({
    method: 'POST',
    url: '/orders/rejectOrder/',
    preHandler: [
      webAuth('rejectOrder'),
      validate(OrdersValidation.orderRestaurantRejectValidation),
    ],
    handler: OrdersController.restaurantRejectOrder,
  });
  route({
    method: 'GET',
    url: '/orders/fetchDriverNearToOrder/:id/:restaurant',
    preHandler: [
      webAuth('fetchDriverNearToOrder'),
      validate(OrdersValidation.findDriverValidation),
    ],
    handler: OrdersController.fetchDriverNearToOrder,
  });
  route({
    method: 'POST',
    url: '/orders/assignDriverOrderVendor',
    preHandler: [
      webAuth('assignDriverOrderVendor'),
      validate(OrdersValidation.assignDriverOrderVendorValidation),
    ],
    handler: OrdersController.assignDriverOrderVendor,
  });
  route({
    method: 'GET',
    url: '/orders/countWeb/:vendorId',
    preHandler: [
      webAuth('orderCountWeb'),
      validate(OrdersValidation.vendorOrderCountWebValidation),
    ],
    handler: OrdersController.vendorOrderCountWeb,
  });
  route({
    method: 'GET',
    url: '/orders/webList',
    preHandler: [
      webAuth('orderWebList'),
      validate(OrdersValidation.vendorOrderWebValidation),
    ],
    handler: OrdersController.vendorOrderListWeb,
  });
  route({
    method: 'GET',
    url: '/orders/vendorOrderDetails/:id/:vendor',
    preHandler: [
      webAuth('vendorOrderDetails'),
      validate(OrdersValidation.vendorOrderDetailValidation),
    ],
    handler: OrdersController.vendorOrderDetail,
  });
  route({
    method: 'GET',
    url: '/orders/callCustomer/:id/:vendor',
    preHandler: [
      webAuth('vendorCallCustomerDeliveryman'),
      validate(OrdersValidation.vendorCallCustomerDeliverymanValidation),
    ],
    handler: OrdersController.callCustomer,
  });
  route({
    method: 'GET',
    url: '/orders/callDeliveryman/:id/:vendor',
    preHandler: [
      webAuth('vendorCallCustomerDeliveryman'),
      validate(OrdersValidation.vendorCallCustomerDeliverymanValidation),
    ],
    handler: OrdersController.callDeliveryman,
  });
  route({
    method: 'GET',
    url: '/orders/summary/:id/:vendor/:locale',
    preHandler: [
      webAuth('downloadOrderReceipt'),
      validate(OrdersValidation.downloadVendorOrderReceiptValidation),
    ],
    handler: OrdersController.downloadVendorOrderSummary,
  });
  route({
    method: 'GET',
    url: '/orders/invoice/:id/:vendor/:locale',
    preHandler: [
      webAuth('downloadOrderReceipt'),
      validate(OrdersValidation.downloadVendorOrderReceiptValidation),
    ],
    handler: OrdersController.downloadVendorOrderInvoice,
  });
  route({
    method: 'GET',
    url: '/orders/print_invoice/:id/:vendor',
    preHandler: [
      webAuth('vendorOrderDetails'),
      validate(OrdersValidation.vendorInvoiceValidation),
    ],
    handler: OrdersController.vendorOrderInvoice,
  });
  // Orders Routes //

  // Order Cancellation Reason Routes //
  route({
    method: 'GET',
    url: '/cancellation/restaurant',
    preHandler: [webAuth('cancellationReason')],
    handler: OrdersCancellationReasonController.getRestaurantCancellationList,
  });
  // Order Cancellation Reason Routes //

  // Coupons Routes //
  route({
    method: 'POST',
    url: '/coupons/request_new/',
    preHandler: [
      webAuth('requestNewCoupon'),
      validate(CouponValidation.requestNewCouponValidation),
    ],
    handler: CouponController.requestNewCoupon,
  });
  route({
    method: 'GET',
    url: '/coupons/get',
    preHandler: [webAuth('getVendorCoupons')],
    handler: CouponController.getVendorCoupons,
  });
  route({
    method: 'POST',
    url: '/coupons/getInfo/',
    preHandler: [
      webAuth('getVendorCouponInfo'),
      validate(CouponValidation.vendorCouponInfoValidation),
    ],
    handler: CouponController.getVendorCouponInfo,
  });
  route({
    method: 'PATCH',
    url: '/coupons/update/:id',
    preHandler: [
      webAuth('updateVendorCoupon'),
      validate(CouponValidation.updateVendorCouponValidation),
    ],
    handler: CouponController.updateVendorCoupon,
  });
  route({
    method: 'DELETE',
    url: '/coupons/delete/:id/:userId',
    preHandler: [
      webAuth('deleteVendorCoupon'),
      validate(CouponValidation.deleteVendorCouponValidation),
    ],
    handler: CouponController.deleteVendorCoupon,
  });
  route({
    method: 'PATCH',
    url: '/coupons/updateMeta/:id',
    preHandler: [
      webAuth('updateVendorCoupon'),
      validate(CouponValidation.vendorCouponUpdateStatusValidation),
    ],
    handler: CouponController.updateMeta,
  });
  // Coupons Routes //

  // Subscription Tiffin Package Routes //
  route({
    method: 'GET',
    url: '/tiffin_packages/get_basic/:restaurant',
    preHandler: [
      webAuth('getTiffinPackageBasicInfo'),
      validate(SubscriptionTiffinPackageValidation.getBasicValidation),
    ],
    handler: SubscriptionTiffinPackageController.getBasic,
  });
  route({
    method: 'POST',
    url: '/tiffin_packages/create/',
    preHandler: [
      webAuth('createTiffinPackage'),
      validate(SubscriptionTiffinPackageValidation.createSubscriptionTiffinValidation),
    ],
    handler: SubscriptionTiffinPackageController.create,
  });
  route({
    method: 'GET',
    url: '/tiffin_packages/getMyPackages/:restaurant',
    preHandler: [
      webAuth('getMyTiffinPackages'),
      validate(SubscriptionTiffinPackageValidation.getPackageListVendorValidation),
    ],
    handler: SubscriptionTiffinPackageController.getMyPackagesList,
  });
  route({
    method: 'GET',
    url: '/tiffin_packages/details/:id/:restaurant',
    preHandler: [
      webAuth('getPackageDetail'),
      validate(SubscriptionTiffinPackageValidation.idValidation),
    ],
    handler: SubscriptionTiffinPackageController.getById,
  });
  route({
    method: 'PATCH',
    url: '/tiffin_packages/update/:id',
    preHandler: [
      webAuth('updatePackageDetail'),
      validate(SubscriptionTiffinPackageValidation.updateValidation),
    ],
    handler: SubscriptionTiffinPackageController.updatePackage,
  });
  route({
    method: 'PATCH',
    url: '/tiffin_packages/updateStatus/:id',
    preHandler: [
      webAuth('updatePackageStatus'),
      validate(SubscriptionTiffinPackageValidation.updateVendorStatusValidation),
    ],
    handler: SubscriptionTiffinPackageController.updatePackageStatus,
  });
  route({
    method: 'DELETE',
    url: '/tiffin_packages/delete/:id',
    preHandler: [
      webAuth('deleteTiffinPackage'),
      validate(SubscriptionTiffinPackageValidation.deleteValidation),
    ],
    handler: SubscriptionTiffinPackageController.drop,
  });
  route({
    method: 'POST',
    url: '/tiffin_packages/vendorTiffinSubscriptionPurchased/',
    preHandler: [
      webAuth('vendorTiffinSubscriptionPurchased'),
      validate(UserPurchasedTiffinSubscriptionValidation.purchasedSubscriptionListVendorValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.getPurchaseListForVendor,
  });
  route({
    method: 'GET',
    url: '/tiffin_packages/userPurchasedTiffinSubscriptionInfo/:id',
    preHandler: [
      webAuth('userPurchasedTiffinSubscriptionInfo'),
      validate(UserPurchasedTiffinSubscriptionValidation.purchaseDetailValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.getPurchaseDetailVendor,
  });
  // Subscription Tiffin Package Routes //

  // Dining Campaign Routes //
  route({
    method: 'GET',
    url: '/dining_campaign/near_me/:restaurantId',
    preHandler: [
      webAuth('getDiningCampaignNearMe'),
      validate(DiningCampaignValidation.restaurantIdValidation),
    ],
    handler: DiningCampaignController.getCampaignNearMe,
  });
  route({
    method: 'DELETE',
    url: '/dining_campaign/leave/:campaignId/:restaurantId',
    preHandler: [
      webAuth('leaveDiningCampaign'),
      validate(DiningCampaignValidation.leaveAndJoinCampaignValidation),
    ],
    handler: DiningCampaignController.leaveCampaign,
  });
  route({
    method: 'POST',
    url: '/dining_campaign/join_request',
    preHandler: [
      webAuth('joinDiningCampaign'),
      validate(DiningCampaignRequestValidation.joinCampaignValidation),
    ],
    handler: DiningCampaignRequestController.requestCampaign,
  });
  // Dining Campaign Routes //

  // Restaurant Extra Detail Routes //
  route({
    method: 'POST',
    url: '/restaurant_extra_detail/saveGuestAvailability/:restaurant',
    preHandler: [
      webAuth('saveGuestAvailabilityValidation'),
      validate(RestaurantExtraDetailValidation.saveGuestAvailabilityValidation),
    ],
    handler: RestaurantExtraDetailController.saveGuestAvailability,
  });
  route({
    method: 'GET',
    url: '/restaurant_extra_detail/getGuestAvailability/:restaurant',
    preHandler: [
      webAuth('getGuestAvailability'),
      validate(RestaurantExtraDetailValidation.idValidation),
    ],
    handler: RestaurantExtraDetailController.getGuestAvailability,
  });
  route({
    method: 'GET',
    url: '/restaurant_extra_detail/getMyDiningSchedule/:restaurant',
    preHandler: [
      webAuth('getMyDiningSchedule'),
      validate(RestaurantExtraDetailValidation.idValidation),
    ],
    handler: RestaurantExtraDetailController.getMyDiningSchedule,
  });
  route({
    method: 'POST',
    url: '/restaurant_extra_detail/saveDiningSchedule/:restaurant',
    preHandler: [
      webAuth('saveDiningSchedule'),
      validate(RestaurantExtraDetailValidation.idValidation),
    ],
    handler: RestaurantExtraDetailController.saveDiningSchedule,
  });
  route({
    method: 'POST',
    url: '/restaurant_extra_detail/saveDiningScheduleWeb/:restaurant',
    preHandler: [
      webAuth('saveDiningSchedule'),
      validate(RestaurantExtraDetailValidation.idValidation),
    ],
    handler: RestaurantExtraDetailController.saveDiningScheduleWeb,
  });
  route({
    method: 'GET',
    url: '/restaurant_extra_detail/menu/:id',
    preHandler: [
      webAuth('restaurantMenuAndPhotos'),
      validate(RestaurantValidation.restaurantExtraInformation),
    ],
    handler: RestaurantController.getRestaurantExtraInformation,
  });
  route({
    method: 'PATCH',
    url: '/restaurant_extra_detail/updateMenu/:id',
    preHandler: [
      webAuth('restaurantMenuAndPhotos'),
      validate(RestaurantValidation.updateMenuAndPhotoInformation),
    ],
    handler: RestaurantController.updateMenuAndPhotoInformation,
  });
  // Restaurant Extra Detail Routes //

  // Vendor Dining Information //
  route({
    method: 'GET',
    url: '/dining/getVendorDiningInformation/:id',
    preHandler: [
      webAuth('getVendorDiningInformation'),
      validate(RestaurantValidation.getVendorDiningInformation),
    ],
    handler: RestaurantController.getVendorDiningInformation,
  });
  route({
    method: 'GET',
    url: '/dining/getVendorDiningInformationWeb/:id',
    preHandler: [
      webAuth('getVendorDiningInformation'),
      validate(RestaurantValidation.getVendorDiningInformation),
    ],
    handler: RestaurantController.getVendorDiningInformationWeb,
  });
  route({
    method: 'GET',
    url: '/dining/getDiningCategories',
    preHandler: [webAuth('getDiningCategories')],
    handler: DiningCategoryController.getDiningCategoriesListForVendor,
  });
  route({
    method: 'PATCH',
    url: '/dining/updateDiningInformation/:id',
    preHandler: [
      webAuth('updateDiningInformation'),
      validate(RestaurantValidation.updateDiningInformation),
    ],
    handler: RestaurantController.updateDiningInformation,
  });
  // Vendor Dining Information //

  // Dining Coupon Routes //
  route({
    method: 'GET',
    url: '/dining/getSetting',
    preHandler: [webAuth('getDiningSetting')],
    handler: DiningSettingController.getDiningSettingForVendor,
  });
  route({
    method: 'POST',
    url: '/dining_coupon/request_new/',
    preHandler: [
      webAuth('requestNewDiningCoupon'),
      validate(DiningCouponValidation.requestNewCouponValidation),
    ],
    handler: DiningCouponController.requestNewCoupon,
  });
  route({
    method: 'GET',
    url: '/dining_coupon/vendorCoupons',
    preHandler: [webAuth('getVendorDiningCoupons')],
    handler: DiningCouponController.getVendorCoupons,
  });
  route({
    method: 'DELETE',
    url: '/dining_coupon/delete/:id/:userId',
    preHandler: [
      webAuth('deleteVendorDiningCoupon'),
      validate(DiningCouponValidation.deleteVendorCouponValidation),
    ],
    handler: DiningCouponController.deleteVendorCoupon,
  });
  route({
    method: 'PATCH',
    url: '/dining_coupon/updateMeta/:id',
    preHandler: [
      webAuth('updateVendorDiningCoupon'),
      validate(DiningCouponValidation.vendorCouponUpdateStatusValidation),
    ],
    handler: DiningCouponController.updateMeta,
  });
  route({
    method: 'POST',
    url: '/dining_coupon/getInfo/',
    preHandler: [
      webAuth('getVendorDiningCouponInfo'),
      validate(DiningCouponValidation.vendorCouponInfoValidation),
    ],
    handler: DiningCouponController.getVendorCouponInfo,
  });
  route({
    method: 'PATCH',
    url: '/dining_coupon/update/:id',
    preHandler: [
      webAuth('updateVendorDiningCoupon'),
      validate(DiningCouponValidation.updateVendorCouponValidation),
    ],
    handler: DiningCouponController.updateVendorCoupon,
  });
  // Dining Coupon Routes //

  /// Dining Booking Routes ///
  route({
    method: 'POST',
    url: '/dining_booking/list/',
    preHandler: [
      webAuth('getVendorDiningBooking'),
      validate(DiningBookingValidation.diningBookingByVendorIdValidation),
    ],
    handler: DiningBookingController.getVendorDiningBookingList,
  });
  route({
    method: 'POST',
    url: '/dining_booking/accept/',
    preHandler: [
      webAuth('acceptDiningBooking'),
      validate(DiningBookingValidation.acceptDiningBookingValidation),
    ],
    handler: DiningBookingController.acceptDiningBooking,
  });
  route({
    method: 'GET',
    url: '/dining_booking/cancellation/restaurant',
    preHandler: [webAuth('diningBookingCancellationReason')],
    handler: DiningBookingCancellationReasonController.getRestaurantCancellationList,
  });
  route({
    method: 'POST',
    url: '/dining_booking/reject/',
    preHandler: [
      webAuth('rejectDiningBooking'),
      validate(DiningBookingValidation.rejectDiningBookingValidation),
    ],
    handler: DiningBookingController.rejectDiningBooking,
  });
  route({
    method: 'POST',
    url: '/dining_booking/complete/',
    preHandler: [
      webAuth('completeDiningBooking'),
      validate(DiningBookingValidation.completeDiningBookingValidation),
    ],
    handler: DiningBookingController.completeDiningBooking,
  });
  route({
    method: 'GET',
    url: '/dining_booking/detail/:bookingId/:vendorId',
    preHandler: [
      webAuth('diningBookingInformation'),
      validate(DiningBookingValidation.bookingInformationValidation),
    ],
    handler: DiningBookingController.getDiningBookingInformation,
  });
  route({
    method: 'GET',
    url: '/dining_booking/callCustomer/:bookingId/:vendorId',
    preHandler: [
      webAuth('diningBookingCallCustomer'),
      validate(DiningBookingValidation.callCustomerValidation),
    ],
    handler: DiningBookingController.callBookingCustomer,
  });
  route({
    method: 'POST',
    url: '/dining_booking/list/web/',
    preHandler: [
      webAuth('getVendorDiningBooking'),
      validate(DiningBookingValidation.diningBookingByVendorIdValidation),
    ],
    handler: DiningBookingController.getVendorWebDiningBookingList,
  });
  /// Dining Booking Routes ///

  // Food Taxation Routes //
  route({
    method: 'POST',
    url: '/food_taxation/save/',
    preHandler: [
      webAuth('saveFoodTaxation'),
      validate(FoodTaxationValidation.saveFoodTaxationValidation),
    ],
    handler: FoodTaxationController.saveFoodTaxation,
  });
  route({
    method: 'GET',
    url: '/food_taxation/getByRestaurant/:restaurant/',
    preHandler: [
      webAuth('getFoodTaxation'),
      validate(FoodTaxationValidation.restaurantValidation),
    ],
    handler: FoodTaxationController.getVendorTaxationList,
  });
  route({
    method: 'PATCH',
    url: '/food_taxation/update/:id/:restaurant',
    preHandler: [
      webAuth('updateFoodTaxation'),
      validate(FoodTaxationValidation.updateValidation),
    ],
    handler: FoodTaxationController.updateTaxation,
  });
  route({
    method: 'DELETE',
    url: '/food_taxation/delete/:id/:restaurant',
    preHandler: [
      webAuth('deleteFoodTaxation'),
      validate(FoodTaxationValidation.deleteValidation),
    ],
    handler: FoodTaxationController.deleteTaxation,
  });
  route({
    method: 'GET',
    url: '/food_taxation/getAllMyTaxation/:restaurant/',
    preHandler: [
      webAuth('getFoodTaxation'),
      validate(FoodTaxationValidation.getAllMyTaxationValidation),
    ],
    handler: FoodTaxationController.getAllMyTaxation,
  });
  // Food Taxation Routes //

  // Review Rating Routes //
  route({
    method: 'POST',
    url: '/restaurant/reviews',
    preHandler: [
      webAuth('restaurantReviewList'),
      validate(ReviewRatingValidation.restaurantReviewValidation),
    ],
    handler: ReviewRatingController.getRestaurantReview,
  });
  // Review Rating Routes //

  // Call Routes //
  route({
    method: 'GET',
    url: '/customer/call/:userId',
    preHandler: [
      webAuth('callCustomer'),
      validate(UserValidation.callValidation),
    ],
    handler: UserController.callCustomer,
  });
  // Call Routes //

  // Complaints Routes //
  route({
    method: 'GET',
    url: '/orders/forComplaint/:id/:vendor',
    preHandler: [
      webAuth('detailsForComplaint'),
      validate(OrdersValidation.orderComplaintRestaurantValidation),
    ],
    handler: OrdersController.getOrderDetailsForRestaurantComplaints,
  });
  route({
    method: 'POST',
    url: '/complaints/save',
    preHandler: [
      webAuth('saveComplaints'),
      validate(RestaurantComplaintValidation.saveComplaintValidation),
    ],
    handler: RestaurantComplaintController.save,
  });
  // Complaints Routes //

  route({
    method: 'POST',
    url: '/media/deleteMyImage',
    preHandler: [
      webAuth('deleteMyImage'),
      validate(FileUploadValidation.userMediaDropValidation),
    ],
    handler: MediaController.dropUserMedia,
  });

  // Restaurant Detail Update App //
  route({
    method: 'GET',
    url: '/restaurant/getDetailForWebUpdate/:restaurantId',
    preHandler: [
      webAuth('updateRestaurantDetail'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.getRestaurantDetailWebForUpdate,
  });
  route({
    method: 'GET',
    url: '/restaurant/edit_detail/:id/',
    preHandler: [
      webAuth('editRestaurantDetailApp'),
      validate(RestaurantValidation.getRestaurantDetailForUpdateAppValidation),
    ],
    handler: RestaurantController.getRestaurantDetailForUpdateApp,
  });

  route({
    method: 'PATCH',
    url: '/restaurant/updateDetail/:id',
    preHandler: [
      webAuth('updateRestaurantDetail'),
      validate(RestaurantValidation.updateRestaurantDetailValidation),
    ],
    handler: RestaurantController.updateRestaurantDetail,
  });
  route({
    method: 'GET',
    url: '/restaurant/temporaryClose/:id',
    preHandler: [
      webAuth('updateRestaurantDetail'),
      validate(RestaurantValidation.temporaryClosedValidation),
    ],
    handler: RestaurantController.closeTemporaryRestaurant,
  });
  route({
    method: 'GET',
    url: '/restaurant/reOpenTemporary/:id',
    preHandler: [
      webAuth('updateRestaurantDetail'),
      validate(RestaurantValidation.temporaryClosedValidation),
    ],
    handler: RestaurantController.reOpenTemporaryRestaurant,
  });
  // Restaurant Detail Update App //

  // Edit Profile //
  route({
    method: 'GET',
    url: '/profile/user/:id',
    preHandler: [
      webAuth('getUserProfile'),
      validate(AuthValidation.profileValidation),
    ],
    handler: AuthController.getMyProfile,
  });
  route({
    method: 'PATCH',
    url: '/profile/update/:id',
    preHandler: [
      webAuth('updateUserProfile'),
      validate(AuthValidation.updateProfileValidation),
    ],
    handler: AuthController.updateMyProfile,
  });
  // Edit Profile //

  // Waiter Routes //
  route({
    method: 'POST',
    url: '/waiter/save',
    preHandler: [
      webAuth('createWaiter'),
      validate(WaiterValidation.createWaiter),
    ],
    handler: WaiterController.registerWaiterAccount,
  });
  route({
    method: 'GET',
    url: '/waiter/getMyWaiter/:restaurant',
    preHandler: [
      webAuth('getMyWaiter'),
      validate(WaiterValidation.restaurantValidation),
    ],
    handler: WaiterController.getMyWaiter,
  });
  route({
    method: 'GET',
    url: '/waiter/getById/:waiterId',
    preHandler: [
      webAuth('getWaiterById'),
      validate(WaiterValidation.idValidation),
    ],
    handler: WaiterController.getById,
  });
  route({
    method: 'PATCH',
    url: '/waiter/updateWaiterInfo/:userId',
    preHandler: [
      webAuth('updateWaiterInfo'),
      validate(WaiterValidation.updateWaiterInfoValidation),
    ],
    handler: WaiterController.updateWaiterInfo,
  });
  route({
    method: 'PATCH',
    url: '/waiter/updateWaiterStatus/:waiterId',
    preHandler: [
      webAuth('updateWaiterInfo'),
      validate(WaiterValidation.updateWaiterStatusValidation),
    ],
    handler: WaiterController.updateWaiterStatus,
  });
  // Waiter Routes //

  // Restaurant Table Routes //
  route({
    method: 'POST',
    url: '/restaurant_table/save',
    preHandler: [
      webAuth('createRestaurantTable'),
      validate(RestaurantTableValidation.createRestaurantTable),
    ],
    handler: RestaurantTableController.create,
  });
  route({
    method: 'GET',
    url: '/restaurant_table/getList/:restaurant',
    preHandler: [
      webAuth('getMyTableList'),
      validate(RestaurantTableValidation.listValidation),
    ],
    handler: RestaurantTableController.get,
  });
  route({
    method: 'PATCH',
    url: '/restaurant_table/update/:id',
    preHandler: [
      webAuth('updateRestaurantTable'),
      validate(RestaurantTableValidation.updateTableValidation),
    ],
    handler: RestaurantTableController.updateTable,
  });
  route({
    method: 'PATCH',
    url: '/restaurant_table/updateStatus/:id',
    preHandler: [
      webAuth('updateRestaurantTable'),
      validate(RestaurantTableValidation.updateTableStatusValidation),
    ],
    handler: RestaurantTableController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/restaurant_table/delete/:id',
    preHandler: [
      webAuth('deleteRestaurantTable'),
      validate(RestaurantTableValidation.idValidation),
    ],
    handler: RestaurantTableController.drop,
  });
  route({
    method: 'GET',
    url: '/restaurant_table/qr_table_detail/:vendor',
    preHandler: [
      webAuth('restaurant_table_detail'),
      validate(RestaurantTableValidation.vendorTableQrDetailValidation),
    ],
    handler: RestaurantController.vendorTableQrDetail,
  });
  // Restaurant Table Routes //

  // Restaurant Wallet Routes //
  route({
    method: 'GET',
    url: '/restaurant/wallet/:vendor',
    preHandler: [
      webAuth('getRestaurantWallet'),
      validate(RestaurantValidation.vendorWalletValidation),
    ],
    handler: RestaurantController.restaurantWalletDetail,
  });
  route({
    method: 'GET',
    url: '/wallet/getWalletTransaction/:user',
    preHandler: [
      webAuth('getWalletTransaction'),
      validate(UserValidation.idValidation),
    ],
    handler: WalletController.vendorWalletTransaction,
  });
  route({
    method: 'GET',
    url: '/cashInHandHistory/getHistory/:vendor',
    preHandler: [
      webAuth('getCashInHandHistory'),
      validate(RestaurantValidation.vendorCashInHandValidation),
    ],
    handler: RestaurantController.cashOnHandHistory,
  });
  route({
    method: 'GET',
    url: '/collectedCashInHandHistory/getHistory/:vendor',
    preHandler: [
      webAuth('getCollectedCashInHandHistory'),
      validate(RestaurantValidation.vendorCollectedCashInHandValidation),
    ],
    handler: RestaurantController.cashCollectedHistory,
  });
  route({
    method: 'GET',
    url: '/cashInHandHistory/posAndTableOrderCommission/:vendor',
    preHandler: [
      webAuth('getPosAndTableOrderCommission'),
      validate(RestaurantValidation.vendorCashInHandValidation),
    ],
    handler: RestaurantController.posAndTableOrderCommissionHistory,
  });
  // Restaurant Wallet Routes //

  // Payout Method Routes //
  route({
    method: 'GET',
    url: '/payoutMethod/list',
    preHandler: [webAuth('payoutMethodList')],
    handler: WithdrawalMethodController.withdrawalMethodListVendor,
  });
  route({
    method: 'POST',
    url: '/payoutMethod/createPayoutMethod',
    preHandler: [
      webAuth('createPayoutMethod'),
      validate(RestaurantPayoutMethodValidation.createPayoutMethodValidation),
    ],
    handler: RestaurantPayoutMethodController.create,
  });
  route({
    method: 'GET',
    url: '/payoutMethod/myPayoutList/:vendor',
    preHandler: [
      webAuth('getPayoutMethodList'),
      validate(RestaurantPayoutMethodValidation.vendorValidation),
    ],
    handler: RestaurantPayoutMethodController.getMyPayoutMethodList,
  });
  route({
    method: 'DELETE',
    url: '/payoutMethod/deleteMethod/:id/:vendor',
    preHandler: [
      webAuth('deletePayoutMethod'),
      validate(RestaurantPayoutMethodValidation.deletePayoutMethodValidation),
    ],
    handler: RestaurantPayoutMethodController.deletePayoutMethod,
  });
  route({
    method: 'GET',
    url: '/payoutMethod/detail/:id/:vendor',
    preHandler: [
      webAuth('getPayoutMethodDetail'),
      validate(RestaurantPayoutMethodValidation.payoutMethodDetailValidation),
    ],
    handler: RestaurantPayoutMethodController.getPayoutMethodDetail,
  });
  route({
    method: 'PATCH',
    url: '/payoutMethod/updatePayoutMethod',
    preHandler: [
      webAuth('updatePayoutMethod'),
      validate(RestaurantPayoutMethodValidation.updatePayoutMethodValidation),
    ],
    handler: RestaurantPayoutMethodController.updatePayoutMethodDetail,
  });
  route({
    method: 'PATCH',
    url: '/payoutMethod/updateDefault/',
    preHandler: [
      webAuth('updatePayoutMethod'),
      validate(RestaurantPayoutMethodValidation.changeDefaultPayoutMethodValidation),
    ],
    handler: RestaurantPayoutMethodController.changeDefaultPayoutMethod,
  });
  // Payout Method Routes //

  // Withdrawal Routes //
  route({
    method: 'GET',
    url: '/wallet/withdrawalDetail/:vendor',
    preHandler: [
      webAuth('withdrawalDetail'),
      validate(WalletValidation.vendorWalletWithdrawalDetailValidation),
    ],
    handler: WalletController.vendorWalletWithdrawalDetail,
  });
  route({
    method: 'POST',
    url: '/wallet/requestWithdrawal',
    preHandler: [
      webAuth('withdrawalRequest'),
      validate(WithdrawalRequestValidation.createRestaurantWithdrawalRequestValidation),
    ],
    handler: WithdrawalRequestController.createRestaurantWithdrawalRequest,
  });
  route({
    method: 'GET',
    url: '/wallet/withdrawalHistory/:vendor',
    preHandler: [
      webAuth('withdrawalHistory'),
      validate(WithdrawalRequestValidation.vendorHistoryValidation),
    ],
    handler: WithdrawalRequestController.restaurantWithdrawalHistory,
  });
  // Withdrawal Routes //

  // POS Routes //
  route({
    method: 'GET',
    url: '/restaurant/posData/:vendor',
    preHandler: [
      webAuth('restaurantPosData'),
      validate(RestaurantValidation.posDataValidation),
    ],
    handler: RestaurantController.getPosData,
  });
  route({
    method: 'GET',
    url: '/restaurant/posFoodInitialSearch/:vendor',
    preHandler: [
      webAuth('restaurantPosInitialFoodSearch'),
      validate(RestaurantValidation.posInitialFoodValidation),
    ],
    handler: RestaurantController.posFoodSearchInitialData,
  });
  route({
    method: 'GET',
    url: '/restaurant/posFoodSearch/:vendor/:searchQuery',
    preHandler: [
      webAuth('restaurantPosFoodSearch'),
      validate(RestaurantValidation.posFoodSearchValidation),
    ],
    handler: RestaurantController.posFoodSearch,
  });
  route({
    method: 'GET',
    url: '/restaurant/posOrderSettings/',
    preHandler: [webAuth('posOrderSettings')],
    handler: OrderSettingsController.posOrderSettings,
  });
  route({
    method: 'POST',
    url: '/restaurant/posPlaceOrder/',
    preHandler: [
      webAuth('posPlaceOrder'),
      validate(PosOrTableOrderValidation.vendorPlaceOrderValidation),
    ],
    handler: PosOrTableOrderController.vendorPlaceOrder,
  });
  route({
    method: 'GET',
    url: '/restaurant/posOrders/:vendor/',
    preHandler: [
      webAuth('posOrdersList'),
      validate(PosOrTableOrderValidation.vendorPosOrderValidation),
    ],
    handler: PosOrTableOrderController.getPosOrderOfVendor,
  });
  route({
    method: 'GET',
    url: '/restaurant/posOrderDetail/:id/:vendor/',
    preHandler: [
      webAuth('posOrderDetail'),
      validate(PosOrTableOrderValidation.vendorPosOrderDetailValidation),
    ],
    handler: PosOrTableOrderController.getPosOrderDetail,
  });
  route({
    method: 'GET',
    url: '/restaurant/posDataWeb/:vendor',
    preHandler: [
      webAuth('restaurantPosData'),
      validate(RestaurantValidation.posDataValidation),
    ],
    handler: RestaurantController.getPosDataWeb,
  });
  route({
    method: 'POST',
    url: '/restaurant/posFoodListWeb/',
    preHandler: [
      webAuth('restaurantPosData'),
      validate(RestaurantValidation.posFoodListWebValidation),
    ],
    handler: RestaurantController.getPosFoodDataWeb,
  });
  route({
    method: 'GET',
    url: '/restaurant/pos_invoice_print/:id/:vendor/',
    preHandler: [
      webAuth('posOrderDetail'),
      validate(PosOrTableOrderValidation.vendorInvoiceValidation),
    ],
    handler: PosOrTableOrderController.vendorPOSOrderInvoice,
  });
  // POS Routes //

  // Table Order Routes //
  route({
    method: 'GET',
    url: '/table_order/ongoing/:vendor/',
    preHandler: [
      webAuth('onGoingTableOrder'),
      validate(TableOrderCartItemValidation.ongoingTableOrderValidation),
    ],
    handler: TableOrderCartItemController.ongoingTableOrder,
  });
  route({
    method: 'GET',
    url: '/table_order/ongoingOrderDetail/:vendor/:tableId/',
    preHandler: [
      webAuth('onGoingTableOrderDetail'),
      validate(TableOrderCartItemValidation.vendorOngoingTableOrderValidation),
    ],
    handler: TableOrderCartItemController.vendorOngoingOrderDetail,
  });
  route({
    method: 'DELETE',
    url: '/table_order/deleteTableOrderCartItem/:vendor/:id/',
    preHandler: [
      webAuth('deleteTableOrderCartItem'),
      validate(TableOrderCartItemValidation.vendorDeleteCartItemValidation),
    ],
    handler: TableOrderCartItemController.vendorDeleteCartItem,
  });
  route({
    method: 'POST',
    url: '/table_order/completeTableOrder',
    preHandler: [
      webAuth('completeTableOrder'),
      validate(TableOrderCartItemValidation.vendorCompleteTableOrderValidation),
    ],
    handler: TableOrderCartItemController.vendorCompleteTableOrder,
  });
  route({
    method: 'GET',
    url: '/table_order/completedTableOrderList/:vendor/',
    preHandler: [
      webAuth('completedTableOrderList'),
      validate(TableOrderValidation.vendorTableOrderValidation),
    ],
    handler: TableOrderController.getTableOrderOfVendor,
  });
  route({
    method: 'GET',
    url: '/table_order/tableOrderDetail/:vendor/:id/',
    preHandler: [
      webAuth('tableOrderDetail'),
      validate(TableOrderValidation.vendorTableOrderDetailValidation),
    ],
    handler: TableOrderController.getTableOrderDetail,
  });
  route({
    method: 'GET',
    url: '/table_order/invoice_print/:id/:vendor/',
    preHandler: [
      webAuth('tableOrderDetail'),
      validate(TableOrderValidation.vendorOrderInvoiceValidation),
    ],
    handler: TableOrderController.vendorTableOrderInvoice,
  });
  // Table Order Routes //

  // Business Insight Routes //
  route({
    method: 'GET',
    url: '/business/insight/:vendor/',
    preHandler: [
      webAuth('businessInsight'),
      validate(OrdersValidation.vendorBusinessInsightValidation),
    ],
    handler: OrdersController.vendorOrderBusinessInsight,
  });
  route({
    method: 'POST',
    url: '/business/insight/custom/',
    preHandler: [
      webAuth('businessInsight'),
      validate(OrdersValidation.vendorBusinessCustomDateInsightValidation),
    ],
    handler: OrdersController.vendorOrderCustomDateBusinessInsight,
  });
  route({
    method: 'GET',
    url: '/pos/insight/:vendor/',
    preHandler: [
      webAuth('businessInsight'),
      validate(PosOrTableOrderValidation.vendorBusinessInsightValidation),
    ],
    handler: PosOrTableOrderController.vendorPosBusinessInsight,
  });
  route({
    method: 'POST',
    url: '/pos/insight/custom/',
    preHandler: [
      webAuth('businessInsight'),
      validate(PosOrTableOrderValidation.vendorBusinessCustomDateInsightValidation),
    ],
    handler: PosOrTableOrderController.vendorCustomDatePosOrderBusinessInsight,
  });
  route({
    method: 'GET',
    url: '/table_order/insight/:vendor/',
    preHandler: [
      webAuth('businessInsight'),
      validate(TableOrderValidation.vendorBusinessInsightValidation),
    ],
    handler: TableOrderController.vendorTableOrderBusinessInsight,
  });
  route({
    method: 'POST',
    url: '/table_order/insight/custom/',
    preHandler: [
      webAuth('businessInsight'),
      validate(TableOrderValidation.vendorBusinessCustomDateInsightValidation),
    ],
    handler: TableOrderController.vendorCustomDateTableOrderBusinessInsight,
  });
  route({
    method: 'GET',
    url: '/business/web_overall_insight/:vendor/',
    preHandler: [
      webAuth('businessInsight'),
      validate(OrdersValidation.vendorBusinessInsightValidation),
    ],
    handler: OrdersController.vendorWebOverallDashboardBusinessInsight,
  });
  route({
    method: 'GET',
    url: '/business/web_monthly_insight/:vendor/',
    preHandler: [
      webAuth('businessInsight'),
      validate(OrdersValidation.vendorBusinessInsightValidation),
    ],
    handler: OrdersController.vendorWebMonthlyDashboardBusinessInsight,
  });
  route({
    method: 'GET',
    url: '/business/web_weekly_insight/:vendor/',
    preHandler: [
      webAuth('businessInsight'),
      validate(OrdersValidation.vendorBusinessInsightValidation),
    ],
    handler: OrdersController.vendorWebWeeklyDashboardBusinessInsight,
  });
  route({
    method: 'GET',
    url: '/business/web_today_insight/:vendor/',
    preHandler: [
      webAuth('businessInsight'),
      validate(OrdersValidation.vendorBusinessInsightValidation),
    ],
    handler: OrdersController.vendorWebTodayDashboardBusinessInsight,
  });
  // Business Insight Routes //

  // Subscription Routes //
  route({
    method: 'GET',
    url: '/restaurant/subscription_status/:vendor',
    preHandler: [webAuth('getSubscriptionInfo')],
    handler: RestaurantController.getVendorSubscriptionStatus,
  });
  route({
    method: 'GET',
    url: '/restaurant/subscription/:vendor',
    preHandler: [webAuth('getSubscriptionInfo')],
    handler: RestaurantController.vendorSubscriptionInfo,
  });
  route({
    method: 'POST',
    url: '/restaurant/renew_subscription/',
    preHandler: [
      webAuth('renewSubscription'),
      validate(RestaurantValidation.renewSubscriptionValidation),
    ],
    handler: RestaurantController.vendorRenewSubscription,
  });
  // Subscription Routes //

  // Expense Routes //
  route({
    method: 'POST',
    url: '/expense/save/',
    preHandler: [
      webAuth('saveExpense'),
      validate(RestaurantExpenseValidation.saveExpenseValidation),
    ],
    handler: RestaurantExpenseController.create,
  });
  route({
    method: 'GET',
    url: '/reports/expenseInitial',
    preHandler: [webAuth('expenseReport')],
    handler: RestaurantExpenseController.getInitialResponse,
  });
  route({
    method: 'GET',
    url: '/reports/expense',
    preHandler: [webAuth('expenseReport')],
    handler: RestaurantExpenseController.getExpenseList,
  });
  route({
    method: 'GET',
    url: '/reports/expense/export',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantExpenseValidation.exportValidation),
    ],
    handler: RestaurantExpenseController.exportCollection,
  });
  // Expense Routes //

  /// Chat Messages Routes //
  route({
    method: 'POST',
    url: '/chat_room/fetchMessages/',
    preHandler: [
      webAuth('fetchChatMessages'),
      validate(ChatRoomValidation.checkChatRoomValidation),
    ],
    handler: ChatRoomController.checkChatRoom,
  });
  route({
    method: 'POST',
    url: '/chat_room/sendMessage/',
    preHandler: [
      webAuth('sendChatMessage'),
      validate(ChatRoomValidation.sendChatMessageValidation),
    ],
    handler: ChatRoomController.saveNewMessage,
  });
  route({
    method: 'GET',
    url: '/chat_room/list/:user',
    preHandler: [
      webAuth('getChatList'),
      validate(ChatRoomValidation.chatListValidation),
    ],
    handler: ChatRoomController.getMyConversionList,
  });
  route({
    method: 'POST',
    url: '/chat_room/conversion',
    preHandler: [
      webAuth('getChatConversion'),
      validate(ChatRoomValidation.getChatConversionValidation),
    ],
    handler: ChatRoomController.getChatConversion,
  });
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

  // Support Chat Message Routes //
  route({
    method: 'POST',
    url: '/support_chat_room/fetchMessages/',
    preHandler: [
      webAuth('fetchChatMessages'),
      validate(ChatRoomValidation.supportChatRoomValidation),
    ],
    handler: SupportChatRoomController.checkChatRoom,
  });
  route({
    method: 'GET',
    url: '/support_chat_room/list/:user',
    preHandler: [
      webAuth('getChatList'),
      validate(ChatRoomValidation.chatListValidation),
    ],
    handler: SupportChatRoomController.mySupportChat,
  });
  route({
    method: 'POST',
    url: '/support_chat_room/sendMessage/',
    preHandler: [
      webAuth('sendChatMessage'),
      validate(ChatRoomValidation.sendChatMessageValidation),
    ],
    handler: SupportChatRoomController.saveNewMessage,
  });
  route({
    method: 'POST',
    url: '/support_chat_room/conversion',
    preHandler: [
      webAuth('getChatConversion'),
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
      webAuth('update_password'),
      validate(UserValidation.updatePasswordValidation),
    ],
    handler: UserController.updatePassword,
  });
  route({
    method: 'GET',
    url: '/account_setting/notification_setting/:id',
    preHandler: [
      webAuth('notification_setting'),
      validate(UserNotificationSettingValidation.idValidation),
    ],
    handler: UserNotificationSettingController.getNotificationSettings,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/notification_setting/:id',
    preHandler: [
      webAuth('notification_setting'),
      validate(UserNotificationSettingValidation.updateSettingValidation),
    ],
    handler: UserNotificationSettingController.updateNotificationSetting,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_email/:id',
    preHandler: [
      webAuth('update_email'),
      validate(UserValidation.updateEmailValidation),
    ],
    handler: UserController.updateEmail,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_email_after_verification/:id',
    preHandler: [
      webAuth('update_email'),
      validate(UserValidation.updateEmailAfterVerificationValidation),
    ],
    handler: UserController.updateEmailAfterVerification,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_mobile_number/:id',
    preHandler: [
      webAuth('update_mobile_number'),
      validate(UserValidation.updateMobileValidation),
    ],
    handler: UserController.updateMobileNumber,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_mobile_number_after_verification/:id',
    preHandler: [
      webAuth('update_mobile_number'),
      validate(UserValidation.updateMobileAfterVerificationValidation),
    ],
    handler: UserController.updateMobileAfterVerification,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_mobile_number_after_firebase_verification/:id',
    preHandler: [
      webAuth('update_mobile_number'),
      validate(UserValidation.updateMobileAfterFirebaseVerificationValidation),
    ],
    handler: UserController.updateMobileAfterFirebaseVerification,
  });
  route({
    method: 'GET',
    url: '/delete_account_reason_list',
    preHandler: [webAuth('delete_account_reason_list')],
    handler: UserDeleteAccountReasonController.geRestaurantActiveReason,
  });
  route({
    method: 'POST',
    url: '/account_setting/delete_account',
    preHandler: [
      webAuth('delete_account'),
      validate(UserValidation.deleteRestaurantAccountValidation),
    ],
    handler: UserController.restaurantDeleteAccount,
  });
  route({
    method: 'PATCH',
    url: '/account_setting/update_locale/',
    preHandler: [
      webAuth('update_locale'),
      validate(UserValidation.updateLocaleValidation),
    ],
    handler: UserController.updateUserLocale,
  });
  // Account Settings Routes//

  // Kitchen Owner Routes //
  route({
    method: 'POST',
    url: '/kitchen_owner/save',
    preHandler: [
      webAuth('create_kitchen_owner'),
      validate(KitchenOwnerValidation.createKitchenOwner),
    ],
    handler: KitchenOwnerController.registerKitchenOwnerAccount,
  });
  route({
    method: 'GET',
    url: '/kitchen_owner/list/:restaurant',
    preHandler: [
      webAuth('kitchen_owner_list'),
      validate(KitchenOwnerValidation.restaurantValidation),
    ],
    handler: KitchenOwnerController.getKitchenOwners,
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
  route({
    method: 'PATCH',
    url: '/kitchen_owner/update_kitchen_status/:kitchenId',
    preHandler: [
      webAuth('update_kitchen_status'),
      validate(KitchenOwnerValidation.updateKitchenOwnerStatusValidation),
    ],
    handler: KitchenOwnerController.updateKitchenOwnerStatus,
  });
  // Kitchen Owner Routes //

  // Vendor Profile //
  route({
    method: 'GET',
    url: '/vendor_profile/:id',
    preHandler: [
      webAuth('vendor_profile'),
      validate(UserValidation.vendorProfileValidation),
    ],
    handler: UserController.getVendorProfile,
  });
  route({
    method: 'PATCH',
    url: '/update_vendor/:id',
    preHandler: [
      webAuth('update_vendor'),
      validate(UserValidation.updateVendorProfileValidation),
    ],
    handler: UserController.updateVendorProfile,
  });
  route({
    method: 'PATCH',
    url: '/update_vendor_password/:id',
    preHandler: [
      webAuth('update_vendor_password'),
      validate(UserValidation.updateVendorPasswordValidation),
    ],
    handler: UserController.updateVendorPassword,
  });

  route({
    method: 'POST',
    url: '/notification_list/',
    preHandler: [
      webAuth('notification_list'),
      validate(UserValidation.notificationListValidation),
    ],
    handler: NotificationListController.getMyNotificationList,
  });
  route({
    method: 'GET',
    url: '/read_all_notification/:user',
    preHandler: [
      webAuth('read_all_notification'),
      validate(UserValidation.idValidation),
    ],
    handler: NotificationListController.readAllNotification,
  });

  route({
    method: 'GET',
    url: '/vendor_header_content/:id',
    preHandler: [
      webAuth('vendor_header_content'),
      validate(UserValidation.vendorHeaderValidation),
    ],
    handler: NotificationListController.vendorHeaderContent,
  });
  // Vendor Profile //

  // Vendor User Contact Detail Routes //
  route({
    method: 'GET',
    url: '/user_contact_detail/:id',
    preHandler: [
      webAuth('user_contact_detail'),
      validate(UserValidation.adminUserContactDetailValidation),
    ],
    handler: UserController.adminUserContactDetail,
  });
  // Vendor User Contact Detail Routes //
};
