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
const FavouriteValidation = require('../../validations/favourite.validation');
const UserAddressValidation = require('../../validations/user.address.validation');
const OrderSettingValidation = require('../../validations/order.setting.validation');
const CouponValidation = require('../../validations/coupon.validation');
const OrdersValidation = require('../../validations/orders.validation');
const PaymentInitiationValidation = require('../../validations/payment.initiation.validation');
const LoyaltyPointValidation = require('../../validations/loyalty.points.validation');
const RefundRequestValidation = require('../../validations/refund.request.validation');
const FileUploadValidation = require('../../validations/file.validation');
const ComplaintsValidation = require('../../validations/complaints.validation');
const HideRestaurantValidation = require('../../validations/hide.restaurant.validation');
const ReportIssueRestaurantValidation = require('../../validations/report.issue.restaurant.validation');
const FavouriteOrderValidation = require('../../validations/favourite.orders.validation');
const ReviewRatingValidation = require('../../validations/review.ratings.validation');
const SubscriptionTiffinPackageValidation = require('../../validations/subscription.tiffin.packages.validation');
const UserPurchasedTiffinSubscriptionValidation = require('../../validations/user.purchased.tiffin.subscriptions.validation');
const TiffinSubscriptionRefundRequestValidation = require('../../validations/tiffin.subscription.refund.request.validation');
const DiningBookingValidation = require('../../validations/dining.booking.validation');
const DiningBookingRefundRequestValidation = require('../../validations/dining.booking.refund.request.validation');
const DiningCouponValidation = require('../../validations/dining.coupon.validation');
const ChatRoomValidation = require('../../validations/chat.room.validation');
const AuthValidation = require('../../validations/auth.validation');
const RestaurantValidation = require('../../validations/restaurant.validation');
const UserNotificationSettingValidation = require('../../validations/user.notification.setting.validation');

const WalletController = require('../../controllers/wallet.controller');
const FavouriteController = require('../../controllers/favourite.controller');
const UserAddressController = require('../../controllers/user.address.controller');
const OrderSettingsController = require('../../controllers/order.settings.controller');
const CouponController = require('../../controllers/coupon.controller');
const OrdersController = require('../../controllers/orders.controller');
const PaymentConfigController = require('../../controllers/payment.config.controller');
const PaymentInitiationController = require('../../controllers/payment.initiation.controller');
const LoyaltyPointController = require('../../controllers/loyalty.points.controller');
const OrdersCancellationReasonController = require('../../controllers/order.cancellation.reason.controller');
const RefundRequestReasonController = require('../../controllers/refund.request.reason.controller');
const RefundRequestController = require('../../controllers/refund.request.controller');
const MediaController = require('../../controllers/media.controller');
const ComplaintsController = require('../../controllers/complaints.controller');
const HideRestaurantController = require('../../controllers/hide.restaurant.controller');
const ReportIssueRestaurantController = require('../../controllers/report.issue.restaurant.controller');
const ReportIssueRestaurantReasonController = require('../../controllers/report.issue.restaurant.reason.controller');
const HideRestaurantReasonController = require('../../controllers/hide.restaurant.reason.controller');
const FavouriteOrderController = require('../../controllers/favourite.orders.controller');
const ReviewRatingController = require('../../controllers/review.ratings.controller');
const NotificationListController = require('../../controllers/notification.list.controller');
const SubscriptionTiffinPackageController = require('../../controllers/subscription.tiffin.package.controller');
const UserPurchasedTiffinSubscriptionController = require('../../controllers/user.purchased.tiffin.subscription.controller');
const TiffinSubscriptionCancellationReasonController = require('../../controllers/tiffin.subscription.cacellation.reason.controller');
const TiffinSubscriptionRefundRequestReasonController = require('../../controllers/tiffin.subscription.refund.request.reason.controller');
const TiffinSubscriptionRefundRequestController = require('../../controllers/tiffin.subscription.refund.request.controller');
const DiningBookingController = require('../../controllers/dining.booking.controller');
const RestaurantController = require('../../controllers/restaurant.controller');
const DiningCancellationReasonController = require('../../controllers/dining.cancellation.reason.controller');
const DiningBookingRefundRequestReasonController = require('../../controllers/dining.booking.refund.request.reason.controller');
const DiningBookingRefundRequestController = require('../../controllers/dining.booking.refund.request.controller');
const DiningCouponController = require('../../controllers/dining.coupon.controller');
const ChatRoomController = require('../../controllers/chat.room.controller');
const AuthController = require('../../controllers/auth.controller');
const UserAvatarController = require('../../controllers/user.avatar.controller');
const UserController = require('../../controllers/user.controller');
const SupportChatRoomController = require('../../controllers/support.chat.room.controller');
const UserDeleteAccountReasonController = require('../../controllers/user.delete.account.reason.controller');
const UserNotificationSettingController = require('../../controllers/user.notification.setting.controller');

module.exports.register = function register(route) {
  // Profile Routes ///
  route({
    method: 'GET',
    url: '/profile/user/:id',
    preHandler: [
      appAuth('getUserProfile'),
      validate(AuthValidation.profileValidation),
    ],
    handler: AuthController.getMyProfile,
  });
  route({
    method: 'PATCH',
    url: '/profile/update/:id',
    preHandler: [
      appAuth('updateUserProfile'),
      validate(AuthValidation.updateProfileValidation),
    ],
    handler: AuthController.updateMyProfile,
  });
  route({
    method: 'GET',
    url: '/profile/user_avatar',
    preHandler: [appAuth('getAvatarList')],
    handler: UserAvatarController.getAvatarList,
  });
  route({
    method: 'GET',
    url: '/media/photos/:uid',
    preHandler: [
      appAuth('getMyMediaFiles'),
      validate(AuthValidation.getMyMediaFilesValidation),
    ],
    handler: MediaController.getMyMediaFiles,
  });
  route({
    method: 'GET',
    url: '/profile/getReferralCode/:userId',
    preHandler: [
      appAuth('getReferralCode'),
      validate(UserValidation.getReferralCodeValidation),
    ],
    handler: UserController.getMyReferralCode,
  });
  // Profile Routes ///

  // Favourite Routes //
  route({
    method: 'POST',
    url: '/favourite/save',
    preHandler: [
      appAuth('saveFavourite'),
      validate(FavouriteValidation.saveFavourite),
    ],
    handler: FavouriteController.saveFavourite,
  });
  route({
    method: 'POST',
    url: '/favourite/restaurants',
    preHandler: [
      appAuth('getFavouriteRestaurants'),
      validate(FavouriteValidation.getFavouriteRestaurants),
    ],
    handler: FavouriteController.getFavouriteRestaurants,
  });
  route({
    method: 'POST',
    url: '/favourite/foods',
    preHandler: [
      appAuth('getFavouriteFoods'),
      validate(FavouriteValidation.getFavouriteFoods),
    ],
    handler: FavouriteController.getFavouriteFoods,
  });
  route({
    method: 'DELETE',
    url: '/favourite/foods/:foodId/:userId',
    preHandler: [
      appAuth('deleteFavouriteFoods'),
      validate(FavouriteValidation.deleteFavouriteFoodValidation),
    ],
    handler: FavouriteController.deleteFavouriteFood,
  });
  route({
    method: 'DELETE',
    url: '/favourite/restaurants/:restaurantId/:userId',
    preHandler: [
      appAuth('deleteFavouriteRestaurant'),
      validate(FavouriteValidation.deleteFavouriteRestaurantValidation),
    ],
    handler: FavouriteController.deleteFavouriteRestaurant,
  });
  // Favourite Routes //

  // Cart Routes //

  // Cart Routes //

  // User Address Routes //
  route({
    method: 'POST',
    url: '/address/save',
    preHandler: [
      appAuth('saveAddress'),
      validate(UserAddressValidation.saveAddress),
    ],
    handler: UserAddressController.saveAddress,
  });
  route({
    method: 'GET',
    url: '/address/deliveryAddressList/:id',
    preHandler: [
      appAuth('getMyAddress'),
      validate(UserAddressValidation.myAddressValidation),
    ],
    handler: UserAddressController.getDeliveryAddressList,
  });
  route({
    method: 'PATCH',
    url: '/address/update/:id',
    preHandler: [
      appAuth('updateAddress'),
      validate(UserAddressValidation.updateValidation),
    ],
    handler: UserAddressController.updateAddress,
  });
  route({
    method: 'DELETE',
    url: '/address/delete/:id',
    preHandler: [
      appAuth('deleteAddress'),
      validate(UserAddressValidation.idValidation),
    ],
    handler: UserAddressController.drop,
  });
  route({
    method: 'POST',
    url: '/address/myAddressListFromRestaurant',
    preHandler: [
      appAuth('getMyAddress'),
      validate(UserAddressValidation.myAddressFromRestaurantValidation),
    ],
    handler: UserAddressController.getMyAddressListFromRestaurant,
  });
  // User Address Routes //

  // Orders Routes //
  route({
    method: 'POST',
    url: '/orders/orderSettings/',
    preHandler: [
      appAuth('getOrderSettings'),
      validate(OrderSettingValidation.settingValidation),
    ],
    handler: OrderSettingsController.getOrderSettings,
  });
  route({
    method: 'POST',
    url: '/orders/placeOrderApp/',
    preHandler: [
      appAuth('createOrder'),
      validate(OrdersValidation.createOrderValidation),
    ],
    handler: OrdersController.placeOrderFromApp,
  });
  route({
    method: 'POST',
    url: '/orders/getMyOrderList/',
    preHandler: [
      appAuth('getMyOrderList'),
      validate(OrdersValidation.orderListValidation),
    ],
    handler: OrdersController.getMyOrderList,
  });
  route({
    method: 'POST',
    url: '/orders/getMyFavouriteOrderList/',
    preHandler: [
      appAuth('getMyFavouriteOrderList'),
      validate(OrdersValidation.favuoriteOrderListValidation),
    ],
    handler: OrdersController.getMyFavouriteOrders,
  });
  route({
    method: 'GET',
    url: '/orders/userOrderDetail/:id/:user',
    preHandler: [
      appAuth('userOrderDetail'),
      validate(OrdersValidation.userOrderIdValidation),
    ],
    handler: OrdersController.getUserOrderDetail,
  });
  route({
    method: 'POST',
    url: '/orders/repayPendingOrder/',
    preHandler: [
      appAuth('repayPendingOrder'),
      validate(OrdersValidation.repayPendingOrderValidation),
    ],
    handler: OrdersController.repayPendingOrder,
  });
  route({
    method: 'POST',
    url: '/orders/cancelMyOrder/',
    preHandler: [
      appAuth('cancelMyOrder'),
      validate(OrdersValidation.cancleUserOrderValidation),
    ],
    handler: OrdersController.cancelMyOrder,
  });
  route({
    method: 'GET',
    url: '/orders/forComplaint/:id',
    preHandler: [
      appAuth('detailsForComplaint'),
      validate(OrdersValidation.orderIdValidation),
    ],
    handler: OrdersController.getOrderDetailsForComplaints,
  });
  route({
    method: 'GET',
    url: '/orders/getOrderDetailsForReview/:id/:user',
    preHandler: [
      appAuth('getOrderDetailsForReview'),
      validate(OrdersValidation.userOrderIdValidation),
    ],
    handler: OrdersController.getOrderDetailForReview,
  });
  route({
    method: 'GET',
    url: '/orders/summary/:id/:user/:locale',
    preHandler: [
      appAuth('downloadOrderReceipt'),
      validate(OrdersValidation.downloadOrderReceiptValidation),
    ],
    handler: OrdersController.downloadOrderSummary,
  });
  route({
    method: 'GET',
    url: '/orders/invoice/:id/:user/:locale',
    preHandler: [
      appAuth('downloadOrderReceipt'),
      validate(OrdersValidation.downloadOrderReceiptValidation),
    ],
    handler: OrdersController.downloadOrderInvoice,
  });
  // Orders Routes //

  // Coupon Routes //
  route({
    method: 'POST',
    url: '/coupon/userCoupon/',
    preHandler: [
      appAuth('getUserCoupon'),
      validate(CouponValidation.userValidation),
    ],
    handler: CouponController.getUserCoupon,
  });
  route({
    method: 'POST',
    url: '/coupon/redeem',
    preHandler: [
      appAuth('redeeemCoupon'),
      validate(CouponValidation.redeemValidation),
    ],
    handler: CouponController.redeemCoupon,
  });
  // Coupon Routes //

  // Wallet & Loyality Routes //
  route({
    method: 'GET',
    url: '/wallet/getMyWalletData/:user',
    preHandler: [
      appAuth('getWallet'),
      validate(UserValidation.idValidation),
    ],
    handler: WalletController.getMyWalletData,
  });
  route({
    method: 'GET',
    url: '/payments/walletList',
    preHandler: [appAuth('getPaymentList')],
    handler: PaymentConfigController.getWalletPaymentList,
  });
  route({
    method: 'POST',
    url: '/payments/initiate/',
    preHandler: [
      appAuth('initiatePayment'),
      validate(PaymentInitiationValidation.paymentInitiationValidation),
    ],
    handler: PaymentInitiationController.create,
  });
  route({
    method: 'GET',
    url: '/loyaltyPoints/getMyLoyaltyPoints/:user',
    preHandler: [
      appAuth('getLoyaltyPoints'),
      validate(LoyaltyPointValidation.idValidation),
    ],
    handler: LoyaltyPointController.getLoyaltyPointsData,
  });
  route({
    method: 'POST',
    url: '/loyaltyPoints/redeemPoints/',
    preHandler: [
      appAuth('redeemPoints'),
      validate(LoyaltyPointValidation.redeemValidation),
    ],
    handler: LoyaltyPointController.redeemLoyaltyPoints,
  });
  // Wallet & Loyality Routes //

  // Order Cancellation Reason Routes //
  route({
    method: 'GET',
    url: '/cancellation/user',
    preHandler: [appAuth('cancellationReason')],
    handler: OrdersCancellationReasonController.getCustomerCancellationList,
  });
  // Order Cancellation Reason Routes //

  // Refund Request Reason List Routes //
  route({
    method: 'GET',
    url: '/refund/reasons',
    preHandler: [appAuth('getRefundReason')],
    handler: RefundRequestReasonController.getReasons,
  });
  route({
    method: 'POST',
    url: '/refund/request/',
    preHandler: [
      appAuth('createRefundRequest'),
      validate(RefundRequestValidation.saveRefundRequestValidation),
    ],
    handler: RefundRequestController.saveRefundRequest,
  });
  // Refund Request Reason List Routes //

  // Media Routes //
  route({
    method: 'POST',
    url: '/media/deleteMyImage',
    preHandler: [
      appAuth('deleteMyImage'),
      validate(FileUploadValidation.userMediaDropValidation),
    ],
    handler: MediaController.dropUserMedia,
  });
  // Media Routes //

  // Complaints Routes //
  route({
    method: 'POST',
    url: '/complaints/save',
    preHandler: [
      appAuth('saveComplaints'),
      validate(ComplaintsValidation.saveComplaintValidation),
    ],
    handler: ComplaintsController.save,
  });
  // Complaints Routes //

  // Hide Restaurant Routes //
  route({
    method: 'POST',
    url: '/hide/restaurant',
    preHandler: [
      appAuth('hideRestaurant'),
      validate(HideRestaurantValidation.hideRestaurantValidation),
    ],
    handler: HideRestaurantController.hideRestauarant,
  });
  route({
    method: 'PATCH',
    url: '/hide_reason/restaurant/update_reason/',
    preHandler: [
      appAuth('updateHideReasonRestaurant'),
      validate(HideRestaurantValidation.updateHideReasonValidation),
    ],
    handler: HideRestaurantController.updateHideReason,
  });
  route({
    method: 'POST',
    url: '/hide/showHiddenRestaurant',
    preHandler: [
      appAuth('showHiddenRestaurant'),
      validate(HideRestaurantValidation.showRestaurantValidation),
    ],
    handler: HideRestaurantController.showRestaurant,
  });
  route({
    method: 'GET',
    url: '/hide_reason/restaurant/',
    preHandler: [appAuth('getRestaurantHideReason')],
    handler: HideRestaurantReasonController.getReasons,
  });
  route({
    method: 'POST',
    url: '/hide/restaurants/get',
    preHandler: [
      appAuth('getMyHiddenRestaurants'),
      validate(HideRestaurantValidation.getMyHiddenRestaurantsValidation),
    ],
    handler: HideRestaurantController.getMyHiddenRestaurants,
  });
  // Hide Restaurant Routes //

  // Report Issue Restaurant Routes //
  route({
    method: 'GET',
    url: '/report/reasons',
    preHandler: [appAuth('getReportReasons')],
    handler: ReportIssueRestaurantReasonController.getReasons,
  });
  route({
    method: 'POST',
    url: '/report/restaurant',
    preHandler: [
      appAuth('reportRestaurant'),
      validate(ReportIssueRestaurantValidation.saveIssueValidation),
    ],
    handler: ReportIssueRestaurantController.create,
  });
  // Report Issue Restaurant Routes //

  // Favourite Orders Routes //
  route({
    method: 'POST',
    url: '/favouriteOrders/save/',
    preHandler: [
      appAuth('saveFavouriteOrder'),
      validate(FavouriteOrderValidation.saveFavouriteOrderValidation),
    ],
    handler: FavouriteOrderController.saveFavourite,
  });
  route({
    method: 'POST',
    url: '/favouriteOrders/remove/',
    preHandler: [
      appAuth('removeFavouriteOrder'),
      validate(FavouriteOrderValidation.removeFavouriteOrderValidation),
    ],
    handler: FavouriteOrderController.removeFavourite,
  });
  // Favourite Orders Routes //

  // Review & Ratings Routes //
  route({
    method: 'POST',
    url: '/review/save/',
    preHandler: [
      appAuth('saveOrderReview'),
      validate(ReviewRatingValidation.saveReviewValidation),
    ],
    handler: ReviewRatingController.saveOrderReview,
  });
  route({
    method: 'GET',
    url: '/review/restaurant/direct/:restaurant',
    preHandler: [
      appAuth('getRestaurantInfoForDirectReview'),
      validate(RestaurantValidation.getRestaurantInfoForDirectReviewValidation),
    ],
    handler: RestaurantController.getRestaurantInfoForDirectReview,
  });
  route({
    method: 'POST',
    url: '/review/restaurant/direct/save',
    preHandler: [
      appAuth('saveDirectRestaurantReview'),
      validate(ReviewRatingValidation.savePublicRestaurantReviewValidation),
    ],
    handler: ReviewRatingController.savePublicRestaurantReview,
  });
  route({
    method: 'GET',
    url: '/review/myReviewList/:uid',
    preHandler: [
      appAuth('myReviewList'),
      validate(ReviewRatingValidation.getMyReviewListValidation),
    ],
    handler: ReviewRatingController.getMyReviewList,
  });
  route({
    method: 'POST',
    url: '/review/search/restaurants/',
    preHandler: [
      appAuth('searchRestaurantForReview'),
      validate(RestaurantValidation.globalRestaurantSearchForReviewValidation),
    ],
    handler: RestaurantController.globalRestaurantSearchForReview,
  });
  // Review & Ratings Routes //

  // Notification Routes //
  route({
    method: 'GET',
    url: '/notification/count/:user',
    preHandler: [
      appAuth('getNotificationCount'),
      validate(UserValidation.idValidation),
    ],
    handler: NotificationListController.get,
  });
  route({
    method: 'POST',
    url: '/notification/list/',
    preHandler: [
      appAuth('getNotificationList'),
      validate(UserValidation.notificationListValidation),
    ],
    handler: NotificationListController.getMyNotificationList,
  });
  route({
    method: 'GET',
    url: '/notification/readAll/:user',
    preHandler: [
      appAuth('readAllNotification'),
      validate(UserValidation.idValidation),
    ],
    handler: NotificationListController.readAllNotification,
  });
  // Notification Routes //

  // Subscription Tiffin Package Routes //
  route({
    method: 'GET',
    url: '/tiffin_packages/buy/:id/',
    preHandler: [
      appAuth('buyTiffinSubscription'),
      validate(SubscriptionTiffinPackageValidation.getDetailValidation),
    ],
    handler: SubscriptionTiffinPackageController.buySubscriptionDetails,
  });
  route({
    method: 'POST',
    url: '/tiffin_packages/purchase_tiffin_package/',
    preHandler: [
      appAuth('purchaseTiffinSubscription'),
      validate(UserPurchasedTiffinSubscriptionValidation.buyTiffinSubscriptionValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.purchaseTiffinSubscription,
  });
  route({
    method: 'POST',
    url: '/tiffin_packages/purchased/',
    preHandler: [
      appAuth('purchasedTiffinSubscriptionList'),
      validate(UserPurchasedTiffinSubscriptionValidation.purchasedSubscriptionListValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.getMyPurchasedSubscription,
  });
  route({
    method: 'POST',
    url: '/tiffin_packages/purchased/info/',
    preHandler: [
      appAuth('purchasedTiffinSubscriptionInfo'),
      validate(UserPurchasedTiffinSubscriptionValidation.purchasedSubscriptionInfoValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.getPurchasedSubscriptionInfo,
  });
  route({
    method: 'POST',
    url: '/tiffin_packages/repayPendingSubscriptionPackage/',
    preHandler: [
      appAuth('repayPendingSubscriptionPackage'),
      validate(
      UserPurchasedTiffinSubscriptionValidation.repayPendingSubscriptionTiffinPackageValidation
    ),
    ],
    handler: UserPurchasedTiffinSubscriptionController.repayPendingSubscriptionPackage,
  });
  route({
    method: 'POST',
    url: '/tiffin_packages/userCancelTiffinSubscription/',
    preHandler: [
      appAuth('userCancelTiffinSubscription'),
      validate(UserPurchasedTiffinSubscriptionValidation.userCancelTiffinSubscriptionValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.userCancelTiffinSubscription,
  });
  route({
    method: 'POST',
    url: '/tiffin_packages/requestOffDay/',
    preHandler: [
      appAuth('userRequestOffDayTiffinSubscription'),
      validate(UserPurchasedTiffinSubscriptionValidation.userRequestOffDayOnSubscriptionValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.userRequestOffDayOnSubscription,
  });
  route({
    method: 'GET',
    url: '/tiffin_packages/summary/:id/:user/:locale',
    preHandler: [
      appAuth('download_tiffin_packages_receipt'),
      validate(UserPurchasedTiffinSubscriptionValidation.downloadBookingReceiptValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.downloadSummary,
  });
  route({
    method: 'GET',
    url: '/tiffin_packages/invoice/:id/:user/:locale',
    preHandler: [
      appAuth('download_tiffin_packages_receipt'),
      validate(UserPurchasedTiffinSubscriptionValidation.downloadBookingReceiptValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.downloadInvoice,
  });
  // Subscription Tiffin Package Routes //

  // Tiffin Subscription Cancellation Reason Routes //
  route({
    method: 'GET',
    url: '/tiffin_subscription_cancel_reason/user',
    preHandler: [appAuth('tiffinSubscriptionCancellationReason')],
    handler: TiffinSubscriptionCancellationReasonController.getCustomerCancellationList,
  });
  // Tiffin Subscription Cancellation Reason Routes //

  /// Tiffin Subscription Refund Routes //
  route({
    method: 'GET',
    url: '/tiffin_subscription_refund/reasons',
    preHandler: [appAuth('getTiffinSubscriptionRefundReason')],
    handler: TiffinSubscriptionRefundRequestReasonController.getReasons,
  });
  route({
    method: 'POST',
    url: '/tiffin_subscription_refund/sendRefundRequest/',
    preHandler: [
      appAuth('sendTiffinSubscriptionRefundRequest'),
      validate(TiffinSubscriptionRefundRequestValidation.saveRefundRequestValidation),
    ],
    handler: TiffinSubscriptionRefundRequestController.saveRefundRequest,
  });
  /// Tiffin Subscription Refund Routes //

  /// Dining Bookings Routes //
  route({
    method: 'POST',
    url: '/dining_booking/confirm/',
    preHandler: [
      appAuth('confirmDiningBooking'),
      validate(DiningBookingValidation.diningBookingConfirmValidation),
    ],
    handler: RestaurantController.getDiningBookingConfirmInformation,
  });
  route({
    method: 'GET',
    url: '/dining_coupon/redeem/:user/:coupon',
    preHandler: [
      appAuth('redeeemDiningCoupon'),
      validate(DiningCouponValidation.redeemValidation),
    ],
    handler: DiningCouponController.redeemCoupon,
  });
  route({
    method: 'POST',
    url: '/dining_booking/create/',
    preHandler: [
      appAuth('createDiningBooking'),
      validate(DiningBookingValidation.createBookingValidation),
    ],
    handler: DiningBookingController.createBooking,
  });
  route({
    method: 'GET',
    url: '/dining_booking/search/:uid/:query',
    preHandler: [
      appAuth('searchDiningBooking'),
      validate(DiningBookingValidation.queryValidation),
    ],
    handler: DiningBookingController.searchDiningBooking,
  });
  route({
    method: 'POST',
    url: '/dining_booking/list/',
    preHandler: [
      appAuth('diningBookingList'),
      validate(DiningBookingValidation.diningBookingByUserIdValidation),
    ],
    handler: DiningBookingController.getDiningBookingWithUserId,
  });
  route({
    method: 'POST',
    url: '/dining_booking/information/',
    preHandler: [
      appAuth('diningBookingInformation'),
      validate(DiningBookingValidation.getUserDiningBookingInformationValidation),
    ],
    handler: DiningBookingController.getUserDiningBookingInformation,
  });
  route({
    method: 'POST',
    url: '/dining_booking/repayPendingBooking/',
    preHandler: [
      appAuth('repayPendingBooking'),
      validate(DiningBookingValidation.repayPendingBookingValidation),
    ],
    handler: DiningBookingController.repayPendingBooking,
  });
  route({
    method: 'GET',
    url: '/dining_booking/cancellation/user',
    preHandler: [appAuth('diningBookingCancellationReason')],
    handler: DiningCancellationReasonController.getCustomerCancellationList,
  });
  route({
    method: 'POST',
    url: '/dining_booking/cancelMyDiningBooking/',
    preHandler: [
      appAuth('cancelMyDiningBooking'),
      validate(DiningBookingValidation.cancleUserDiningBookingValidation),
    ],
    handler: DiningBookingController.cancelMyDiningBooking,
  });
  route({
    method: 'GET',
    url: '/dining_booking_refund/reasons',
    preHandler: [appAuth('getDiningBookingRefundReason')],
    handler: DiningBookingRefundRequestReasonController.getReasons,
  });
  route({
    method: 'POST',
    url: '/dining_booking_refund/request/',
    preHandler: [
      appAuth('createDiningBookingRefundRequest'),
      validate(DiningBookingRefundRequestValidation.saveRefundRequestValidation),
    ],
    handler: DiningBookingRefundRequestController.saveRefundRequest,
  });
  route({
    method: 'GET',
    url: '/dining_booking/summary/:id/:user/:locale',
    preHandler: [
      appAuth('download_booking_receipt'),
      validate(DiningBookingValidation.downloadBookingReceiptValidation),
    ],
    handler: DiningBookingController.downloadBookingSummary,
  });
  route({
    method: 'GET',
    url: '/dining_booking/invoice/:id/:user/:locale',
    preHandler: [
      appAuth('download_booking_receipt'),
      validate(DiningBookingValidation.downloadBookingReceiptValidation),
    ],
    handler: DiningBookingController.downloadBookingInvoice,
  });
  /// Dining Bookings Routes //

  // Payment Transaction Routes //
  route({
    method: 'POST',
    url: '/transaction/orders/',
    preHandler: [
      appAuth('getUserOrderTransactions'),
      validate(PaymentInitiationValidation.getUserOrderTransactionsValidation),
    ],
    handler: PaymentInitiationController.getUserOrderTransaction,
  });
  route({
    method: 'POST',
    url: '/transaction/booking/',
    preHandler: [
      appAuth('getUserDiningTransactions'),
      validate(PaymentInitiationValidation.getUserDiningransactionsValidation),
    ],
    handler: PaymentInitiationController.getUserDiningTransaction,
  });
  route({
    method: 'POST',
    url: '/transaction/food_subscription/',
    preHandler: [
      appAuth('getFoodSubscriptionTransactions'),
      validate(PaymentInitiationValidation.getUserFoodSubscriptionTransactionsValidation),
    ],
    handler: PaymentInitiationController.getUserFoodSubscriptionTransaction,
  });
  // Payment Transaction Routes //

  // Phone Number Call Routes //
  route({
    method: 'GET',
    url: '/driver/call/:driver',
    preHandler: [
      appAuth('fetchDriverPhoneNumber'),
      validate(OrdersValidation.fetchDriverPhoneNumberValidation),
    ],
    handler: OrdersController.fetchDriverPhoneNumber,
  });
  // Phone Number Call Routes //

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
    url: '/delete_account_reason_list',
    preHandler: [appAuth('delete_account_reason_list')],
    handler: UserDeleteAccountReasonController.getUserActiveReason,
  });
  route({
    method: 'POST',
    url: '/account_setting/delete_account',
    preHandler: [
      appAuth('delete_account'),
      validate(UserValidation.deleteUserAccountValidation),
    ],
    handler: UserController.deleteUserAccount,
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
    url: '/account_setting/update_locale/',
    preHandler: [
      appAuth('update_locale'),
      validate(UserValidation.updateLocaleValidation),
    ],
    handler: UserController.updateUserLocale,
  });
  // Account Settings Routes//
};
