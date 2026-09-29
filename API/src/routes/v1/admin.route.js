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

const CountryValidation = require('../../validations/country.validation');
const CityValidation = require('../../validations/city.validation');
const LocalityValidation = require('../../validations/locality.validation');
const CuisineValidation = require('../../validations/cuisine.validation');
const FileValidation = require('../../validations/file.validation');
const LanguageValidation = require('../../validations/language.validation');
const SubscriptionValidation = require('../../validations/subscription.validation');
const RestaurantTypeValidation = require('../../validations/restaurant.type.validation');
const RestaurantValidation = require('../../validations/restaurant.validation');
const CategoryValidation = require('../../validations/category.validation');
const SubCategoryValidation = require('../../validations/sub.category.validation');
const VehicleValidation = require('../../validations/vehicle.validation');
const DriverValidation = require('../../validations/driver.validation');
const DeliveryShiftScheduleValidation = require('../../validations/deliveryman.shift.schedule.validation');
const RestaurantCampaignValidation = require('../../validations/restaurant.campaign.validation');
const SubscriberValidation = require('../../validations/subscriber.validation');
const FoodCampaignValidation = require('../../validations/food.campaign.validation');
const AddonsValidation = require('../../validations/addons.validation');
const FoodValidation = require('../../validations/food.validation');
const VendorSubCategoryValidation = require('../../validations/vendor.sub.category.validation');
const BusinessSettingValidation = require('../../validations/business.settings.validation');
const OrderCancellationReasonValidation = require('../../validations/order.cancellation.reason.validation');
const OrderSettingsValidation = require('../../validations/order.setting.validation');
const RefundRequestReasonValidation = require('../../validations/refund.request.reason.validation');
const UserSettingsValidation = require('../../validations/user.settings.validation');
const RestaurantSettingsValidation = require('../../validations/restaurant.settings.validation');
const DriverSettingsValidation = require('../../validations/driver.settings.validation');
const DisbursementValidation = require('../../validations/disbursement.validation');
const AppPageValidation = require('../../validations/app.pages.validation');
const RestaurantCampaignRequestValidation = require('../../validations/restaurant.campaign.request.validation');
const FoodCampaignRequestValidation = require('../../validations/food.campaign.request.validation');
const BannersValidation = require('../../validations/banner.validation');
const AppWebSettingValidation = require('../../validations/app.web.settings.validation');
const EmailConfigValidation = require('../../validations/email.config.validation');
const EmailTemplateValidation = require('../../validations/email.templates.validation');
const RestaurantFoodLicenseValidation = require('../../validations/restaurant.food.license.validation');
const PaymentConfigValidation = require('../../validations/payment.config.validation');
const DeliveryInstructionValidation = require('../../validations/delivery.instruction.validation');
const DeliveryGratitudeValidation = require('../../validations/delivery.gratitude.validation');
const CouponValidation = require('../../validations/coupon.validation');
const UserValidation = require('../../validations/user.validation');
const DriverIncentiveValidation = require('../../validations/driver.incentive.validation');
const DriverOfflineMessagesValidation = require('../../validations/driver.offline.messages.validation');
const OrderNotificationTranslationValidation = require('../../validations/order.notification.translation.validation');
const OrdersValidation = require('../../validations/orders.validation');
const RefundRequestValidation = require('../../validations/refund.request.validation');
const ComplaintsReasonValidation = require('../../validations/complaints.reason.validation');
const SmsProviderConfigValidation = require('../../validations/sms.provider.config.validation');
const ReportIssueRestaurantReasonValidation = require('../../validations/report.issue.restaurant.reason.validation');
const HideRestaurantReasonValidation = require('../../validations/hide.restaurant.reason.validation');
const OrderRatingMessageValidation = require('../../validations/order.ratings.message.validation');
const RestaurantNoticeValidation = require('../../validations/restaurant.notice.validation');
const SubscriptionTiffinPackageValidation = require('../../validations/subscription.tiffin.packages.validation');
const UserPurchasedTiffinSubscriptionValidation = require('../../validations/user.purchased.tiffin.subscriptions.validation');
const TiffinSubscriptionCancellationReasonValidation = require('../../validations/tiffin.subscription.cancellation.reason.validation');
const TiffinSubscriptionRefundRequestReasonValidation = require('../../validations/tiffin.subscription.refund.request.reason.validation');
const TiffinSubscriptionRefundRequestValidation = require('../../validations/tiffin.subscription.refund.request.validation');
const DiningSettingValidation = require('../../validations/dining.settings.validation');
const DiningCancellationReasonValidation = require('../../validations/dining.cancellation.reason.validation');
const DiningCategoryValidation = require('../../validations/dining.category.validation');
const DiningNoticeValidation = require('../../validations/dining.notice.validation');
const DiningCampaignValidation = require('../../validations/dining.campaign.validation');
const DiningCampaignRequestValidation = require('../../validations/dining.campaign.request.validation');
const RestaurantFacilitiesValidation = require('../../validations/restaurant.facilities.validation');
const DiningCouponValidation = require('../../validations/dining.coupon.validation');
const DiningBookingRefundRequestReasonValidation = require('../../validations/dining.booking.refund.request.reason.validation');
const DiningBookingRefundRequestValidation = require('../../validations/dining.booking.refund.request.validation');
const DiningBookingValidation = require('../../validations/dining.booking.validation');
const FeedbackFormValidation = require('../../validations/feedback.form.validation');
const ReportEmergencyValidation = require('../../validations/report.emergency.form.validation');
const UserAvatarValidation = require('../../validations/user.avatar.validation');
const SocialSignInValidation = require('../../validations/social.signin.validation');
const WaiterValidation = require('../../validations/waiter.validation');
const WaiterSettingValidation = require('../../validations/waiter.setting.validation');
const KitchenOwnerSettingValidation = require('../../validations/kitchen.owner.setting.validation');
const FoodTaxationValidation = require('../../validations/food.taxation.validation');
const CollectCashValidation = require('../../validations/collect.cash.validation');
const WithdrawalMethodValidation = require('../../validations/withdrawal.method.validation');
const WithdrawalRequestValidation = require('../../validations/withdrawal.request.validation');
const JoiningFormValidation = require('../../validations/joining.form.validation');
const RestaurantJoiningRequestValidation = require('../../validations/restaurant.joining.request.validation');
const DeliverymanJoiningRequestValidation = require('../../validations/deliveryman.joining.request.validation');
const InvoiceInstructionValidation = require('../../validations/invoice.instruction.validation');
const WalletBonusValidation = require('../../validations/wallet.bonus.validation');
const WalletValidation = require('../../validations/wallet.validation');
const PosOrTableOrderValidation = require('../../validations/pos.or.table.order.validation');
const TableOrderValidation = require('../../validations/table.order.validation');
const AdminExpenseValidation = require('../../validations/admin.expense.validation');
const AuthValidation = require('../../validations/auth.validation');
const UserAccountDeleteReasonValidation = require('../../validations/user.account.delete.reason.validation');
const KitchenOwnerValidation = require('../../validations/kitchen.owner.validation');
const ChatRoomValidation = require('../../validations/chat.room.validation');
const MediaStorageSettingValidation = require('../../validations/media.storage.setting.validation');
const LandingPageValidation = require('../../validations/landing.page.validation');

const CountryController = require('../../controllers/country.controller');
const CityController = require('../../controllers/city.controller');
const LocalityController = require('../../controllers/locality.controller');
const CuisineController = require('../../controllers/cuisine.controller');
const MediaController = require('../../controllers/media.controller');
const LangaugeController = require('../../controllers/language.controller');
const SubscriptionController = require('../../controllers/subscription.controller');
const RestaurantTypeController = require('../../controllers/restaurant.type.controller');
const RestaurantController = require('../../controllers/restaurant.controller');
const CategoryController = require('../../controllers/category.controller');
const SubCategoryController = require('../../controllers/sub.category.controller');
const VehicleController = require('../../controllers/vehicle.controller');
const DriverController = require('../../controllers/driver.controller');
const DeliveryShiftScheduleController = require('../../controllers/deliveryman.shift.schedule.controller');
const RestaurantCampaignController = require('../../controllers/restaurant.campaign.controller');
const SubscriberController = require('../../controllers/subscriber.controller');
const FoodCampaignController = require('../../controllers/food.campaign.controller');
const AddonsController = require('../../controllers/addons.controller');
const FoodController = require('../../controllers/food.controller');
const VendorSubCategoryController = require('../../controllers/vendor.sub.category.controller');
const BusinessSettingController = require('../../controllers/business.settings.controller');
const OrderCancellationReasonController = require('../../controllers/order.cancellation.reason.controller');
const OrderSettingsController = require('../../controllers/order.settings.controller');
const RefundRequestReasonController = require('../../controllers/refund.request.reason.controller');
const UserSettingsController = require('../../controllers/user.settings.controller');
const RestaurantSettingsController = require('../../controllers/restaurant.settings.controller');
const DriverSettingsController = require('../../controllers/driver.settings.controller');
const DisbursementController = require('../../controllers/disbursement.controller');
const AppPageController = require('../../controllers/app.pages.controller');
const RestaurantCampaignRequestController = require('../../controllers/restaurant.campaign.request.controller');
const FoodCampaignRequestController = require('../../controllers/food.campaign.request.controller');
const BannersController = require('../../controllers/banners.controller');
const AppWebSettingController = require('../../controllers/app.web.setting.controller');
const EmailConfigController = require('../../controllers/email.config.controller');
const EmailTemplateController = require('../../controllers/email.templates.controller');
const RestaurantFoodLicenseController = require('../../controllers/restaurant.food.license.controller');
const PaymentConfigController = require('../../controllers/payment.config.controller');
const DeliveryInstructionController = require('../../controllers/delivery.instructions.controller');
const DeliveryGratitudeController = require('../../controllers/delivery.gratitude.controller');
const CouponController = require('../../controllers/coupon.controller');
const UserController = require('../../controllers/user.controller');
const DriverIncentiveController = require('../../controllers/driver.incentive.controller');
const DriverOfflineMessagesController = require('../../controllers/driver.offline.messages.controller');
const OrderNotificationTranslationController = require('../../controllers/order.notification.translation.controller');
const OrdersController = require('../../controllers/orders.controller');
const RefundRequestController = require('../../controllers/refund.request.controller');
const ComplaintsReasonController = require('../../controllers/complaints.reason.controller');
const ComplaintsController = require('../../controllers/complaints.controller');
const SmsProviderConfigController = require('../../controllers/sms.provider.config.controller');
const ReportIssueRestaurantReasonController = require('../../controllers/report.issue.restaurant.reason.controller');
const ReportIssueRestaurantController = require('../../controllers/report.issue.restaurant.controller');
const HideRestaurantReasonController = require('../../controllers/hide.restaurant.reason.controller');
const HideRestaurantController = require('../../controllers/hide.restaurant.controller');
const OrderRatingMessageController = require('../../controllers/order.ratings.message.controller');
const RestaurantNoticeController = require('../../controllers/restaurant.notice.controller');
const SubscriptionTiffinPackageController = require('../../controllers/subscription.tiffin.package.controller');
const CronJobSchedulerController = require('../../controllers/cron.job.scheduler.controller');
const UserPurchasedTiffinSubscriptionController = require('../../controllers/user.purchased.tiffin.subscription.controller');
const TiffinSubscriptionCancellationReasonController = require('../../controllers/tiffin.subscription.cacellation.reason.controller');
const TiffinSubscriptionRefundRequestReasonController = require('../../controllers/tiffin.subscription.refund.request.reason.controller');
const TiffinSubscriptionRefundRequestController = require('../../controllers/tiffin.subscription.refund.request.controller');
const DiningSettingController = require('../../controllers/dining.settings.controller');
const DiningCancellationReasonController = require('../../controllers/dining.cancellation.reason.controller');
const DiningCategoryController = require('../../controllers/dining.category.controller');
const DiningNoticeController = require('../../controllers/dining.notice.controller');
const DiningCampaignController = require('../../controllers/dining.campaign.controller');
const DiningCampaignRequestController = require('../../controllers/dining.campaign.request.controller');
const RestaurantFacilitiesController = require('../../controllers/restaurant.facilities.controller');
const DiningCouponController = require('../../controllers/dining.coupon.controller');
const DiningBookingRefundRequestReasonController = require('../../controllers/dining.booking.refund.request.reason.controller');
const DiningBookingRefundRequestController = require('../../controllers/dining.booking.refund.request.controller');
const DiningBookingController = require('../../controllers/dining.booking.controller');
const FeedbackFormController = require('../../controllers/feedback.form.controller');
const ReportEmergencyController = require('../../controllers/report.emergency.form.controller');
const UserAvatarController = require('../../controllers/user.avatar.controller');
const SocialSignInController = require('../../controllers/social.signin.controller');
const RestaurantComplaintsController = require('../../controllers/restaurant.complaints.controller');
const WaiterController = require('../../controllers/waiter.controller');
const WaiterSettingController = require('../../controllers/waiter.settings.controller');
const KitchenOwnerSettingController = require('../../controllers/kitchen.owner.setting.controller');
const FoodTaxationController = require('../../controllers/food.taxation.controller');
const CollectCashController = require('../../controllers/collect.cash.controller');
const WithdrawalMethodController = require('../../controllers/withdrawal.method.controller');
const WithdrawalRequestController = require('../../controllers/withdrawal.request.controller');
const JoiningFormController = require('../../controllers/joining.form.controller');
const RestaurantJoiningRequestController = require('../../controllers/restaurant.joining.request.controller');
const DeliverymanJoiningRequestController = require('../../controllers/deliveryman.joining.request.controller');
const InvoiceInstructionController = require('../../controllers/invoice.instruction.controller');
const WalletBonusController = require('../../controllers/wallet.bonus.controller');
const LoyaltyPointsController = require('../../controllers/loyalty.points.controller');
const WalletController = require('../../controllers/wallet.controller');
const PosOrTableOrderController = require('../../controllers/pos.or.table.order.controller');
const TableOrderController = require('../../controllers/table.order.controller');
const PaymentInitiationController = require('../../controllers/payment.initiation.controller');
const AdminExpenseController = require('../../controllers/admin.expense.controller');
const UserAddressController = require('../../controllers/user.address.controller');
const FavouriteController = require('../../controllers/favourite.controller');
const ReviewRatingController = require('../../controllers/review.ratings.controller');
const RestaurantPayoutMethodController = require('../../controllers/restaurant.payout.method.controller');
const DeliverymanPayoutMethodController = require('../../controllers/deliveryman.payout.method.controller');
const AuthController = require('../../controllers/auth.controller');
const UserDeleteAccountReasonController = require('../../controllers/user.delete.account.reason.controller');
const KitchenOwnerController = require('../../controllers/kitchen.owner.controller');
const FcmController = require('../../controllers/fcm.notification.controller');
const NotificationListController = require('../../controllers/notification.list.controller');
const ChatRoomController = require('../../controllers/chat.room.controller');
const SupportChatRoomController = require('../../controllers/support.chat.room.controller');
const MediaStorageSettingController = require('../../controllers/media.storage.setting.controller');
const LandingPageController = require('../../controllers/landing.page.controller');

module.exports.register = function register(route) {
  route({
    method: 'GET',
    url: '/web_guard/:id',
    preHandler: [
      webAuth('web_guard'),
      validate(UserValidation.webGuardValidation),
    ],
    handler: UserController.adminProfile,
  });

  // Country Routes //
  route({
    method: 'GET',
    url: '/dashboard',
    preHandler: [webAuth('dashboard')],
    handler: OrdersController.adminDashboard,
  });
  route({
    method: 'POST',
    url: '/country/save',
    preHandler: [
      webAuth('createCountry'),
      validate(CountryValidation.createCountry),
    ],
    handler: CountryController.create,
  });
  route({
    method: 'GET',
    url: '/country/getAll',
    preHandler: [webAuth('getCountries')],
    handler: CountryController.get,
  });
  route({
    method: 'PATCH',
    url: '/country/update/:countryId',
    preHandler: [
      webAuth('updateCountry'),
      validate(CountryValidation.idValidation),
    ],
    handler: CountryController.update,
  });
  route({
    method: 'DELETE',
    url: '/country/delete/:countryId',
    preHandler: [
      webAuth('deleteCountry'),
      validate(CountryValidation.idValidation),
    ],
    handler: CountryController.drop,
  });
  // Country Routes //

  // City Routes //
  route({
    method: 'POST',
    url: '/cities/save',
    preHandler: [
      webAuth('createCity'),
      validate(CityValidation.createCity),
    ],
    handler: CityController.create,
  });
  route({
    method: 'GET',
    url: '/cities/getAll',
    preHandler: [
      webAuth('getCities'),
      validate(CityValidation.getAllCities),
    ],
    handler: CityController.get,
  });
  route({
    method: 'GET',
    url: '/cities/listAllCities',
    preHandler: [webAuth('getCities')],
    handler: CityController.getAll,
  });
  route({
    method: 'PATCH',
    url: '/cities/update/:cityId',
    preHandler: [
      webAuth('updateCity'),
      validate(CityValidation.idValidation),
    ],
    handler: CityController.update,
  });
  route({
    method: 'PATCH',
    url: '/cities/updateStatus/:cityId',
    preHandler: [
      webAuth('updateCity'),
      validate(CityValidation.idValidation),
    ],
    handler: CityController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/cities/delete/:cityId',
    preHandler: [
      webAuth('deleteCity'),
      validate(CityValidation.idValidation),
    ],
    handler: CityController.drop,
  });

  route({
    method: 'GET',
    url: '/cities/map_dialog/:city',
    preHandler: [
      webAuth('getCities'),
      validate(RestaurantValidation.cityMapDialogValidation),
    ],
    handler: RestaurantController.cityMapDialogData,
  });
  // City Routes //

  // Locality Routes //
  route({
    method: 'POST',
    url: '/localities/save',
    preHandler: [
      webAuth('createLocality'),
      validate(LocalityValidation.createLocality),
    ],
    handler: LocalityController.create,
  });
  route({
    method: 'GET',
    url: '/localities/getAll',
    preHandler: [
      webAuth('getLocalities'),
      validate(LocalityValidation.allValidation),
    ],
    handler: LocalityController.get,
  });
  route({
    method: 'GET',
    url: '/localities/getByCityId/:cityId',
    preHandler: [
      webAuth('getLocalities'),
      validate(CityValidation.idValidation),
    ],
    handler: LocalityController.getByCityId,
  });
  route({
    method: 'PATCH',
    url: '/localities/update/:localityId',
    preHandler: [
      webAuth('updateLocality'),
      validate(LocalityValidation.idValidation),
    ],
    handler: LocalityController.update,
  });
  route({
    method: 'PATCH',
    url: '/localities/updateStatus/:localityId',
    preHandler: [
      webAuth('updateLocality'),
      validate(LocalityValidation.idValidation),
    ],
    handler: LocalityController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/localities/deleteLocality/:localityId',
    preHandler: [
      webAuth('deleteLocality'),
      validate(LocalityValidation.idValidation),
    ],
    handler: LocalityController.drop,
  });
  // Locality Routes //

  // Cuisine Routes //
  route({
    method: 'POST',
    url: '/cuisine/save',
    preHandler: [
      webAuth('createCuisine'),
      validate(CuisineValidation.createCuisine),
    ],
    handler: CuisineController.create,
  });
  route({
    method: 'GET',
    url: '/cuisine/getAll',
    preHandler: [
      webAuth('getCuisines'),
      validate(CuisineValidation.allValidation),
    ],
    handler: CuisineController.get,
  });
  route({
    method: 'GET',
    url: '/cuisine/listAllCuisine',
    preHandler: [webAuth('getCuisines')],
    handler: CuisineController.getAll,
  });
  route({
    method: 'PATCH',
    url: '/cuisine/update/:cuisineId',
    preHandler: [
      webAuth('updateCuisine'),
      validate(CuisineValidation.idValidation),
    ],
    handler: CuisineController.update,
  });
  route({
    method: 'PATCH',
    url: '/cuisine/updateStatus/:cuisineId',
    preHandler: [
      webAuth('updateCuisine'),
      validate(CuisineValidation.idValidation),
    ],
    handler: CuisineController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/cuisine/delete/:cuisineId',
    preHandler: [
      webAuth('deleteCuisine'),
      validate(CuisineValidation.idValidation),
    ],
    handler: CuisineController.drop,
  });
  // Cuisine Routes //

  // Files Routes //
  route({
    method: 'DELETE',
    url: '/files/delete/:path',
    preHandler: [
      webAuth('deleteFile'),
      validate(FileValidation.pathValidation),
    ],
    handler: MediaController.drop,
  });
  // Files Routes //

  // Language Routes //
  route({
    method: 'POST',
    url: '/language/save',
    preHandler: [
      webAuth('createLanguage'),
      validate(LanguageValidation.createLanguage),
    ],
    handler: LangaugeController.create,
  });
  route({
    method: 'GET',
    url: '/language/getAll',
    preHandler: [
      webAuth('getLanguage'),
      validate(LanguageValidation.allValidation),
    ],
    handler: LangaugeController.get,
  });
  route({
    method: 'PATCH',
    url: '/language/update/:languageId',
    preHandler: [
      webAuth('updateLanguage'),
      validate(LanguageValidation.idValidation),
    ],
    handler: LangaugeController.update,
  });
  route({
    method: 'PATCH',
    url: '/language/updateDefault/:languageId',
    preHandler: [
      webAuth('updateDefault'),
      validate(LanguageValidation.idValidation),
    ],
    handler: LangaugeController.updateDefault,
  });
  route({
    method: 'DELETE',
    url: '/language/delete/:languageId',
    preHandler: [
      webAuth('deleteLanguage'),
      validate(LanguageValidation.idValidation),
    ],
    handler: LangaugeController.drop,
  });
  // Language Routes //

  // Subscriptions Routes //
  route({
    method: 'POST',
    url: '/subscription/save',
    preHandler: [
      webAuth('createSubscription'),
      validate(SubscriptionValidation.createSubscription),
    ],
    handler: SubscriptionController.create,
  });
  route({
    method: 'GET',
    url: '/subscription/getAll',
    preHandler: [
      webAuth('getSubscriptions'),
      validate(SubscriptionValidation.allValidation),
    ],
    handler: SubscriptionController.getAdminSubscriptionList,
  });
  route({
    method: 'GET',
    url: '/subscription/get/:subscriptionId',
    preHandler: [
      webAuth('subscriptionGetById'),
      validate(SubscriptionValidation.idValidation),
    ],
    handler: SubscriptionController.getById,
  });
  route({
    method: 'PATCH',
    url: '/subscription/update/:subscriptionId',
    preHandler: [
      webAuth('updateSubscription'),
      validate(SubscriptionValidation.idValidation),
    ],
    handler: SubscriptionController.update,
  });
  route({
    method: 'PATCH',
    url: '/subscription/updateStatus/:subscriptionId',
    preHandler: [
      webAuth('updateSubscription'),
      validate(SubscriptionValidation.idValidation),
    ],
    handler: SubscriptionController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/subscription/delete/:subscriptionId',
    preHandler: [
      webAuth('deleteSubscription'),
      validate(SubscriptionValidation.idValidation),
    ],
    handler: SubscriptionController.drop,
  });
  // Subscriptions Routes //

  // Restaurant Type Routes //
  route({
    method: 'POST',
    url: '/restaurantType/save',
    preHandler: [
      webAuth('createRestaurantType'),
      validate(RestaurantTypeValidation.createRestaurantType),
    ],
    handler: RestaurantTypeController.create,
  });
  route({
    method: 'GET',
    url: '/restaurantType/getAll',
    preHandler: [
      webAuth('getRestaurantType'),
      validate(RestaurantTypeValidation.allValidation),
    ],
    handler: RestaurantTypeController.get,
  });
  route({
    method: 'PATCH',
    url: '/restaurantType/update/:id',
    preHandler: [
      webAuth('updateRestaurantType'),
      validate(RestaurantTypeValidation.idValidation),
    ],
    handler: RestaurantTypeController.update,
  });
  route({
    method: 'PATCH',
    url: '/restaurantType/updateStatus/:id',
    preHandler: [
      webAuth('updateRestaurantType'),
      validate(RestaurantTypeValidation.idValidation),
    ],
    handler: RestaurantTypeController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/restaurantType/delete/:id',
    preHandler: [
      webAuth('deleteRestaurantType'),
      validate(RestaurantTypeValidation.idValidation),
    ],
    handler: RestaurantTypeController.drop,
  });
  // Restaurant Type Routes //

  // Restaurant Routes //
  route({
    method: 'POST',
    url: '/restaurant/save',
    preHandler: [
      webAuth('createRestaurant'),
      validate(RestaurantValidation.createVendor),
    ],
    handler: RestaurantController.registerVendorAccount,
  });
  route({
    method: 'GET',
    url: '/restaurant/getBasicDataForNewRestaurant',
    preHandler: [webAuth('createRestaurant')],
    handler: RestaurantController.getBasicDataForNewRestaurant,
  });
  route({
    method: 'GET',
    url: '/restaurant/getAll',
    preHandler: [
      webAuth('getAllRestaurant'),
      validate(RestaurantValidation.allValidation),
    ],
    handler: RestaurantController.get,
  });
  route({
    method: 'GET',
    url: '/restaurant/getOutlets',
    preHandler: [
      webAuth('getAllRestaurant'),
      validate(RestaurantValidation.allValidation),
    ],
    handler: RestaurantController.getOutlets,
  });
  route({
    method: 'PATCH',
    url: '/restaurant/updateStatus/:restaurantId',
    preHandler: [
      webAuth('updateRestaurant'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.updateStatus,
  });
  route({
    method: 'GET',
    url: '/restaurant/getById/:restaurantId',
    preHandler: [
      webAuth('getRestaurantById'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.getById,
  });
  route({
    method: 'PATCH',
    url: '/restaurant/update/:restaurantId',
    preHandler: [
      webAuth('updateRestaurant'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.update,
  });
  route({
    method: 'GET',
    url: '/restaurant/getRestaurantByCityId/:cityId',
    preHandler: [
      webAuth('getRestaurantByCity'),
      validate(RestaurantValidation.cityIdValidation),
    ],
    handler: RestaurantController.getRestaurantByCityId,
  });
  route({
    method: 'GET',
    url: '/restaurant/getRestaurantByCityIdLimitedData/:cityId',
    preHandler: [
      webAuth('getRestaurantByCity'),
      validate(RestaurantValidation.restaurantByCityIdLimitedDetailsValidation),
    ],
    handler: RestaurantController.getRestaurantsByCityIdLimitedDetailsForAdmin,
  });
  route({
    method: 'GET',
    url: '/restaurant/getRestaurantByCityIdForTiffinPackages/:cityId',
    preHandler: [
      webAuth('getRestaurantByCity'),
      validate(RestaurantValidation.restaurantByCityIdLimitedDetailsValidation),
    ],
    handler: RestaurantController.getRestaurantsByCityIdForTiffinPackagesAdmin,
  });
  route({
    method: 'GET',
    url: '/restaurant/getDiningSupportedRestaurantByCityId/:cityId',
    preHandler: [
      webAuth('getRestaurantByCity'),
      validate(RestaurantValidation.restaurantByCityIdLimitedDetailsValidation),
    ],
    handler: RestaurantController.getDiningSupportedRestaurantByCityId,
  });
  route({
    method: 'GET',
    url: '/restaurant/map_dialog/:city',
    preHandler: [
      webAuth('getRestaurantByCity'),
      validate(RestaurantValidation.cityMapDialogValidation),
    ],
    handler: RestaurantController.cityMapDialogRestaurants,
  });
  route({
    method: 'GET',
    url: '/restaurant/filter/:kind/:id',
    preHandler: [
      webAuth('getAllRestaurant'),
      validate(RestaurantValidation.filterValidation),
    ],
    handler: RestaurantController.filterRestaurantList,
  });
  route({
    method: 'GET',
    url: '/restaurant/filter_data',
    preHandler: [webAuth('getAllRestaurant')],
    handler: RestaurantController.filterQueryData,
  });
  route({
    method: 'POST',
    url: '/restaurant/filter_restaurant',
    preHandler: [
      webAuth('getAllRestaurant'),
      validate(RestaurantValidation.filterQueryValidation),
    ],
    handler: RestaurantController.filterQuery,
  });
  // Restaurant Routes //

  // Category Routes //
  route({
    method: 'POST',
    url: '/category/save',
    preHandler: [
      webAuth('createCategory'),
      validate(CategoryValidation.createCategory),
    ],
    handler: CategoryController.create,
  });
  route({
    method: 'GET',
    url: '/category/getAll',
    preHandler: [
      webAuth('getCategories'),
      validate(CategoryValidation.allValidation),
    ],
    handler: CategoryController.get,
  });
  route({
    method: 'GET',
    url: '/category/getCategoryList',
    preHandler: [webAuth('getCategories')],
    handler: CategoryController.getAll,
  });
  route({
    method: 'PATCH',
    url: '/category/update/:categoryId',
    preHandler: [
      webAuth('updateCategory'),
      validate(CategoryValidation.idValidation),
    ],
    handler: CategoryController.update,
  });
  route({
    method: 'DELETE',
    url: '/category/delete/:categoryId',
    preHandler: [
      webAuth('deleteCategory'),
      validate(CategoryValidation.idValidation),
    ],
    handler: CategoryController.drop,
  });
  // Category Routes //

  // Sub Category Routes //
  route({
    method: 'POST',
    url: '/subCategory/save',
    preHandler: [
      webAuth('createSubCategory'),
      validate(SubCategoryValidation.createSubCategory),
    ],
    handler: SubCategoryController.create,
  });
  route({
    method: 'GET',
    url: '/subCategory/getAll',
    preHandler: [
      webAuth('getSubCategories'),
      validate(SubCategoryValidation.allValidation),
    ],
    handler: SubCategoryController.get,
  });
  route({
    method: 'PATCH',
    url: '/subCategory/update/:subCategoryId',
    preHandler: [
      webAuth('updateSubCategory'),
      validate(SubCategoryValidation.idValidation),
    ],
    handler: SubCategoryController.update,
  });
  route({
    method: 'DELETE',
    url: '/subCategory/delete/:subCategoryId',
    preHandler: [
      webAuth('deleteSubCategory'),
      validate(SubCategoryValidation.idValidation),
    ],
    handler: SubCategoryController.drop,
  });
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

  route({
    method: 'GET',
    url: '/vendor_sub_category/getActiveByCategoryId/:category/:restaurant',
    preHandler: [
      webAuth('getVendorSubCategories'),
      validate(VendorSubCategoryValidation.mySubCategoryByCateIdValidation),
    ],
    handler: VendorSubCategoryController.getAllSubCategoryById,
  });
  // Sub Category Routes //

  // Vehicle Routes //
  route({
    method: 'POST',
    url: '/vehicle/save',
    preHandler: [
      webAuth('createVehicle'),
      validate(VehicleValidation.createVehicle),
    ],
    handler: VehicleController.create,
  });
  route({
    method: 'GET',
    url: '/vehicle/getAll',
    preHandler: [
      webAuth('getVehicle'),
      validate(VehicleValidation.allValidation),
    ],
    handler: VehicleController.get,
  });
  route({
    method: 'PATCH',
    url: '/vehicle/update/:vehicleId',
    preHandler: [
      webAuth('updateVehicle'),
      validate(VehicleValidation.idValidation),
    ],
    handler: VehicleController.update,
  });
  route({
    method: 'DELETE',
    url: '/vehicle/delete/:vehicleId',
    preHandler: [
      webAuth('updateVehicle'),
      validate(VehicleValidation.idValidation),
    ],
    handler: VehicleController.drop,
  });
  // Vehicle Routes //

  // Driver Routes //
  route({
    method: 'POST',
    url: '/driver/save',
    preHandler: [
      webAuth('createDriver'),
      validate(DriverValidation.createDriver),
    ],
    handler: DriverController.registerDriverAccount,
  });
  route({
    method: 'GET',
    url: '/driver/getBasicData',
    preHandler: [webAuth('createDriver')],
    handler: DriverController.getBasicData,
  });
  route({
    method: 'GET',
    url: '/driver/getAll',
    preHandler: [
      webAuth('getDrivers'),
      validate(DriverValidation.allValidation),
    ],
    handler: DriverController.get,
  });
  route({
    method: 'GET',
    url: '/driver/getAllVendorDeliveryman',
    preHandler: [
      webAuth('getDrivers'),
      validate(DriverValidation.allValidation),
    ],
    handler: DriverController.getAllVendorDriverList,
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
  route({
    method: 'GET',
    url: '/driver/getByCity/:city',
    preHandler: [
      webAuth('getDrivers'),
      validate(DriverValidation.driverByCityValidation),
    ],
    handler: DriverController.getDeliverymanFromCity,
  });
  route({
    method: 'GET',
    url: '/driver/walletFundList',
    preHandler: [webAuth('walletFundList')],
    handler: DriverController.deliverymanWalletFundList,
  });
  route({
    method: 'GET',
    url: '/driver/map_dialog/:city',
    preHandler: [
      webAuth('getDrivers'),
      validate(DriverValidation.driverByCityValidation),
    ],
    handler: DriverController.cityMapDialogDeliveryman,
  });
  // Driver Routes //

  // Delivery Shift Schedule Routes //
  route({
    method: 'POST',
    url: '/deliveryShiftSchedule/save',
    preHandler: [
      webAuth('createDeliveryShiftSchedule'),
      validate(DeliveryShiftScheduleValidation.createScheduleValidation),
    ],
    handler: DeliveryShiftScheduleController.create,
  });
  route({
    method: 'GET',
    url: '/deliveryShiftSchedule/get',
    preHandler: [
      webAuth('getDeliveryShiftSchedule'),
      validate(DeliveryShiftScheduleValidation.allValidation),
    ],
    handler: DeliveryShiftScheduleController.get,
  });
  route({
    method: 'PATCH',
    url: '/deliveryShiftSchedule/update/:id',
    preHandler: [
      webAuth('updateDeliveryShift'),
      validate(DeliveryShiftScheduleValidation.idValidation),
    ],
    handler: DeliveryShiftScheduleController.update,
  });
  route({
    method: 'DELETE',
    url: '/deliveryShiftSchedule/delete/:id',
    preHandler: [
      webAuth('deleteDeliveryShift'),
      validate(DeliveryShiftScheduleValidation.idValidation),
    ],
    handler: DeliveryShiftScheduleController.drop,
  });
  // Delivery Shift Schedule Routes //

  // Restaurant Campaign Routes //
  route({
    method: 'POST',
    url: '/restaurant_campaign/save',
    preHandler: [
      webAuth('createRestaurantCampaign'),
      validate(RestaurantCampaignValidation.createRestaurantCampaign),
    ],
    handler: RestaurantCampaignController.create,
  });
  route({
    method: 'GET',
    url: '/restaurant_campaign/getAll',
    preHandler: [
      webAuth('getRestaurantCampaigns'),
      validate(RestaurantCampaignValidation.allValidation),
    ],
    handler: RestaurantCampaignController.get,
  });
  route({
    method: 'GET',
    url: '/restaurant_campaign/getBasicData',
    preHandler: [webAuth('createRestaurantCampaign')],
    handler: RestaurantCampaignController.getBasicData,
  });
  route({
    method: 'GET',
    url: '/restaurant_campaign/getById/:campaignId',
    preHandler: [
      webAuth('getRestaurantCampaignById'),
      validate(RestaurantCampaignValidation.idValidation),
    ],
    handler: RestaurantCampaignController.getById,
  });
  route({
    method: 'PATCH',
    url: '/restaurant_campaign/update/:campaignId',
    preHandler: [
      webAuth('updateRestaurantCampaign'),
      validate(RestaurantCampaignValidation.idValidation),
    ],
    handler: RestaurantCampaignController.update,
  });
  route({
    method: 'PATCH',
    url: '/restaurant_campaign/updateStatus/:campaignId',
    preHandler: [
      webAuth('updateRestaurantCampaign'),
      validate(RestaurantCampaignValidation.idValidation),
    ],
    handler: RestaurantCampaignController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/restaurant_campaign/delete/:campaignId',
    preHandler: [
      webAuth('deleteRestaurantCampaign'),
      validate(RestaurantCampaignValidation.idValidation),
    ],
    handler: RestaurantCampaignController.drop,
  });
  route({
    method: 'GET',
    url: '/restaurant_campaign/getRestaurantByCityId/:cityId',
    preHandler: [
      webAuth('createRestaurantCampaign'),
      validate(RestaurantCampaignValidation.cityIdValidation),
    ],
    handler: RestaurantCampaignController.getRestaurantByCityId,
  });
  route({
    method: 'GET',
    url: '/restaurant_campaign/detail/:id',
    preHandler: [
      webAuth('campaignDetail'),
      validate(RestaurantCampaignValidation.detailValidation),
    ],
    handler: RestaurantCampaignController.detail,
  });
  // Restaurant Campaign Routes //

  // Food Campaign Routes //
  route({
    method: 'POST',
    url: '/food_campaign/save',
    preHandler: [
      webAuth('createFoodCampaign'),
      validate(FoodCampaignValidation.createFoodCampaign),
    ],
    handler: FoodCampaignController.create,
  });
  route({
    method: 'GET',
    url: '/food_campaign/getAll',
    preHandler: [
      webAuth('getFoodCampaign'),
      validate(FoodCampaignValidation.allValidation),
    ],
    handler: FoodCampaignController.get,
  });
  route({
    method: 'PATCH',
    url: '/food_campaign/updateStatus/:campaignId',
    preHandler: [
      webAuth('updateFoodCampaign'),
      validate(FoodCampaignValidation.idValidation),
    ],
    handler: FoodCampaignController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/food_campaign/delete/:campaignId',
    preHandler: [
      webAuth('deleteFoodCampaign'),
      validate(FoodCampaignValidation.idValidation),
    ],
    handler: FoodCampaignController.drop,
  });
  route({
    method: 'GET',
    url: '/food_campaign/getBasicData',
    preHandler: [webAuth('createFoodCampaign')],
    handler: FoodCampaignController.getBasicData,
  });
  route({
    method: 'GET',
    url: '/food_campaign/getRestaurantByCityId/:cityId',
    preHandler: [
      webAuth('createFoodCampaign'),
      validate(FoodCampaignValidation.cityIdValidation),
    ],
    handler: FoodCampaignController.getRestaurantByCityId,
  });
  route({
    method: 'GET',
    url: '/food_campaign/getFoodByRestaurant/:restaurantId',
    preHandler: [
      webAuth('createFoodCampaign'),
      validate(FoodCampaignValidation.restaurantIdValidation),
    ],
    handler: FoodCampaignController.getFoodByRestaurantId,
  });
  route({
    method: 'GET',
    url: '/food_campaign/getById/:campaignId',
    preHandler: [
      webAuth('getFoodCampaignById'),
      validate(FoodCampaignValidation.idValidation),
    ],
    handler: FoodCampaignController.getById,
  });
  route({
    method: 'PATCH',
    url: '/food_campaign/update/:campaignId',
    preHandler: [
      webAuth('updateFoodCampaign'),
      validate(FoodCampaignValidation.idValidation),
    ],
    handler: FoodCampaignController.update,
  });
  route({
    method: 'GET',
    url: '/food_campaign/detail/:id',
    preHandler: [
      webAuth('campaignDetail'),
      validate(FoodCampaignValidation.detailValidation),
    ],
    handler: FoodCampaignController.detail,
  });
  // Food Campaign Routes //

  // Media Routes //
  route({
    method: 'GET',
    url: '/medias/getAll',
    preHandler: [webAuth('getMedias')],
    handler: MediaController.get,
  });
  route({
    method: 'GET',
    url: '/medias/getMediaList',
    preHandler: [webAuth('getMediaList')],
    handler: MediaController.getMediaListAdmin,
  });
  // Media Routes //

  // Subscriber Routes //
  route({
    method: 'POST',
    url: '/subscriber/save',
    preHandler: [
      webAuth('createSubscriber'),
      validate(SubscriberValidation.createSubscriber),
    ],
    handler: SubscriberController.create,
  });
  route({
    method: 'GET',
    url: '/subscriber/getAll',
    preHandler: [
      webAuth('getSubscriberList'),
      validate(SubscriberValidation.allValidation),
    ],
    handler: SubscriberController.get,
  });
  route({
    method: 'POST',
    url: '/subscriber/extend_dates',
    preHandler: [
      webAuth('extendSubscription'),
      validate(SubscriberValidation.extendValidation),
    ],
    handler: SubscriberController.extendSubscriptionDate,
  });
  // Subscriber Routes //

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
    url: '/addons/getAll',
    preHandler: [
      webAuth('getAllAddons'),
      validate(AddonsValidation.allValidation),
    ],
    handler: AddonsController.get,
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

  // Foods Routes //
  route({
    method: 'GET',
    url: '/foods/getAll',
    preHandler: [
      webAuth('getAllFoods'),
      validate(FoodValidation.allValidation),
    ],
    handler: FoodController.adminFoodList,
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
    method: 'DELETE',
    url: '/foods/delete/:foodId',
    preHandler: [
      webAuth('deleteFood'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.drop,
  });
  route({
    method: 'GET',
    url: '/foods/getFoodInfo/:foodId',
    preHandler: [
      webAuth('getFoodDetails'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.getFoodInfoForAdmin,
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
    method: 'GET',
    url: '/food/getRestaurantByCityId/:cityId',
    preHandler: [
      webAuth('createFood'),
      validate(RestaurantCampaignValidation.cityIdValidation),
    ],
    handler: RestaurantCampaignController.getRestaurantByCityId,
  });
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
    url: '/food/getFoodsByCity/:cityId',
    preHandler: [
      webAuth('getFoodsByCity'),
      validate(FoodValidation.cityValidation),
    ],
    handler: FoodController.getFoodByCity,
  });
  route({
    method: 'GET',
    url: '/foods/detail/:foodId',
    preHandler: [
      webAuth('getFoodDetails'),
      validate(FoodValidation.idValidation),
    ],
    handler: FoodController.adminFoodDetail,
  });
  // Foods Routes //

  // Business Settings Routes //
  route({
    method: 'POST',
    url: '/business_settings/save',
    preHandler: [
      webAuth('createBusinessSettings'),
      validate(BusinessSettingValidation.createSettings),
    ],
    handler: BusinessSettingController.create,
  });
  route({
    method: 'PATCH',
    url: '/business_settings/update/:businessId',
    preHandler: [
      webAuth('updateBusinessSettings'),
      validate(BusinessSettingValidation.idValidation),
    ],
    handler: BusinessSettingController.update,
  });
  route({
    method: 'GET',
    url: '/business_settings/get',
    preHandler: [webAuth('getSettings')],
    handler: BusinessSettingController.get,
  });
  // Business Settings Routes //

  // Social Sign In Route //
  route({
    method: 'GET',
    url: '/social_signin/getList',
    preHandler: [webAuth('getSocialSignIn')],
    handler: SocialSignInController.getList,
  });
  route({
    method: 'POST',
    url: '/social_signin/save',
    preHandler: [
      webAuth('createSocialSignIn'),
      validate(SocialSignInValidation.createOrUpdateSocialSignin),
    ],
    handler: SocialSignInController.create,
  });
  route({
    method: 'PATCH',
    url: '/social_signin/update/:id',
    preHandler: [
      webAuth('updateSocialSignIn'),
      validate(SocialSignInValidation.idValidation),
    ],
    handler: SocialSignInController.update,
  });
  // Social Sign In Route //

  // Order Settings Routes //
  route({
    method: 'POST',
    url: '/order_settings/save',
    preHandler: [
      webAuth('createOrderSettings'),
      validate(OrderSettingsValidation.createOrderSettings),
    ],
    handler: OrderSettingsController.create,
  });
  route({
    method: 'GET',
    url: '/order_settings/get',
    preHandler: [webAuth('getOrderSettingsInfo')],
    handler: OrderSettingsController.get,
  });
  route({
    method: 'PATCH',
    url: '/order_settings/update/:settingId',
    preHandler: [
      webAuth('updateOrderSettings'),
      validate(OrderSettingsValidation.idValidation),
    ],
    handler: OrderSettingsController.update,
  });
  // Order Settings Routes //

  // Order Cancellation Reason Routes //
  route({
    method: 'GET',
    url: '/order_cancel_reason/getAll',
    preHandler: [
      webAuth('getOrderCancelReason'),
      validate(OrderCancellationReasonValidation.allValidation),
    ],
    handler: OrderCancellationReasonController.get,
  });
  route({
    method: 'POST',
    url: '/order_cancel_reason/save',
    preHandler: [
      webAuth('createOrderCancelReason'),
      validate(OrderCancellationReasonValidation.createCancellationReason),
    ],
    handler: OrderCancellationReasonController.create,
  });
  route({
    method: 'PATCH',
    url: '/order_cancel_reason/update/:reasonId',
    preHandler: [
      webAuth('updateOrderCancelReason'),
      validate(OrderCancellationReasonValidation.idValidation),
    ],
    handler: OrderCancellationReasonController.update,
  });
  route({
    method: 'DELETE',
    url: '/order_cancel_reason/delete/:reasonId',
    preHandler: [
      webAuth('deletetOrderCancelReason'),
      validate(OrderCancellationReasonValidation.idValidation),
    ],
    handler: OrderCancellationReasonController.drop,
  });
  // Order Cancellation Reason Routes //

  // Refund Request Reason Routes //
  route({
    method: 'GET',
    url: '/refund_request_reason/getAll',
    preHandler: [
      webAuth('getRefundRequestReason'),
      validate(RefundRequestReasonValidation.allValidation),
    ],
    handler: RefundRequestReasonController.get,
  });
  route({
    method: 'POST',
    url: '/refund_request_reason/save',
    preHandler: [
      webAuth('createRefundRequestReason'),
      validate(RefundRequestReasonValidation.createRefundRequestReason),
    ],
    handler: RefundRequestReasonController.create,
  });
  route({
    method: 'PATCH',
    url: '/refund_request_reason/update/:reasonId',
    preHandler: [
      webAuth('updateRefundRequestReason'),
      validate(RefundRequestReasonValidation.idValidation),
    ],
    handler: RefundRequestReasonController.update,
  });
  route({
    method: 'DELETE',
    url: '/refund_request_reason/delete/:reasonId',
    preHandler: [
      webAuth('deleteRefundRequestReason'),
      validate(RefundRequestReasonValidation.idValidation),
    ],
    handler: RefundRequestReasonController.drop,
  });
  // Refund Request Reason Routes //

  // User Settings Routes //
  route({
    method: 'GET',
    url: '/user_settings/get',
    preHandler: [webAuth('getUserSettings')],
    handler: UserSettingsController.get,
  });
  route({
    method: 'POST',
    url: '/user_settings/save',
    preHandler: [
      webAuth('createUserSettings'),
      validate(UserSettingsValidation.createSettings),
    ],
    handler: UserSettingsController.create,
  });
  route({
    method: 'PATCH',
    url: '/user_settings/update/:settingId',
    preHandler: [
      webAuth('updateUserSettings'),
      validate(UserSettingsValidation.idValidation),
    ],
    handler: UserSettingsController.update,
  });
  // User Settings Routes //

  // Restaurant Settings Routes //
  route({
    method: 'GET',
    url: '/restaurant_settings/get',
    preHandler: [webAuth('getRestaurantSettings')],
    handler: RestaurantSettingsController.get,
  });
  route({
    method: 'POST',
    url: '/restaurant_settings/save',
    preHandler: [
      webAuth('createRestaurantSettings'),
      validate(RestaurantSettingsValidation.createSettings),
    ],
    handler: RestaurantSettingsController.create,
  });
  route({
    method: 'PATCH',
    url: '/restaurant_settings/update/:settingId',
    preHandler: [
      webAuth('updateRestaurantSettings'),
      validate(RestaurantSettingsValidation.idValidation),
    ],
    handler: RestaurantSettingsController.update,
  });
  // Restaurant Settings Routes //

  // Driver Settings Routes //
  route({
    method: 'GET',
    url: '/driver_settings/get',
    preHandler: [webAuth('getDriverSettings')],
    handler: DriverSettingsController.get,
  });
  route({
    method: 'POST',
    url: '/driver_settings/save',
    preHandler: [
      webAuth('createDriverSettings'),
      validate(DriverSettingsValidation.createSettings),
    ],
    handler: DriverSettingsController.create,
  });
  route({
    method: 'PATCH',
    url: '/driver_settings/update/:settingId',
    preHandler: [
      webAuth('updateDriverSettings'),
      validate(DriverSettingsValidation.idValidation),
    ],
    handler: DriverSettingsController.update,
  });
  // Driver Settings Routes //

  // Disbursement Setting Routes //
  route({
    method: 'GET',
    url: '/disbursement_settings/get',
    preHandler: [webAuth('getDisbursementSettings')],
    handler: DisbursementController.get,
  });
  route({
    method: 'POST',
    url: '/disbursement_settings/save',
    preHandler: [
      webAuth('createDisbursementSettings'),
      validate(DisbursementValidation.createDisbursement),
    ],
    handler: DisbursementController.create,
  });
  route({
    method: 'PATCH',
    url: '/disbursement_settings/update/:disbursementId',
    preHandler: [
      webAuth('updateDisbursementSettings'),
      validate(DisbursementValidation.idValidation),
    ],
    handler: DisbursementController.update,
  });
  // Disbursement Setting Routes //

  // App Page Route //
  route({
    method: 'GET',
    url: '/app_pages/get/:slug',
    preHandler: [
      webAuth('getPageInfo'),
      validate(AppPageValidation.idValidation),
    ],
    handler: AppPageController.get,
  });
  route({
    method: 'POST',
    url: '/app_pages/save',
    preHandler: [
      webAuth('createPageInfo'),
      validate(AppPageValidation.createOrUpdatePage),
    ],
    handler: AppPageController.create,
  });
  route({
    method: 'PATCH',
    url: '/app_pages/update/:slug',
    preHandler: [
      webAuth('updatePageInfo'),
      validate(AppPageValidation.idValidation),
    ],
    handler: AppPageController.update,
  });
  // App Page Route //

  // Restaurant Campaign Routes //
  route({
    method: 'GET',
    url: '/restaurant_campaign_request/get/:campaignId',
    preHandler: [
      webAuth('getRestaurantCampaignRequest'),
      validate(RestaurantCampaignRequestValidation.idValidation),
    ],
    handler: RestaurantCampaignRequestController.get,
  });

  route({
    method: 'GET',
    url: '/restaurant_campaign_request/accept/:campaignId/:restaurantId',
    preHandler: [
      webAuth('acceptRestaurantCampaign'),
      validate(RestaurantCampaignValidation.leaveAndJoinCampaignValidation),
    ],
    handler: RestaurantCampaignController.joinCampaign,
  });

  route({
    method: 'DELETE',
    url: '/restaurant_campaign_request/reject/:campaignId',
    preHandler: [
      webAuth('rejectRestaurantCampaign'),
      validate(RestaurantCampaignRequestValidation.idValidation),
    ],
    handler: RestaurantCampaignRequestController.drop,
  });
  // Restaurant Campaign Routes //

  // Food Campaign Request Routes //
  route({
    method: 'GET',
    url: '/food_campaign_request/get/:campaignId',
    preHandler: [
      webAuth('getFoodCampaignRequest'),
      validate(FoodCampaignRequestValidation.idValidation),
    ],
    handler: FoodCampaignRequestController.get,
  });
  route({
    method: 'DELETE',
    url: '/food_campaign_request/reject/:campaignId',
    preHandler: [
      webAuth('rejectFoodCampaignRequest'),
      validate(FoodCampaignRequestValidation.idValidation),
    ],
    handler: FoodCampaignRequestController.drop,
  });
  route({
    method: 'GET',
    url: '/food_campaign_request/accept/:campaignId/:foodId',
    preHandler: [
      webAuth('acceptFoodCampaignRequest'),
      validate(FoodCampaignValidation.leaveAndJoinCampaignIdValidation),
    ],
    handler: FoodCampaignController.joinCampaign,
  });
  // Food Campaign Request Routes //

  // Banners Routes //
  route({
    method: 'GET',
    url: '/banners/getAll',
    preHandler: [
      webAuth('getAllBanner'),
      validate(BannersValidation.allValidation),
    ],
    handler: BannersController.get,
  });
  route({
    method: 'POST',
    url: '/banners/save',
    preHandler: [
      webAuth('createBanner'),
      validate(BannersValidation.createBanner),
    ],
    handler: BannersController.create,
  });
  route({
    method: 'PATCH',
    url: '/banners/update/:bannerId',
    preHandler: [
      webAuth('updateBanner'),
      validate(BannersValidation.idValidation),
    ],
    handler: BannersController.update,
  });
  route({
    method: 'PATCH',
    url: '/banners/updateStatus/:bannerId',
    preHandler: [
      webAuth('updateBanner'),
      validate(BannersValidation.idValidation),
    ],
    handler: BannersController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/banners/delete/:bannerId',
    preHandler: [
      webAuth('deleteBanner'),
      validate(BannersValidation.idValidation),
    ],
    handler: BannersController.drop,
  });
  // Banners Routes //

  // App Web Settings Routes //
  route({
    method: 'GET',
    url: '/app_web_settings/get',
    preHandler: [webAuth('getAppWebSettings')],
    handler: AppWebSettingController.get,
  });
  route({
    method: 'POST',
    url: '/app_web_settings/save',
    preHandler: [
      webAuth('createOrUpdateAppWebSettings'),
      validate(AppWebSettingValidation.createOrUpdateAppWebSettings),
    ],
    handler: AppWebSettingController.create,
  });
  route({
    method: 'PATCH',
    url: '/app_web_settings/update/:settingId',
    preHandler: [
      webAuth('createOrUpdateAppWebSettings'),
      validate(AppWebSettingValidation.createOrUpdateAppWebSettings),
    ],
    handler: AppWebSettingController.update,
  });
  // App Web Settings Routes //

  // Email Config Routes //
  route({
    method: 'GET',
    url: '/email_config/get',
    preHandler: [webAuth('getEmailConfig')],
    handler: EmailConfigController.get,
  });
  route({
    method: 'POST',
    url: '/email_config/save',
    preHandler: [
      webAuth('createOrUpdateEmailConfig'),
      validate(EmailConfigValidation.createOrUpdateConfig),
    ],
    handler: EmailConfigController.create,
  });
  route({
    method: 'PATCH',
    url: '/email_config/update/:configId',
    preHandler: [
      webAuth('createOrUpdateEmailConfig'),
      validate(EmailConfigValidation.createOrUpdateConfig),
    ],
    handler: EmailConfigController.update,
  });
  route({
    method: 'GET',
    url: '/email_config/sendDemo/:email',
    preHandler: [
      webAuth('sendDemoEmail'),
      validate(EmailConfigValidation.demoValidation),
    ],
    handler: EmailConfigController.sendDemoMail,
  });
  route({
    method: 'GET',
    url: '/email_config/media_list',
    preHandler: [webAuth('getEmailConfig')],
    handler: EmailConfigController.emailMediaConfig,
  });
  route({
    method: 'PATCH',
    url: '/email_config/update_email_media',
    preHandler: [
      webAuth('createOrUpdateEmailConfig'),
      validate(EmailConfigValidation.emailMediaUrlValidation),
    ],
    handler: EmailConfigController.saveEmailMediaConfig,
  });
  // Email Config Routes //

  // Email Template Routes //
  route({
    method: 'GET',
    url: '/email_templates/:slug',
    preHandler: [
      webAuth('getEmailTemplate'),
      validate(EmailTemplateValidation.idValidation),
    ],
    handler: EmailTemplateController.get,
  });
  route({
    method: 'POST',
    url: '/email_templates/save',
    preHandler: [
      webAuth('createEmailTemplates'),
      validate(EmailTemplateValidation.createOrUpdateTemplate),
    ],
    handler: EmailTemplateController.create,
  });
  route({
    method: 'PATCH',
    url: '/email_templates/update/:slug',
    preHandler: [
      webAuth('updateEmailTemplates'),
      validate(EmailTemplateValidation.createOrUpdateTemplate),
    ],
    handler: EmailTemplateController.update,
  });
  // Email Template Routes //

  // Restaurant Food License Routes //
  route({
    method: 'GET',
    url: '/restaurant_food_license/getAll',
    preHandler: [
      webAuth('getRestaurantFoodLicense'),
      validate(RestaurantFoodLicenseValidation.allValidation),
    ],
    handler: RestaurantFoodLicenseController.get,
  });
  route({
    method: 'POST',
    url: '/restaurant_food_license/save',
    preHandler: [
      webAuth('createRestaurantFoodLicense'),
      validate(RestaurantFoodLicenseValidation.createRestaurantLicense),
    ],
    handler: RestaurantFoodLicenseController.create,
  });
  route({
    method: 'PATCH',
    url: '/restaurant_food_license/update/:licenseId',
    preHandler: [
      webAuth('updateRestaurantFoodLicense'),
      validate(RestaurantFoodLicenseValidation.idValidation),
    ],
    handler: RestaurantFoodLicenseController.update,
  });
  route({
    method: 'DELETE',
    url: '/restaurant_food_license/delete/:licenseId',
    preHandler: [
      webAuth('deleteRestaurantFoodLicense'),
      validate(RestaurantFoodLicenseValidation.idValidation),
    ],
    handler: RestaurantFoodLicenseController.drop,
  });
  // Restaurant Food License Routes //

  // Payment Config Page Route //
  route({
    method: 'GET',
    url: '/payment_config/get/:slug',
    preHandler: [
      webAuth('getPaymentConfig'),
      validate(PaymentConfigValidation.idValidation),
    ],
    handler: PaymentConfigController.get,
  });
  route({
    method: 'POST',
    url: '/payment_config/save',
    preHandler: [
      webAuth('createPaymentConfig'),
      validate(PaymentConfigValidation.createPaymentConfig),
    ],
    handler: PaymentConfigController.create,
  });
  route({
    method: 'PATCH',
    url: '/payment_config/update/:slug',
    preHandler: [
      webAuth('updatePaymentConfig'),
      validate(PaymentConfigValidation.idValidation),
    ],
    handler: PaymentConfigController.update,
  });
  // Payment Config Page Route //

  // Delivery Instrunction Routes //
  route({
    method: 'POST',
    url: '/delivery_instruction/save',
    preHandler: [
      webAuth('createDeliveryInstruction'),
      validate(DeliveryInstructionValidation.createInstrunction),
    ],
    handler: DeliveryInstructionController.create,
  });
  route({
    method: 'GET',
    url: '/delivery_instruction/get',
    preHandler: [
      webAuth('getDeliveryInstruction'),
      validate(DeliveryInstructionValidation.allValidation),
    ],
    handler: DeliveryInstructionController.get,
  });
  route({
    method: 'PATCH',
    url: '/delivery_instruction/update/:id',
    preHandler: [
      webAuth('updateDeliveryInstruction'),
      validate(DeliveryInstructionValidation.idValidation),
    ],
    handler: DeliveryInstructionController.update,
  });
  route({
    method: 'DELETE',
    url: '/delivery_instruction/delete/:id',
    preHandler: [
      webAuth('deleteDeliveryInstruction'),
      validate(DeliveryInstructionValidation.idValidation),
    ],
    handler: DeliveryInstructionController.drop,
  });
  // Delivery Instrunction Routes //

  // Delivery Gratitude Routes //
  route({
    method: 'POST',
    url: '/gratitude/save',
    preHandler: [
      webAuth('createGratitude'),
      validate(DeliveryGratitudeValidation.createGratitude),
    ],
    handler: DeliveryGratitudeController.create,
  });
  route({
    method: 'GET',
    url: '/gratitude/get',
    preHandler: [
      webAuth('getGratitude'),
      validate(DeliveryGratitudeValidation.allValidation),
    ],
    handler: DeliveryGratitudeController.get,
  });
  route({
    method: 'PATCH',
    url: '/gratitude/update/:id',
    preHandler: [
      webAuth('updateGratitude'),
      validate(DeliveryGratitudeValidation.idValidation),
    ],
    handler: DeliveryGratitudeController.update,
  });
  route({
    method: 'DELETE',
    url: '/gratitude/delete/:id',
    preHandler: [
      webAuth('deleteGratitude'),
      validate(DeliveryGratitudeValidation.idValidation),
    ],
    handler: DeliveryGratitudeController.drop,
  });
  // Delivery Gratitude Routes //

  // Coupon Routes //
  route({
    method: 'POST',
    url: '/coupon/save',
    preHandler: [
      webAuth('createCoupon'),
      validate(CouponValidation.createCoupon),
    ],
    handler: CouponController.create,
  });
  route({
    method: 'GET',
    url: '/coupon/get',
    preHandler: [
      webAuth('getCoupon'),
      validate(CouponValidation.allValidation),
    ],
    handler: CouponController.get,
  });
  route({
    method: 'GET',
    url: '/coupon/getInfo/:id',
    preHandler: [
      webAuth('getCoupon'),
      validate(CouponValidation.idValidation),
    ],
    handler: CouponController.getInfo,
  });
  route({
    method: 'PATCH',
    url: '/coupon/update/:id',
    preHandler: [
      webAuth('updateCoupon'),
      validate(CouponValidation.idValidation),
    ],
    handler: CouponController.update,
  });
  route({
    method: 'PATCH',
    url: '/coupon/updateMeta/:id',
    preHandler: [
      webAuth('updateCoupon'),
      validate(CouponValidation.idValidation),
    ],
    handler: CouponController.updateMeta,
  });
  route({
    method: 'DELETE',
    url: '/coupon/delete/:id',
    preHandler: [
      webAuth('deleteCoupon'),
      validate(CouponValidation.idValidation),
    ],
    handler: CouponController.drop,
  });
  route({
    method: 'GET',
    url: '/coupon/request',
    preHandler: [
      webAuth('getCoupon'),
      validate(CouponValidation.allValidation),
    ],
    handler: CouponController.getVendorCouponRequest,
  });
  route({
    method: 'GET',
    url: '/coupon/detail/:id',
    preHandler: [
      webAuth('getCoupon'),
      validate(CouponValidation.detailValidation),
    ],
    handler: CouponController.couponDetail,
  });
  // Coupon Routes //

  // User Routes //
  route({
    method: 'GET',
    url: '/users/search/:name',
    preHandler: [
      webAuth('searchUser'),
      validate(UserValidation.searchUser),
    ],
    handler: UserController.findUserWithName,
  });
  // User Routes //

  // Driver Incetive Routes //
  route({
    method: 'POST',
    url: '/driver_incentive/save',
    preHandler: [
      webAuth('createDriverIncentive'),
      validate(DriverIncentiveValidation.createIncentive),
    ],
    handler: DriverIncentiveController.create,
  });
  route({
    method: 'GET',
    url: '/driver_incentive/get',
    preHandler: [
      webAuth('getDriverIncentive'),
      validate(DriverIncentiveValidation.allValidation),
    ],
    handler: DriverIncentiveController.get,
  });
  route({
    method: 'PATCH',
    url: '/driver_incentive/update/:id',
    preHandler: [
      webAuth('updateDriverIncentive'),
      validate(DriverIncentiveValidation.updateIncentive),
    ],
    handler: DriverIncentiveController.update,
  });
  route({
    method: 'PATCH',
    url: '/driver_incentive/updateStatus/:id',
    preHandler: [
      webAuth('updateDriverIncentive'),
      validate(DriverIncentiveValidation.updateIncentiveStatus),
    ],
    handler: DriverIncentiveController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/driver_incentive/delete/:id',
    preHandler: [
      webAuth('deleteDriverIncentive'),
      validate(DriverIncentiveValidation.idValidation),
    ],
    handler: DriverIncentiveController.drop,
  });
  // Driver Incetive Routes //

  // Driver Offline Messages Routes //
  route({
    method: 'POST',
    url: '/driver_offline_messages/save',
    preHandler: [
      webAuth('createDriverOfflineMessage'),
      validate(DriverOfflineMessagesValidation.createOfflineMessage),
    ],
    handler: DriverOfflineMessagesController.create,
  });
  route({
    method: 'GET',
    url: '/driver_offline_messages/get',
    preHandler: [
      webAuth('getDriverOfflineMessages'),
      validate(DriverOfflineMessagesValidation.allValidation),
    ],
    handler: DriverOfflineMessagesController.get,
  });
  route({
    method: 'PATCH',
    url: '/driver_offline_messages/update/:id',
    preHandler: [
      webAuth('updateDriverOfflineMessages'),
      validate(DriverOfflineMessagesValidation.idValidation),
    ],
    handler: DriverOfflineMessagesController.update,
  });
  route({
    method: 'DELETE',
    url: '/driver_offline_messages/delete/:id',
    preHandler: [
      webAuth('deleteOfflineMessages'),
      validate(DriverOfflineMessagesValidation.idValidation),
    ],
    handler: DriverOfflineMessagesController.drop,
  });
  // Driver Offline Messages Routes //

  // Order Notification Translation Routes //
  route({
    method: 'GET',
    url: '/order_notification_translation/getBySlug/:slug',
    preHandler: [
      webAuth('getOrderNotificationTranslation'),
      validate(OrderNotificationTranslationValidation.getNotificationValidation),
    ],
    handler: OrderNotificationTranslationController.getBySlug,
  });
  route({
    method: 'POST',
    url: '/order_notification_translation/save',
    preHandler: [
      webAuth('saveOrderNotificationTranslation'),
      validate(OrderNotificationTranslationValidation.saveOrderNotificationTranslationValidation),
    ],
    handler: OrderNotificationTranslationController.createOrUpdate,
  });
  // Order Notification Translation Routes //

  // Orders Routes //
  route({
    method: 'GET',
    url: '/orders/getOrderCount',
    preHandler: [webAuth('getOrderCount')],
    handler: OrdersController.getOrderCount,
  });
  route({
    method: 'GET',
    url: '/orders/getOrderList',
    preHandler: [
      webAuth('getOrderList'),
      validate(OrdersValidation.adminOrderValidation),
    ],
    handler: OrdersController.getAdminOrderList,
  });
  route({
    method: 'GET',
    url: '/orders/getScheduleOrders',
    preHandler: [
      webAuth('getScheduleOrders'),
      validate(OrdersValidation.adminScheduleOrderValidation),
    ],
    handler: OrdersController.getAdminScheduleOrderList,
  });
  route({
    method: 'GET',
    url: '/orders/getSubscriptionOrders',
    preHandler: [
      webAuth('getSubscriptionOrders'),
      validate(OrdersValidation.adminSubscriptionOrderValidation),
    ],
    handler: OrdersController.getAdminSubscriptionOrderList,
  });
  route({
    method: 'GET',
    url: '/orders/getUnAssignedOrders',
    preHandler: [
      webAuth('getUnAssignedOrders'),
      validate(OrdersValidation.adminScheduleOrderValidation),
    ],
    handler: OrdersController.getAdminUnAssignedOrderList,
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
    url: '/orders/assignDriverOrderAdmin',
    preHandler: [
      webAuth('assignDriverOrderAdmin'),
      validate(OrdersValidation.assignDriverOrderAdminValidation),
    ],
    handler: OrdersController.assignDriverOrderAdmin,
  });
  route({
    method: 'GET',
    url: '/orders/detailAdmin/:id',
    preHandler: [
      webAuth('orderDetail'),
      validate(OrdersValidation.orderDetailAdminValidation),
    ],
    handler: OrdersController.getOrderDetailAdmin,
  });
  route({
    method: 'GET',
    url: '/orders/coupon/:id',
    preHandler: [
      webAuth('getOrderList'),
      validate(OrdersValidation.couponValidation),
    ],
    handler: OrdersController.couponOrders,
  });
  route({
    method: 'GET',
    url: '/orders/invoice/:id',
    preHandler: [
      webAuth('orderDetail'),
      validate(OrdersValidation.adminInvoiceValidation),
    ],
    handler: OrdersController.adminOrderInvoice,
  });
  // Orders Routes //

  // POS Orders Routes //
  route({
    method: 'GET',
    url: '/posOrders/list',
    preHandler: [
      webAuth('posOrderList'),
      validate(PosOrTableOrderValidation.adminOrderValidation),
    ],
    handler: PosOrTableOrderController.adminPosOrderList,
  });
  route({
    method: 'GET',
    url: '/posOrders/detail/:id',
    preHandler: [
      webAuth('posOrderDetail'),
      validate(PosOrTableOrderValidation.adminPosOrderDetailValidation),
    ],
    handler: PosOrTableOrderController.adminPosOrderDetail,
  });
  route({
    method: 'GET',
    url: '/posOrders/invoice/:id',
    preHandler: [
      webAuth('posOrderDetail'),
      validate(PosOrTableOrderValidation.orderInvoiceValidation),
    ],
    handler: PosOrTableOrderController.adminPOSOrderInvoice,
  });
  // POS Orders Routes //

  // Table Orders Routes //
  route({
    method: 'GET',
    url: '/tableOrders/list',
    preHandler: [
      webAuth('tableOrderList'),
      validate(TableOrderValidation.adminOrderValidation),
    ],
    handler: TableOrderController.adminTableOrderList,
  });
  route({
    method: 'GET',
    url: '/tableOrders/detail/:id',
    preHandler: [
      webAuth('tableOrderDetail'),
      validate(TableOrderValidation.adminTableOrderDetailValidation),
    ],
    handler: TableOrderController.adminTableOrderDetail,
  });
  route({
    method: 'GET',
    url: '/tableOrders/invoice/:id',
    preHandler: [
      webAuth('tableOrderDetail'),
      validate(TableOrderValidation.orderInvoiceValidation),
    ],
    handler: TableOrderController.adminTableOrderInvoice,
  });
  // Table Orders Routes //

  // Refund Request Routes //
  route({
    method: 'GET',
    url: '/refund_request/active',
    preHandler: [
      webAuth('getActiveRefundRequest'),
      validate(RefundRequestValidation.adminListValidation),
    ],
    handler: RefundRequestController.getActiveRefundRequest,
  });
  route({
    method: 'GET',
    url: '/refund_request/info/:requestId',
    preHandler: [
      webAuth('getRefundRequestInfo'),
      validate(RefundRequestValidation.getRefundRequestInfoValidation),
    ],
    handler: RefundRequestController.getRefundRequestInfo,
  });
  route({
    method: 'POST',
    url: '/refund_request/cancel',
    preHandler: [
      webAuth('cancelRefundRequest'),
      validate(RefundRequestValidation.cancelRefundRequestValidation),
    ],
    handler: RefundRequestController.cancelRefundRequest,
  });
  route({
    method: 'POST',
    url: '/refund_request/approve',
    preHandler: [
      webAuth('approveRefundRequest'),
      validate(RefundRequestValidation.approveRefundRequestValidation),
    ],
    handler: RefundRequestController.approveRefundRequest,
  });
  route({
    method: 'POST',
    url: '/refund_request/refundFromMerchant',
    preHandler: [
      webAuth('refundFromMerchant'),
      validate(RefundRequestValidation.refundFromMerchantValidation),
    ],
    handler: RefundRequestController.refundFromMerchant,
  });
  // Refund Request Routes //

  // Complaints Reason Routes //
  route({
    method: 'GET',
    url: '/complaints_reason/getAll',
    preHandler: [
      webAuth('getComplaintsReason'),
      validate(ComplaintsReasonValidation.allValidation),
    ],
    handler: ComplaintsReasonController.get,
  });
  route({
    method: 'POST',
    url: '/complaints_reason/save',
    preHandler: [
      webAuth('createComplaintsReason'),
      validate(ComplaintsReasonValidation.createComplaintsReason),
    ],
    handler: ComplaintsReasonController.create,
  });
  route({
    method: 'PATCH',
    url: '/complaints_reason/update/:reasonId',
    preHandler: [
      webAuth('updateComplaintsReason'),
      validate(ComplaintsReasonValidation.idValidation),
    ],
    handler: ComplaintsReasonController.update,
  });
  route({
    method: 'DELETE',
    url: '/complaints_reason/delete/:reasonId',
    preHandler: [
      webAuth('deleteComplaintsReason'),
      validate(ComplaintsReasonValidation.idValidation),
    ],
    handler: ComplaintsReasonController.drop,
  });
  // Complaints Reason Routes //

  // Complaints Routes //
  route({
    method: 'GET',
    url: '/complaints/get',
    preHandler: [
      webAuth('getComplaints'),
      validate(UserValidation.adminComplaintValidation),
    ],
    handler: ComplaintsController.get,
  });
  route({
    method: 'GET',
    url: '/restaurant_complaints/get',
    preHandler: [
      webAuth('getComplaints'),
      validate(UserValidation.adminRestaurantComplaintValidation),
    ],
    handler: RestaurantComplaintsController.get,
  });

  // SMS Provider Config Routes //
  route({
    method: 'GET',
    url: '/sms_provider/get/:slug',
    preHandler: [
      webAuth('getSmsProviderConfig'),
      validate(SmsProviderConfigValidation.idValidation),
    ],
    handler: SmsProviderConfigController.get,
  });
  route({
    method: 'POST',
    url: '/sms_provider/save',
    preHandler: [
      webAuth('createSmsProviderConfig'),
      validate(SmsProviderConfigValidation.createSMSProviderConfig),
    ],
    handler: SmsProviderConfigController.create,
  });
  route({
    method: 'PATCH',
    url: '/sms_provider/update/:slug',
    preHandler: [
      webAuth('updateSmsProviderConfig'),
      validate(SmsProviderConfigValidation.idValidation),
    ],
    handler: SmsProviderConfigController.update,
  });
  route({
    method: 'POST',
    url: '/sms_provider/demoTwilio',
    preHandler: [
      webAuth('sendDemoSMS'),
      validate(SmsProviderConfigValidation.demoValidation),
    ],
    handler: SmsProviderConfigController.sendTwilioDemoSMS,
  });
  route({
    method: 'POST',
    url: '/sms_provider/demoNexmo',
    preHandler: [
      webAuth('sendDemoSMS'),
      validate(SmsProviderConfigValidation.demoValidation),
    ],
    handler: SmsProviderConfigController.sendNexmoDemoSMS,
  });
  route({
    method: 'POST',
    url: '/sms_provider/demo_sms_dot_to',
    preHandler: [
      webAuth('sendDemoSMS'),
      validate(SmsProviderConfigValidation.demoValidation),
    ],
    handler: SmsProviderConfigController.sendSMStoDemoSMS,
  });
  route({
    method: 'POST',
    url: '/sms_provider/demo_2factor',
    preHandler: [
      webAuth('sendDemoSMS'),
      validate(SmsProviderConfigValidation.demoValidation),
    ],
    handler: SmsProviderConfigController.send2FactorDemoSMS,
  });
  route({
    method: 'POST',
    url: '/sms_provider/demo_fast2sms',
    preHandler: [
      webAuth('sendDemoSMS'),
      validate(SmsProviderConfigValidation.demoValidation),
    ],
    handler: SmsProviderConfigController.sendFast2SMSDemoSMS,
  });
  // SMS Provider Config Routes //

  // Report Issue Restaurant Reason Routes //
  route({
    method: 'GET',
    url: '/report_issue/restaurant/getAll',
    preHandler: [
      webAuth('getReportIssueRestaurant'),
      validate(ReportIssueRestaurantReasonValidation.allValidation),
    ],
    handler: ReportIssueRestaurantReasonController.get,
  });
  route({
    method: 'POST',
    url: '/report_issue/restaurant/save',
    preHandler: [
      webAuth('createReportIssueRestaurant'),
      validate(ReportIssueRestaurantReasonValidation.createReportIssueRestaurantReason),
    ],
    handler: ReportIssueRestaurantReasonController.create,
  });
  route({
    method: 'PATCH',
    url: '/report_issue/restaurant/update/:reasonId',
    preHandler: [
      webAuth('updateReportIssueRestaurant'),
      validate(ReportIssueRestaurantReasonValidation.idValidation),
    ],
    handler: ReportIssueRestaurantReasonController.update,
  });
  route({
    method: 'DELETE',
    url: '/report_issue/restaurant/delete/:reasonId',
    preHandler: [
      webAuth('deleteReportIssueRestaurant'),
      validate(ReportIssueRestaurantReasonValidation.idValidation),
    ],
    handler: ReportIssueRestaurantReasonController.drop,
  });
  // Report Issue Restaurant Reason Routes //

  // Report Issue Restaurant Routes //
  route({
    method: 'GET',
    url: '/report_issue_list/restaurant/get',
    preHandler: [
      webAuth('getReportIssueRestaurantList'),
      validate(ReportIssueRestaurantReasonValidation.reportValidation),
    ],
    handler: ReportIssueRestaurantController.getReportsList,
  });
  // Report Issue Restaurant Routes //

  // Hidden Restaurant Routes //
  route({
    method: 'GET',
    url: '/hide/restaurant',
    preHandler: [
      webAuth('hiddenRestaurant'),
      validate(HideRestaurantReasonValidation.hiddenValidation),
    ],
    handler: HideRestaurantController.getHiddenRestaurantList,
  });
  // Hidden Restaurant Routes //

  // Hide Restaurant Reason Routes //
  route({
    method: 'GET',
    url: '/hide_reason/restaurant/getAll',
    preHandler: [
      webAuth('getHideRestaurantReasonList'),
      validate(HideRestaurantReasonValidation.allValidation),
    ],
    handler: HideRestaurantReasonController.get,
  });
  route({
    method: 'POST',
    url: '/hide_reason/restaurant/save',
    preHandler: [
      webAuth('createHideRestaurantReason'),
      validate(HideRestaurantReasonValidation.createHideRestaurantReason),
    ],
    handler: HideRestaurantReasonController.create,
  });
  route({
    method: 'PATCH',
    url: '/hide_reason/restaurant/update/:reasonId',
    preHandler: [
      webAuth('updateHideRestaurantReason'),
      validate(HideRestaurantReasonValidation.idValidation),
    ],
    handler: HideRestaurantReasonController.update,
  });
  route({
    method: 'DELETE',
    url: '/hide_reason/restaurant/delete/:reasonId',
    preHandler: [
      webAuth('deleteHideRestaurantReason'),
      validate(HideRestaurantReasonValidation.idValidation),
    ],
    handler: HideRestaurantReasonController.drop,
  });
  // Hide Restaurant Reason Routes //

  // Order Rating Message Routes //
  route({
    method: 'GET',
    url: '/order_rating_message/getAll',
    preHandler: [
      webAuth('getOrderRatingMessages'),
      validate(OrderRatingMessageValidation.allValidation),
    ],
    handler: OrderRatingMessageController.get,
  });
  route({
    method: 'POST',
    url: '/order_rating_message/save',
    preHandler: [
      webAuth('createOrderRatingMessage'),
      validate(OrderRatingMessageValidation.createRatingMessage),
    ],
    handler: OrderRatingMessageController.create,
  });
  route({
    method: 'PATCH',
    url: '/order_rating_message/update/:messageId',
    preHandler: [
      webAuth('updateOrderRatingMessage'),
      validate(OrderRatingMessageValidation.idValidation),
    ],
    handler: OrderRatingMessageController.update,
  });
  route({
    method: 'DELETE',
    url: '/order_rating_message/delete/:messageId',
    preHandler: [
      webAuth('deleteOrderRatingMessage'),
      validate(OrderRatingMessageValidation.idValidation),
    ],
    handler: OrderRatingMessageController.drop,
  });
  // Order Rating Message Routes //

  // Restaurant Notice Routes //
  route({
    method: 'GET',
    url: '/restaurant/notice/getAll',
    preHandler: [
      webAuth('getRestaurantNotice'),
      validate(RestaurantNoticeValidation.allValidation),
    ],
    handler: RestaurantNoticeController.get,
  });
  route({
    method: 'POST',
    url: '/restaurant/notice/save',
    preHandler: [
      webAuth('createRestaurantNotice'),
      validate(RestaurantNoticeValidation.createRestaurantNoticeReason),
    ],
    handler: RestaurantNoticeController.create,
  });
  route({
    method: 'PATCH',
    url: '/restaurant/notice/update/:noticeId',
    preHandler: [
      webAuth('updateRestaurantNotice'),
      validate(RestaurantNoticeValidation.idValidation),
    ],
    handler: RestaurantNoticeController.update,
  });
  route({
    method: 'DELETE',
    url: '/restaurant/notice/delete/:noticeId',
    preHandler: [
      webAuth('deleteRestaurantNotice'),
      validate(RestaurantNoticeValidation.idValidation),
    ],
    handler: RestaurantNoticeController.drop,
  });
  // Restaurant Notice Routes //

  // Subscription Tiffin Package Routes //
  route({
    method: 'GET',
    url: '/tiffin_packages/getList',
    preHandler: [
      webAuth('getTiffinPackages'),
      validate(SubscriptionTiffinPackageValidation.allValidation),
    ],
    handler: SubscriptionTiffinPackageController.getSubscriptionPackageListAdmin,
  });
  route({
    method: 'PATCH',
    url: '/tiffin_packages/updateStatus/:id',
    preHandler: [
      webAuth('updatePackageStatus'),
      validate(SubscriptionTiffinPackageValidation.updateAdminStatusValidation),
    ],
    handler: SubscriptionTiffinPackageController.updatePackageStatus,
  });
  route({
    method: 'GET',
    url: '/tiffin_packages/foods/:restaurant',
    preHandler: [
      webAuth('getTiffinPackageFoods'),
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
    method: 'DELETE',
    url: '/tiffin_packages/delete/:id',
    preHandler: [
      webAuth('deleteTiffinPackage'),
      validate(SubscriptionTiffinPackageValidation.deleteValidation),
    ],
    handler: SubscriptionTiffinPackageController.drop,
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
    method: 'POST',
    url: '/tiffin_packages/adminTiffinSubscriptionPurchased/',
    preHandler: [
      webAuth('adminTiffinSubscriptionPurchased'),
      validate(UserPurchasedTiffinSubscriptionValidation.purchasedSubscriptionListAdminValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.getPurchaseListForAdmin,
  });
  route({
    method: 'GET',
    url: '/tiffin_packages/getTiffinSubscriptionPurchaseDetail/:id',
    preHandler: [
      webAuth('getTiffinSubscriptionPurchaseDetail'),
      validate(UserPurchasedTiffinSubscriptionValidation.purchaseDetailValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.getPurchaseDetailAdmin,
  });
  // Subscription Tiffin Package Routes //

  // Cron Job Scheduler Controller Routes //
  route({
    method: 'GET',
    url: '/cronScheduler/start',
    preHandler: [webAuth('startScheduler')],
    handler: CronJobSchedulerController.startScheduler,
  });
  route({
    method: 'GET',
    url: '/cronScheduler/stop',
    preHandler: [webAuth('stopScheduler')],
    handler: CronJobSchedulerController.stopScheduler,
  });
  route({
    method: 'GET',
    url: '/cronScheduler/getInfo',
    preHandler: [webAuth('getSchedulerInfo')],
    handler: CronJobSchedulerController.getSchedulerInfo,
  });
  // Cron Job Scheduler Controller Routes //

  // Tiffin Subscription Cancellation Reason Routes //
  route({
    method: 'GET',
    url: '/tiffin_subscription_cancel_reason/getAll',
    preHandler: [
      webAuth('getTiffinSubscriptionCancelReason'),
      validate(TiffinSubscriptionCancellationReasonValidation.allValidation),
    ],
    handler: TiffinSubscriptionCancellationReasonController.get,
  });
  route({
    method: 'POST',
    url: '/tiffin_subscription_cancel_reason/save',
    preHandler: [
      webAuth('createTiffinSubscriptionCancelReason'),
      validate(TiffinSubscriptionCancellationReasonValidation.createCancellationReason),
    ],
    handler: TiffinSubscriptionCancellationReasonController.create,
  });
  route({
    method: 'PATCH',
    url: '/tiffin_subscription_cancel_reason/update/:reasonId',
    preHandler: [
      webAuth('updateTiffinSubscriptionCancelReason'),
      validate(TiffinSubscriptionCancellationReasonValidation.idValidation),
    ],
    handler: TiffinSubscriptionCancellationReasonController.update,
  });
  route({
    method: 'DELETE',
    url: '/tiffin_subscription_cancel_reason/delete/:reasonId',
    preHandler: [
      webAuth('deleteTiffinSubscriptionCancelReason'),
      validate(TiffinSubscriptionCancellationReasonValidation.idValidation),
    ],
    handler: TiffinSubscriptionCancellationReasonController.drop,
  });
  // Tiffin Subscription Cancellation Reason Routes //

  // Tiffin Subscription Refund Request Reason Routes //
  route({
    method: 'GET',
    url: '/tiffin_subscription_refund_request_reason/getAll',
    preHandler: [
      webAuth('getTiffinSubscriptionRefundRequestReason'),
      validate(TiffinSubscriptionRefundRequestReasonValidation.allValidation),
    ],
    handler: TiffinSubscriptionRefundRequestReasonController.get,
  });
  route({
    method: 'POST',
    url: '/tiffin_subscription_refund_request_reason/save',
    preHandler: [
      webAuth('createTiffinSubscriptionRefundRequestReason'),
      validate(TiffinSubscriptionRefundRequestReasonValidation.createRefundRequestReason),
    ],
    handler: TiffinSubscriptionRefundRequestReasonController.create,
  });
  route({
    method: 'PATCH',
    url: '/tiffin_subscription_refund_request_reason/update/:reasonId',
    preHandler: [
      webAuth('updateTiffinSubscriptionRefundRequestReason'),
      validate(TiffinSubscriptionRefundRequestReasonValidation.idValidation),
    ],
    handler: TiffinSubscriptionRefundRequestReasonController.update,
  });
  route({
    method: 'DELETE',
    url: '/tiffin_subscription_refund_request_reason/delete/:reasonId',
    preHandler: [
      webAuth('deleteTiffinSubscriptionRefundRequestReason'),
      validate(TiffinSubscriptionRefundRequestReasonValidation.idValidation),
    ],
    handler: TiffinSubscriptionRefundRequestReasonController.drop,
  });
  // Tiffin Subscription Refund Request Reason Routes //

  // Tiffin Subscription Refund Request Routes //
  route({
    method: 'GET',
    url: '/tiffin_subscription_refund_request/active',
    preHandler: [
      webAuth('getActiveRefundRequest'),
      validate(TiffinSubscriptionRefundRequestValidation.adminListValidation),
    ],
    handler: TiffinSubscriptionRefundRequestController.getActiveRefundRequest,
  });
  route({
    method: 'GET',
    url: '/tiffin_subscription_refund_request/info/:requestId',
    preHandler: [
      webAuth('getTiffinSubscriptionRefundRequestInfo'),
      validate(
      TiffinSubscriptionRefundRequestValidation.getTiffinSubscriptionRefundRequestInfoValidation
    ),
    ],
    handler: TiffinSubscriptionRefundRequestController.getTiffinSubscriptionRefundRequestInfo,
  });
  route({
    method: 'POST',
    url: '/tiffin_subscription_refund_request/cancel',
    preHandler: [
      webAuth('cancelTiffinSubscriptionRefundRequest'),
      validate(TiffinSubscriptionRefundRequestValidation.cancelRefundRequestValidation),
    ],
    handler: TiffinSubscriptionRefundRequestController.cancelRefundRequest,
  });
  route({
    method: 'POST',
    url: '/tiffin_subscription_refund_request/refundFromMerchant',
    preHandler: [
      webAuth('refundTiffinSubscriptionFromMerchant'),
      validate(TiffinSubscriptionRefundRequestValidation.refundFromMerchantValidation),
    ],
    handler: TiffinSubscriptionRefundRequestController.refundFromMerchant,
  });
  route({
    method: 'POST',
    url: '/tiffin_subscription_refund_request/approve',
    preHandler: [
      webAuth('approveTiffinSubscriptionRefundRequest'),
      validate(TiffinSubscriptionRefundRequestValidation.approveRefundRequestValidation),
    ],
    handler: TiffinSubscriptionRefundRequestController.approveRefundRequest,
  });
  // Tiffin Subscription Refund Request Routes //

  // Dining Settings Routes //
  route({
    method: 'GET',
    url: '/dining_settings/get',
    preHandler: [webAuth('getDiningSettings')],
    handler: DiningSettingController.get,
  });
  route({
    method: 'POST',
    url: '/dining_settings/save',
    preHandler: [
      webAuth('createOrUpdateDiningSettings'),
      validate(DiningSettingValidation.createOrUpdateDiningSettings),
    ],
    handler: DiningSettingController.create,
  });
  route({
    method: 'PATCH',
    url: '/dining_settings/update/:settingId',
    preHandler: [
      webAuth('createOrUpdateDiningSettings'),
      validate(DiningSettingValidation.createOrUpdateDiningSettings),
    ],
    handler: DiningSettingController.update,
  });
  // Dining Settings Routes //

  // Dining Cancellation Reason Routes //
  route({
    method: 'GET',
    url: '/dining_cancel_reason/getAll',
    preHandler: [
      webAuth('getDiningCancelReason'),
      validate(DiningCancellationReasonValidation.allValidation),
    ],
    handler: DiningCancellationReasonController.get,
  });
  route({
    method: 'POST',
    url: '/dining_cancel_reason/save',
    preHandler: [
      webAuth('createDiningCancelReason'),
      validate(DiningCancellationReasonValidation.createCancellationReason),
    ],
    handler: DiningCancellationReasonController.create,
  });
  route({
    method: 'PATCH',
    url: '/dining_cancel_reason/update/:reasonId',
    preHandler: [
      webAuth('updateDiningCancelReason'),
      validate(DiningCancellationReasonValidation.idValidation),
    ],
    handler: DiningCancellationReasonController.update,
  });
  route({
    method: 'DELETE',
    url: '/dining_cancel_reason/delete/:reasonId',
    preHandler: [
      webAuth('deletetDiningCancelReason'),
      validate(DiningCancellationReasonValidation.idValidation),
    ],
    handler: DiningCancellationReasonController.drop,
  });
  // Dining Cancellation Reason Routes //

  // Dining Category Routes //
  route({
    method: 'POST',
    url: '/dining_category/save',
    preHandler: [
      webAuth('createDiningCategory'),
      validate(DiningCategoryValidation.createCategory),
    ],
    handler: DiningCategoryController.create,
  });
  route({
    method: 'GET',
    url: '/dining_category/getAll',
    preHandler: [
      webAuth('getDiningCategories'),
      validate(DiningCategoryValidation.allValidation),
    ],
    handler: DiningCategoryController.get,
  });
  route({
    method: 'PATCH',
    url: '/dining_category/update/:categoryId',
    preHandler: [
      webAuth('updateDiningCategory'),
      validate(DiningCategoryValidation.idValidation),
    ],
    handler: DiningCategoryController.update,
  });
  route({
    method: 'DELETE',
    url: '/dining_category/delete/:categoryId',
    preHandler: [
      webAuth('deleteDiningCategory'),
      validate(DiningCategoryValidation.idValidation),
    ],
    handler: DiningCategoryController.drop,
  });
  // Dining Category Routes //

  // Dining Notice Routes //
  route({
    method: 'GET',
    url: '/dining/notice/getAll',
    preHandler: [
      webAuth('getDiningNotice'),
      validate(DiningNoticeValidation.allValidation),
    ],
    handler: DiningNoticeController.get,
  });
  route({
    method: 'POST',
    url: '/dining/notice/save',
    preHandler: [
      webAuth('createDiningNotice'),
      validate(DiningNoticeValidation.createDiningNoticeReason),
    ],
    handler: DiningNoticeController.create,
  });
  route({
    method: 'PATCH',
    url: '/dining/notice/update/:noticeId',
    preHandler: [
      webAuth('updateDiningNotice'),
      validate(DiningNoticeValidation.idValidation),
    ],
    handler: DiningNoticeController.update,
  });
  route({
    method: 'DELETE',
    url: '/dining/notice/delete/:noticeId',
    preHandler: [
      webAuth('deleteDiningNotice'),
      validate(DiningNoticeValidation.idValidation),
    ],
    handler: DiningNoticeController.drop,
  });
  // Dining Notice Routes //

  // Dining Campaign Routes //
  route({
    method: 'POST',
    url: '/dining_campaign/save',
    preHandler: [
      webAuth('createDiningCampaign'),
      validate(DiningCampaignValidation.createDiningCampaignValidation),
    ],
    handler: DiningCampaignController.create,
  });
  route({
    method: 'GET',
    url: '/dining_campaign/getAll',
    preHandler: [
      webAuth('getDiningCampaigns'),
      validate(DiningCampaignValidation.allValidation),
    ],
    handler: DiningCampaignController.get,
  });
  route({
    method: 'PATCH',
    url: '/dining_campaign/updateStatus/:campaignId',
    preHandler: [
      webAuth('updateDiningCampaign'),
      validate(DiningCampaignValidation.idValidation),
    ],
    handler: DiningCampaignController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/dining_campaign/delete/:campaignId',
    preHandler: [
      webAuth('deleteDiningCampaign'),
      validate(DiningCampaignValidation.idValidation),
    ],
    handler: DiningCampaignController.drop,
  });
  route({
    method: 'GET',
    url: '/dining_campaign/getById/:campaignId',
    preHandler: [
      webAuth('getDiningCampaignById'),
      validate(DiningCampaignValidation.idValidation),
    ],
    handler: DiningCampaignController.getById,
  });
  route({
    method: 'PATCH',
    url: '/dining_campaign/update/:campaignId',
    preHandler: [
      webAuth('updateDiningCampaign'),
      validate(DiningCampaignValidation.idValidation),
    ],
    handler: DiningCampaignController.update,
  });

  route({
    method: 'GET',
    url: '/dining_campaign_request/get/:campaignId',
    preHandler: [
      webAuth('getDiningCampaignRequest'),
      validate(DiningCampaignRequestValidation.idValidation),
    ],
    handler: DiningCampaignRequestController.get,
  });
  route({
    method: 'GET',
    url: '/dining_campaign_request/accept/:campaignId/:restaurantId',
    preHandler: [
      webAuth('acceptDiningCampaign'),
      validate(DiningCampaignValidation.leaveAndJoinCampaignValidation),
    ],
    handler: DiningCampaignController.joinCampaign,
  });
  route({
    method: 'DELETE',
    url: '/dining_campaign_request/reject/:campaignId',
    preHandler: [
      webAuth('rejectDiningCampaign'),
      validate(DiningCampaignRequestValidation.idValidation),
    ],
    handler: DiningCampaignRequestController.drop,
  });
  route({
    method: 'GET',
    url: '/dining_campaign/detail/:id',
    preHandler: [
      webAuth('campaignDetail'),
      validate(DiningCampaignValidation.detailValidation),
    ],
    handler: DiningCampaignController.detail,
  });
  // Dining Campaign Routes //

  // Restaurant Facilities Routes //
  route({
    method: 'GET',
    url: '/restaurant/facilities/getAll',
    preHandler: [
      webAuth('getRestaurantFacility'),
      validate(RestaurantFacilitiesValidation.allValidation),
    ],
    handler: RestaurantFacilitiesController.get,
  });
  route({
    method: 'POST',
    url: '/restaurant/facilities/save',
    preHandler: [
      webAuth('createRestaurantFacility'),
      validate(RestaurantFacilitiesValidation.createRestaurantFacility),
    ],
    handler: RestaurantFacilitiesController.create,
  });
  route({
    method: 'PATCH',
    url: '/restaurant/facilities/update/:id',
    preHandler: [
      webAuth('updateRestaurantFacility'),
      validate(RestaurantFacilitiesValidation.idValidation),
    ],
    handler: RestaurantFacilitiesController.update,
  });
  route({
    method: 'DELETE',
    url: '/restaurant/facilities/delete/:id',
    preHandler: [
      webAuth('deleteRestaurantFacility'),
      validate(RestaurantFacilitiesValidation.idValidation),
    ],
    handler: RestaurantFacilitiesController.drop,
  });
  // Restaurant Facilities Routes //

  // Dining Coupon Routes //
  route({
    method: 'POST',
    url: '/dining_coupon/save',
    preHandler: [
      webAuth('createDiningCoupon'),
      validate(DiningCouponValidation.createCoupon),
    ],
    handler: DiningCouponController.create,
  });
  route({
    method: 'GET',
    url: '/dining_coupon/get',
    preHandler: [
      webAuth('getDiningCoupon'),
      validate(DiningCouponValidation.allValidation),
    ],
    handler: DiningCouponController.get,
  });
  route({
    method: 'PATCH',
    url: '/dining_coupon/updateMeta/:id',
    preHandler: [
      webAuth('updateDiningCoupon'),
      validate(DiningCouponValidation.idValidation),
    ],
    handler: DiningCouponController.updateMeta,
  });
  route({
    method: 'DELETE',
    url: '/dining_coupon/delete/:id',
    preHandler: [
      webAuth('deleteDiningCoupon'),
      validate(DiningCouponValidation.idValidation),
    ],
    handler: DiningCouponController.drop,
  });
  route({
    method: 'GET',
    url: '/dining_coupon/getInfo/:id',
    preHandler: [
      webAuth('getDiningCoupon'),
      validate(DiningCouponValidation.idValidation),
    ],
    handler: DiningCouponController.getInfo,
  });
  route({
    method: 'PATCH',
    url: '/dining_coupon/update/:id',
    preHandler: [
      webAuth('updateDiningCoupon'),
      validate(DiningCouponValidation.idValidation),
    ],
    handler: DiningCouponController.update,
  });
  route({
    method: 'GET',
    url: '/dining_coupon/request',
    preHandler: [
      webAuth('getDiningCoupon'),
      validate(DiningCouponValidation.allValidation),
    ],
    handler: DiningCouponController.getVendorCouponRequest,
  });
  route({
    method: 'GET',
    url: '/dining_coupon/detail/:id',
    preHandler: [
      webAuth('getDiningCoupon'),
      validate(DiningCouponValidation.detailValidation),
    ],
    handler: DiningCouponController.couponDetail,
  });
  // Dining Coupon Routes //

  // Dining Booking Refund Request Reason Routes //
  route({
    method: 'GET',
    url: '/dining_booking_refund_request_reason/getAll',
    preHandler: [
      webAuth('getDiningBookingRefundRequestReason'),
      validate(DiningBookingRefundRequestReasonValidation.allValidation),
    ],
    handler: DiningBookingRefundRequestReasonController.get,
  });
  route({
    method: 'POST',
    url: '/dining_booking_refund_request_reason/save',
    preHandler: [
      webAuth('createDiningBookingRefundRequestReason'),
      validate(DiningBookingRefundRequestReasonValidation.createRefundRequestReason),
    ],
    handler: DiningBookingRefundRequestReasonController.create,
  });
  route({
    method: 'PATCH',
    url: '/dining_booking_refund_request_reason/update/:reasonId',
    preHandler: [
      webAuth('updateDiningBookingRefundRequestReason'),
      validate(DiningBookingRefundRequestReasonValidation.idValidation),
    ],
    handler: DiningBookingRefundRequestReasonController.update,
  });
  route({
    method: 'DELETE',
    url: '/dining_booking_refund_request_reason/delete/:reasonId',
    preHandler: [
      webAuth('deleteDiningBookingRefundRequestReason'),
      validate(DiningBookingRefundRequestReasonValidation.idValidation),
    ],
    handler: DiningBookingRefundRequestReasonController.drop,
  });
  // Dining Booking Refund Request Reason Routes //

  // Dining Refund Request Routes //
  route({
    method: 'GET',
    url: '/dining_booking_refund_request/active',
    preHandler: [
      webAuth('getActiveDiningBookingRefundRequest'),
      validate(DiningBookingRefundRequestValidation.adminListValidation),
    ],
    handler: DiningBookingRefundRequestController.getActiveRefundRequest,
  });
  route({
    method: 'GET',
    url: '/dining_booking_refund_request/info/:requestId',
    preHandler: [
      webAuth('getDiningBookingRefundRequestInfo'),
      validate(DiningBookingRefundRequestValidation.getRefundRequestInfoValidation),
    ],
    handler: DiningBookingRefundRequestController.getRefundRequestInfo,
  });
  route({
    method: 'POST',
    url: '/dining_booking_refund_request/cancel',
    preHandler: [
      webAuth('cancelDiningBookingRefundRequest'),
      validate(DiningBookingRefundRequestValidation.cancelRefundRequestValidation),
    ],
    handler: DiningBookingRefundRequestController.cancelRefundRequest,
  });
  route({
    method: 'POST',
    url: '/dining_booking_refund_request/refundFromMerchant',
    preHandler: [
      webAuth('refundDiningBookingFromMerchant'),
      validate(DiningBookingRefundRequestValidation.refundFromMerchantValidation),
    ],
    handler: DiningBookingRefundRequestController.refundFromMerchant,
  });
  route({
    method: 'POST',
    url: '/dining_booking_refund_request/approve',
    preHandler: [
      webAuth('approveDiningBookingRefundRequest'),
      validate(DiningBookingRefundRequestValidation.approveRefundRequestValidation),
    ],
    handler: DiningBookingRefundRequestController.approveRefundRequest,
  });
  // Dining Refund Request Routes //

  /// Dining Booking Routes ///
  route({
    method: 'GET',
    url: '/dining_booking/getDiningBookingCount',
    preHandler: [webAuth('getDiningBookingCount')],
    handler: DiningBookingController.adminDiningBookingCount,
  });
  route({
    method: 'GET',
    url: '/dining_booking/getDiningBookingList',
    preHandler: [
      webAuth('getDiningBookingList'),
      validate(DiningBookingValidation.adminBookingValidation),
    ],
    handler: DiningBookingController.adminDiningBookingList,
  });
  route({
    method: 'GET',
    url: '/dining_booking/bookingInformation/:bookingId',
    preHandler: [
      webAuth('getDiningBookingInformation'),
      validate(DiningBookingValidation.bookingInformationAdminValidation),
    ],
    handler: DiningBookingController.getDiningBookingInfoAdmin,
  });
  route({
    method: 'GET',
    url: '/dining_booking/coupon/:id',
    preHandler: [
      webAuth('getDiningBookingList'),
      validate(DiningBookingValidation.couponValidation),
    ],
    handler: DiningBookingController.couponBooking,
  });
  /// Dining Booking Routes ///

  /// Feedback & Report Emergency Routes //
  route({
    method: 'GET',
    url: '/feedback/list',
    preHandler: [
      webAuth('getFeedbackList'),
      validate(FeedbackFormValidation.allValidation),
    ],
    handler: FeedbackFormController.feedbackListAdmin,
  });
  route({
    method: 'DELETE',
    url: '/feedback/delete/:id',
    preHandler: [
      webAuth('deleteFeedback'),
      validate(FeedbackFormValidation.deleteFeedbackValidation),
    ],
    handler: FeedbackFormController.drop,
  });
  route({
    method: 'PATCH',
    url: '/feedback/update/',
    preHandler: [
      webAuth('updateFeedback'),
      validate(FeedbackFormValidation.updateFeedbackValidation),
    ],
    handler: FeedbackFormController.update,
  });

  route({
    method: 'GET',
    url: '/report_emergency/list',
    preHandler: [
      webAuth('getReportEmergencyList'),
      validate(ReportEmergencyValidation.allValidation),
    ],
    handler: ReportEmergencyController.reportEmergencyListAdmin,
  });
  route({
    method: 'DELETE',
    url: '/report_emergency/delete/:id',
    preHandler: [
      webAuth('deleteReportEmergency'),
      validate(ReportEmergencyValidation.deleteReportEmergencyValidation),
    ],
    handler: ReportEmergencyController.drop,
  });
  route({
    method: 'PATCH',
    url: '/report_emergency/update/',
    preHandler: [
      webAuth('updateReportEmergency'),
      validate(ReportEmergencyValidation.updateReportEmergencyValidation),
    ],
    handler: ReportEmergencyController.update,
  });
  /// Feedback & Report Emergency Routes //

  // User Avatar Routes //
  route({
    method: 'GET',
    url: '/user_avatar/list',
    preHandler: [webAuth('getAvatarList')],
    handler: UserAvatarController.get,
  });
  route({
    method: 'POST',
    url: '/user_avatar/save',
    preHandler: [
      webAuth('saveUserAvatar'),
      validate(UserAvatarValidation.saveAvatarValidation),
    ],
    handler: UserAvatarController.create,
  });
  route({
    method: 'PATCH',
    url: '/user_avatar/updateDefault/:id',
    preHandler: [
      webAuth('updateDefaultAvatar'),
      validate(UserAvatarValidation.idValidation),
    ],
    handler: UserAvatarController.updateDefault,
  });
  route({
    method: 'PATCH',
    url: '/user_avatar/update/:id',
    preHandler: [
      webAuth('updateAvatar'),
      validate(UserAvatarValidation.idValidation),
    ],
    handler: UserAvatarController.update,
  });
  route({
    method: 'DELETE',
    url: '/user_avatar/delete/:id',
    preHandler: [
      webAuth('deleteAvatar'),
      validate(UserAvatarValidation.idValidation),
    ],
    handler: UserAvatarController.drop,
  });
  // User Avatar Routes //

  // Waiter Routes //
  route({
    method: 'GET',
    url: '/waiter/getAll',
    preHandler: [
      webAuth('getWaiter'),
      validate(WaiterValidation.allValidation),
    ],
    handler: WaiterController.waiterListAdmin,
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
  // Waiter Routes //

  // Kitchen Owner Routes //
  route({
    method: 'GET',
    url: '/kitchen_owners/list',
    preHandler: [
      webAuth('get_kitchen_owner_list'),
      validate(KitchenOwnerValidation.allValidation),
    ],
    handler: KitchenOwnerController.kitchenOwnerListAdmin,
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

  // Waiter Settings Routes //
  route({
    method: 'GET',
    url: '/waiter_settings/get',
    preHandler: [webAuth('getWaiterSettings')],
    handler: WaiterSettingController.get,
  });
  route({
    method: 'POST',
    url: '/waiter_settings/save',
    preHandler: [
      webAuth('createWaiterSettings'),
      validate(WaiterSettingValidation.createSettings),
    ],
    handler: WaiterSettingController.create,
  });
  route({
    method: 'PATCH',
    url: '/waiter_settings/update/:settingId',
    preHandler: [
      webAuth('updateWaiterSettings'),
      validate(WaiterSettingValidation.idValidation),
    ],
    handler: WaiterSettingController.update,
  });
  // Waiter Settings Routes //

  // Kitchen Owner Setting Routes //
  route({
    method: 'GET',
    url: '/kitchen_owner_setting/get',
    preHandler: [webAuth('get_kitchen_owner_setting')],
    handler: KitchenOwnerSettingController.get,
  });
  route({
    method: 'POST',
    url: '/kitchen_owner_setting/save',
    preHandler: [
      webAuth('create_kitchen_owner_setting'),
      validate(KitchenOwnerSettingValidation.createSettings),
    ],
    handler: KitchenOwnerSettingController.create,
  });
  route({
    method: 'PATCH',
    url: '/kitchen_owner_setting/update/:settingId',
    preHandler: [
      webAuth('update_kitchen_owner_setting'),
      validate(KitchenOwnerSettingValidation.idValidation),
    ],
    handler: KitchenOwnerSettingController.update,
  });
  // Kitchen Owner Setting Routes //

  // Food Taxation Routes //
  route({
    method: 'GET',
    url: '/food_taxation/getAll',
    preHandler: [
      webAuth('getFoodTaxationList'),
      validate(FoodTaxationValidation.allValidation),
    ],
    handler: FoodTaxationController.getTaxationListAdmin,
  });
  route({
    method: 'DELETE',
    url: '/food_taxation/delete_restaurant_taxation/:restaurant',
    preHandler: [
      webAuth('deleteFoodTaxation'),
      validate(FoodTaxationValidation.deleteAdminValidation),
    ],
    handler: FoodTaxationController.deleteTaxationAdmin,
  });
  // Food Taxation Routes //

  // Cash In Hand Routes //
  route({
    method: 'GET',
    url: '/cashCollection/list',
    preHandler: [
      webAuth('cashCollectionList'),
      validate(CollectCashValidation.collectCashListValidation),
    ],
    handler: CollectCashController.get,
  });
  route({
    method: 'GET',
    url: '/restaurant/getRestaurantByCityCollectCash/:cityId',
    preHandler: [
      webAuth('getRestaurantByCity'),
      validate(RestaurantValidation.restaurantByCityIdLimitedDetailsValidation),
    ],
    handler: RestaurantController.getRestaurantByCityIdFromCollectCash,
  });
  route({
    method: 'GET',
    url: '/restaurant/cashInHand/:vendor',
    preHandler: [
      webAuth('getRestaurantCashInHand'),
      validate(RestaurantValidation.vendorCashInHandValidation),
    ],
    handler: RestaurantController.getRestaurantCashInHand,
  });
  route({
    method: 'POST',
    url: '/restaurant/clearCashInHand',
    preHandler: [
      webAuth('clearCashInHand'),
      validate(RestaurantValidation.collectCashValidation),
    ],
    handler: RestaurantController.clearCashInHandAndUpdateWallet,
  });
  route({
    method: 'GET',
    url: '/deliveryman/cashInHand/:deliveryman',
    preHandler: [
      webAuth('getDeliverymanCashInHand'),
      validate(DriverValidation.deliverymanCashInHandValidation),
    ],
    handler: DriverController.getDeliverymanCashInHand,
  });
  route({
    method: 'POST',
    url: '/deliveryman/clearCashInHand',
    preHandler: [
      webAuth('clearCashInHand'),
      validate(DriverValidation.collectCashValidation),
    ],
    handler: DriverController.clearCashInHand,
  });
  // Cash In Hand Routes //

  // Withdrawal Method Routes //
  route({
    method: 'POST',
    url: '/withdrawalMethod/create',
    preHandler: [
      webAuth('createWithdrawalMethod'),
      validate(WithdrawalMethodValidation.createWithdrawalMethodValidation),
    ],
    handler: WithdrawalMethodController.create,
  });
  route({
    method: 'GET',
    url: '/withdrawalMethod/list',
    preHandler: [
      webAuth('getWithdrawalMethodList'),
      validate(WithdrawalMethodValidation.allValidation),
    ],
    handler: WithdrawalMethodController.methodList,
  });
  route({
    method: 'GET',
    url: '/withdrawalMethod/detail/:methodId',
    preHandler: [
      webAuth('getWithdrawalMethodList'),
      validate(WithdrawalMethodValidation.idValidation),
    ],
    handler: WithdrawalMethodController.withdrawalMethodDetail,
  });
  route({
    method: 'PATCH',
    url: '/withdrawalMethod/update/:methodId',
    preHandler: [
      webAuth('updateWithdrawalMethod'),
      validate(WithdrawalMethodValidation.idValidation),
    ],
    handler: WithdrawalMethodController.update,
  });
  route({
    method: 'PATCH',
    url: '/withdrawalMethod/updateDefault/:methodId',
    preHandler: [
      webAuth('updateDefaultWithdrawalMethod'),
      validate(WithdrawalMethodValidation.idValidation),
    ],
    handler: WithdrawalMethodController.updateDefault,
  });
  route({
    method: 'DELETE',
    url: '/withdrawalMethod/delete/:methodId',
    preHandler: [
      webAuth('deleteWithdrawalMethod'),
      validate(WithdrawalMethodValidation.idValidation),
    ],
    handler: WithdrawalMethodController.drop,
  });
  // Withdrawal Method Routes //

  // Withdrawal Request Routes //
  route({
    method: 'GET',
    url: '/withdrawalRequest/restaurant',
    preHandler: [
      webAuth('getRestaurantWithdrawalRequest'),
      validate(WithdrawalRequestValidation.allValidation),
    ],
    handler: WithdrawalRequestController.getRestaurantWithdrawalRequest,
  });
  route({
    method: 'GET',
    url: '/withdrawalRequest/deliveryman',
    preHandler: [
      webAuth('getDeliverymanWithdrawalRequest'),
      validate(WithdrawalRequestValidation.allValidation),
    ],
    handler: WithdrawalRequestController.getDeliverymanWithdrawalRequest,
  });
  route({
    method: 'GET',
    url: '/withdrawalRequest/detail/:id',
    preHandler: [
      webAuth('getWithdrawalRequestDetail'),
      validate(WithdrawalRequestValidation.idValidation),
    ],
    handler: WithdrawalRequestController.withdrawalRequestDetail,
  });
  route({
    method: 'POST',
    url: '/withdrawalRequest/decline',
    preHandler: [
      webAuth('declineWithdrawalRequest'),
      validate(WithdrawalRequestValidation.declineWithdrawalRequestValidation),
    ],
    handler: WithdrawalRequestController.declineWithdrawalRequest,
  });
  route({
    method: 'POST',
    url: '/withdrawalRequest/approve',
    preHandler: [
      webAuth('approveWithdrawalRequest'),
      validate(WithdrawalRequestValidation.approveWithdrawalRequestValidation),
    ],
    handler: WithdrawalRequestController.approveWithdrawalRequest,
  });
  // Withdrawal Request Routes //

  // Joining Form Routes //
  route({
    method: 'POST',
    url: '/joining_form/restaurant',
    preHandler: [
      webAuth('saveJoiningForm'),
      validate(JoiningFormValidation.saveRestaurantJoiningFormValidation),
    ],
    handler: JoiningFormController.saveRestaurantForm,
  });
  route({
    method: 'POST',
    url: '/joining_form/deliveryman',
    preHandler: [
      webAuth('saveJoiningForm'),
      validate(JoiningFormValidation.saveRestaurantJoiningFormValidation),
    ],
    handler: JoiningFormController.saveDeliverymanForm,
  });
  route({
    method: 'GET',
    url: '/restaurant_joining_form',
    preHandler: [webAuth('getJoinigFormDetail')],
    handler: JoiningFormController.getRestaurantForm,
  });
  route({
    method: 'GET',
    url: '/deliveryman_joining_form',
    preHandler: [webAuth('getJoinigFormDetail')],
    handler: JoiningFormController.getDeliverymanForm,
  });
  // Joining Form Routes //

  // Joining Request Routes //
  route({
    method: 'GET',
    url: '/restaurant_request/list/:status',
    preHandler: [
      webAuth('getRestaurantJoiningRequest'),
      validate(RestaurantJoiningRequestValidation.statusValidation),
    ],
    handler: RestaurantJoiningRequestController.getJoiningRequestList,
  });
  route({
    method: 'DELETE',
    url: '/restaurant_request/delete/:id',
    preHandler: [
      webAuth('deleteRestaurantJoiningRequest'),
      validate(RestaurantJoiningRequestValidation.idValidation),
    ],
    handler: RestaurantJoiningRequestController.deleteRequest,
  });
  route({
    method: 'GET',
    url: '/restaurant_request/detail/:id',
    preHandler: [
      webAuth('getRestaurantJoiningRequest'),
      validate(RestaurantJoiningRequestValidation.idValidation),
    ],
    handler: RestaurantJoiningRequestController.getDetail,
  });
  route({
    method: 'PATCH',
    url: '/restaurant_request/reject/:id',
    preHandler: [
      webAuth('rejectRestaurantJoiningRequest'),
      validate(RestaurantJoiningRequestValidation.rejectValidation),
    ],
    handler: RestaurantJoiningRequestController.rejectRequest,
  });
  route({
    method: 'POST',
    url: '/restaurant_request/approve/:id',
    preHandler: [
      webAuth('acceptRestaurantJoiningRequest'),
      validate(RestaurantJoiningRequestValidation.approveValidation),
    ],
    handler: RestaurantJoiningRequestController.approveRequest,
  });

  route({
    method: 'GET',
    url: '/deliveryman_request/list/:status',
    preHandler: [
      webAuth('getDeliverymanJoiningRequest'),
      validate(DeliverymanJoiningRequestValidation.statusValidation),
    ],
    handler: DeliverymanJoiningRequestController.getJoiningRequestList,
  });
  route({
    method: 'DELETE',
    url: '/deliveryman_request/delete/:id',
    preHandler: [
      webAuth('deleteDeliverymanJoiningRequest'),
      validate(DeliverymanJoiningRequestValidation.idValidation),
    ],
    handler: DeliverymanJoiningRequestController.deleteRequest,
  });
  route({
    method: 'GET',
    url: '/deliveryman_request/detail/:id',
    preHandler: [
      webAuth('getDeliverymanJoiningRequest'),
      validate(DeliverymanJoiningRequestValidation.idValidation),
    ],
    handler: DeliverymanJoiningRequestController.getDetail,
  });
  route({
    method: 'PATCH',
    url: '/deliveryman_request/reject/:id',
    preHandler: [
      webAuth('rejectDeliverymanJoiningRequest'),
      validate(DeliverymanJoiningRequestValidation.rejectValidation),
    ],
    handler: DeliverymanJoiningRequestController.rejectRequest,
  });
  route({
    method: 'POST',
    url: '/deliveryman_request/approve/:id',
    preHandler: [
      webAuth('acceptDeliverymanJoiningRequest'),
      validate(DeliverymanJoiningRequestValidation.approveValidation),
    ],
    handler: DeliverymanJoiningRequestController.approveRequest,
  });
  // Joining Request Routes //

  // Invoice Instructions Routes //
  route({
    method: 'GET',
    url: '/invoice/instruction/getAll',
    preHandler: [
      webAuth('getInvoiceInstructions'),
      validate(InvoiceInstructionValidation.allValidation),
    ],
    handler: InvoiceInstructionController.get,
  });
  route({
    method: 'POST',
    url: '/invoice/instruction/save',
    preHandler: [
      webAuth('createInvoiceInstruction'),
      validate(InvoiceInstructionValidation.createInvoiceInstructionValidation),
    ],
    handler: InvoiceInstructionController.create,
  });
  route({
    method: 'PATCH',
    url: '/invoice/instruction/update/:noticeId',
    preHandler: [
      webAuth('updateInvoiceInstruction'),
      validate(InvoiceInstructionValidation.idValidation),
    ],
    handler: InvoiceInstructionController.update,
  });
  route({
    method: 'DELETE',
    url: '/invoice/instruction/delete/:noticeId',
    preHandler: [
      webAuth('deleteInvoiceInstruction'),
      validate(InvoiceInstructionValidation.idValidation),
    ],
    handler: InvoiceInstructionController.drop,
  });
  // Invoice Instructions Routes //

  // Customer Routes //
  route({
    method: 'GET',
    url: '/customer/getList',
    preHandler: [webAuth('getCustomerList')],
    handler: UserController.customerList,
  });
  route({
    method: 'PATCH',
    url: '/customer/update/:id',
    preHandler: [
      webAuth('updateCustomerStatus'),
      validate(UserValidation.updateStatusValidation),
    ],
    handler: UserController.updateStatus,
  });
  route({
    method: 'GET',
    url: '/customer/loyaltyPointsReport',
    preHandler: [
      webAuth('loyaltyPointsReport'),
      validate(UserValidation.loyalityPointValidation),
    ],
    handler: LoyaltyPointsController.loyalityPointReport,
  });
  route({
    method: 'GET',
    url: '/customer/walletFundList',
    preHandler: [webAuth('walletFundList')],
    handler: UserController.customerWalletFundList,
  });
  route({
    method: 'POST',
    url: '/customer/wallet/addFund',
    preHandler: [
      webAuth('addWalletFund'),
      validate(WalletValidation.adminAddWalletFundValidation),
    ],
    handler: WalletController.adminAddWalletFund,
  });
  // Customer Routes //

  // Wallet Bonus Routes //
  route({
    method: 'POST',
    url: '/wallet/bonus/save',
    preHandler: [
      webAuth('createWalletBonus'),
      validate(WalletBonusValidation.createBonusValidation),
    ],
    handler: WalletBonusController.create,
  });
  route({
    method: 'GET',
    url: '/wallet/bonus/getAll',
    preHandler: [
      webAuth('getWalletBonus'),
      validate(WalletBonusValidation.allValidation),
    ],
    handler: WalletBonusController.getAll,
  });
  route({
    method: 'PATCH',
    url: '/wallet/bonus/updateStatus/:id',
    preHandler: [
      webAuth('updateWalletBonus'),
      validate(WalletBonusValidation.updateStatusValidation),
    ],
    handler: WalletBonusController.updateStatus,
  });
  route({
    method: 'DELETE',
    url: '/wallet/bonus/delete/:id',
    preHandler: [
      webAuth('deleteBonus'),
      validate(WalletBonusValidation.idValidation),
    ],
    handler: WalletBonusController.drop,
  });
  route({
    method: 'PATCH',
    url: '/wallet/bonus/update/:id',
    preHandler: [
      webAuth('updateWalletBonus'),
      validate(WalletBonusValidation.updateValidation),
    ],
    handler: WalletBonusController.updateData,
  });
  // Wallet Bonus Routes //

  // Admin Expense Routes //
  route({
    method: 'POST',
    url: '/expense/save',
    preHandler: [
      webAuth('saveAdminExpense'),
      validate(AdminExpenseValidation.saveExpenseValidation),
    ],
    handler: AdminExpenseController.create,
  });
  // Admin Expense Routes //

  // Report Routes //
  route({
    method: 'GET',
    url: '/reports/wallet_transaction/',
    preHandler: [webAuth('walletTransactionReport')],
    handler: WalletController.getTransactionReport,
  });
  route({
    method: 'GET',
    url: '/reports/payment_transaction/',
    preHandler: [
      webAuth('paymentTransactionReport'),
      validate(PaymentConfigValidation.allPaymentValidation),
    ],
    handler: PaymentInitiationController.getPaymentInitiateReport,
  });
  route({
    method: 'GET',
    url: '/reports/food_report/',
    preHandler: [webAuth('foodReport')],
    handler: FoodController.foodReport,
  });
  route({
    method: 'GET',
    url: '/reports/restaurantInitial',
    preHandler: [webAuth('restaurantReport')],
    handler: RestaurantController.restauratReportInitialFilter,
  });
  route({
    method: 'GET',
    url: '/reports/restaurant',
    preHandler: [webAuth('restaurantReport')],
    handler: RestaurantController.restaurantReport,
  });
  route({
    method: 'GET',
    url: '/reports/customer',
    preHandler: [webAuth('customerReport')],
    handler: UserController.customerReport,
  });
  route({
    method: 'GET',
    url: '/reports/deliveryman',
    preHandler: [webAuth('deliverymanReport')],
    handler: DriverController.deliverymanReport,
  });
  route({
    method: 'GET',
    url: '/reports/orders',
    preHandler: [
      webAuth('orderReport'),
      validate(OrdersValidation.orderReportValidation),
    ],
    handler: OrdersController.orderReports,
  });
  route({
    method: 'GET',
    url: '/reports/posOrders',
    preHandler: [
      webAuth('orderReport'),
      validate(OrdersValidation.orderReportValidation),
    ],
    handler: PosOrTableOrderController.posOrderReport,
  });
  route({
    method: 'GET',
    url: '/reports/tableOrders',
    preHandler: [
      webAuth('orderReport'),
      validate(OrdersValidation.orderReportValidation),
    ],
    handler: TableOrderController.tableOrderReport,
  });
  route({
    method: 'GET',
    url: '/reports/diningBooking',
    preHandler: [webAuth('orderReport')],
    handler: DiningBookingController.diningBookingReport,
  });
  route({
    method: 'GET',
    url: '/reports/expenseInitial',
    preHandler: [webAuth('expenseReport')],
    handler: AdminExpenseController.getInitialResponse,
  });
  route({
    method: 'GET',
    url: '/reports/expense',
    preHandler: [webAuth('expenseReport')],
    handler: AdminExpenseController.getExpenseList,
  });
  route({
    method: 'GET',
    url: '/reports/disbursementReportInitial',
    preHandler: [webAuth('disbursementReport')],
    handler: DisbursementController.disbursementTransactionInitial,
  });
  route({
    method: 'GET',
    url: '/reports/restaurantDisbursement',
    preHandler: [webAuth('disbursementReport')],
    handler: DisbursementController.restaurantDisbursementTransactionReport,
  });
  route({
    method: 'GET',
    url: '/reports/deliverymanDisbursementReportInitial',
    preHandler: [webAuth('disbursementReport')],
    handler: DisbursementController.deliverymanDisbursementTransactionInitial,
  });
  route({
    method: 'GET',
    url: '/reports/deliverymanDisbursement',
    preHandler: [webAuth('disbursementReport')],
    handler: DisbursementController.deliverymanDisbursementTransactionReport,
  });
  // Report Routes //

  // Disbursement //
  route({
    method: 'GET',
    url: '/disbursement/restaurant',
    preHandler: [webAuth('restaurantDisbursement')],
    handler: DisbursementController.restaurantDisbursement,
  });
  route({
    method: 'GET',
    url: '/disbursement/deliveryman',
    preHandler: [webAuth('deliverymanDisbursement')],
    handler: DisbursementController.deliverymanDisbursement,
  });
  route({
    method: 'GET',
    url: '/disbursement/restaurantReport/:id',
    preHandler: [
      webAuth('restaurantDisbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.restaurantDisbursementReport,
  });
  route({
    method: 'GET',
    url: '/disbursement/deliverymanReport/:id',
    preHandler: [
      webAuth('deliverymanDisbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.deliverymanDisbursementReport,
  });
  route({
    method: 'GET',
    url: '/disbursement/restaurantDisbursementDetail/:id',
    preHandler: [
      webAuth('restaurantDisbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.restaurantDisbursementDetail,
  });
  route({
    method: 'GET',
    url: '/disbursement/deliverymanDisbursementDetail/:id',
    preHandler: [
      webAuth('deliverymanDisbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.deliverymanDisbursementDetail,
  });
  route({
    method: 'GET',
    url: '/disbursement/acceptRestaurantDisbursement/:id',
    preHandler: [
      webAuth('restaurantDisbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.acceptRestaurantDisburment,
  });
  route({
    method: 'GET',
    url: '/disbursement/rejectRestaurantDisbursement/:id',
    preHandler: [
      webAuth('restaurantDisbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.rejectRestaurantDisburment,
  });

  route({
    method: 'GET',
    url: '/disbursement/acceptDeliverymanDisbursement/:id',
    preHandler: [
      webAuth('deliverymanDisbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.acceptDeliverymanDisbursment,
  });
  route({
    method: 'GET',
    url: '/disbursement/rejectDeliverymanDisbursement/:id',
    preHandler: [
      webAuth('deliverymanDisbursement'),
      validate(DisbursementValidation.disbursementReportValidation),
    ],
    handler: DisbursementController.rejectDeliverymanDisbursment,
  });
  // Disbursement //

  // Customer Detail Routes //
  route({
    method: 'GET',
    url: '/customer/orderList',
    preHandler: [webAuth('customerDetail')],
    handler: OrdersController.customerOrderList,
  });
  route({
    method: 'GET',
    url: '/customer/diningBookingList',
    preHandler: [webAuth('customerDetail')],
    handler: DiningBookingController.customerDiningBooking,
  });
  route({
    method: 'GET',
    url: '/customer/deliveryAddressList',
    preHandler: [webAuth('customerDetail')],
    handler: UserAddressController.customerAddressList,
  });
  route({
    method: 'GET',
    url: '/customer/purchasedTiffinPackages',
    preHandler: [webAuth('customerDetail')],
    handler: UserPurchasedTiffinSubscriptionController.customerPurchasedPackages,
  });
  route({
    method: 'GET',
    url: '/customer/customerAllRefundRequest',
    preHandler: [webAuth('customerDetail')],
    handler: OrdersController.customerAllRefundRequest,
  });
  route({
    method: 'GET',
    url: '/customer/customerOrderRefundList',
    preHandler: [webAuth('customerDetail')],
    handler: OrdersController.customerOrderRefundList,
  });
  route({
    method: 'GET',
    url: '/customer/customerTiffinRefundList',
    preHandler: [webAuth('customerDetail')],
    handler: OrdersController.customerTiffinRefundList,
  });
  route({
    method: 'GET',
    url: '/customer/customerBookingRefundList',
    preHandler: [webAuth('customerDetail')],
    handler: OrdersController.customerBookingRefundList,
  });
  route({
    method: 'GET',
    url: '/customer/customerComplaintList',
    preHandler: [webAuth('customerDetail')],
    handler: ComplaintsController.customerComplaintList,
  });
  route({
    method: 'GET',
    url: '/customer/customerAllFavourite',
    preHandler: [webAuth('customerDetail')],
    handler: FavouriteController.customerAllFavourite,
  });
  route({
    method: 'GET',
    url: '/customer/customerFavouriteOrders',
    preHandler: [webAuth('customerDetail')],
    handler: FavouriteController.customerFavouriteOrders,
  });
  route({
    method: 'GET',
    url: '/customer/customerFavouriteRestaurant',
    preHandler: [webAuth('customerDetail')],
    handler: FavouriteController.customerFavouriteRestaurant,
  });
  route({
    method: 'GET',
    url: '/customer/customerFavouriteFood',
    preHandler: [webAuth('customerDetail')],
    handler: FavouriteController.customerFavouriteFood,
  });
  route({
    method: 'GET',
    url: '/customer/customerHiddenRestaurants',
    preHandler: [webAuth('customerDetail')],
    handler: HideRestaurantController.customerHiddenRestaurants,
  });
  route({
    method: 'GET',
    url: '/customer/detail/:user',
    preHandler: [
      webAuth('customerDetail'),
      validate(UserValidation.idValidation),
    ],
    handler: UserController.customerDetail,
  });
  route({
    method: 'GET',
    url: '/customer/customerMediaFiles',
    preHandler: [webAuth('customerDetail')],
    handler: MediaController.customerMediaFiles,
  });
  route({
    method: 'GET',
    url: '/customer/customerAllReviews',
    preHandler: [webAuth('customerDetail')],
    handler: ReviewRatingController.customerAllReviews,
  });
  route({
    method: 'GET',
    url: '/customer/customerRestaurantReview',
    preHandler: [webAuth('customerDetail')],
    handler: ReviewRatingController.customerRestaurantReview,
  });
  route({
    method: 'GET',
    url: '/customer/customerFoodReview',
    preHandler: [webAuth('customerDetail')],
    handler: ReviewRatingController.customerFoodReview,
  });
  route({
    method: 'GET',
    url: '/customer/customerDeliverymanReview',
    preHandler: [webAuth('customerDetail')],
    handler: ReviewRatingController.customerDeliverymanReview,
  });
  route({
    method: 'GET',
    url: '/customer/wallet_transactions',
    preHandler: [webAuth('customerDetail')],
    handler: WalletController.customerTransactionList,
  });
  // Customer Detail Routes //

  // Restaurant Detail Routes //
  route({
    method: 'GET',
    url: '/vendor_detail/orderList',
    preHandler: [webAuth('restaurantDetail')],
    handler: OrdersController.vendorOrderList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/pos_order_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: PosOrTableOrderController.vendorPosOrderList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/table_order_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: TableOrderController.vendorTableOrderList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/booking_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: DiningBookingController.vendorBookingList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/food_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: FoodController.vendorFoodList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/waiter_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: WaiterController.vendorWaiterList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/deliveryman_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: DriverController.vendorDeliverymanList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/tiffin_package_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: SubscriptionTiffinPackageController.vendorTiffinPackageList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/complaints',
    preHandler: [webAuth('restaurantDetail')],
    handler: ComplaintsController.vendorComplaintList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/complaint_orders',
    preHandler: [webAuth('restaurantDetail')],
    handler: ComplaintsController.vendorUserOrderComplaintList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/complaint_vendor',
    preHandler: [webAuth('restaurantDetail')],
    handler: ComplaintsController.vendorOwnOrderComplaintList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/all_refund_request',
    preHandler: [webAuth('restaurantDetail')],
    handler: OrdersController.vendorAllRefundRequest,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/order_refund_request',
    preHandler: [webAuth('restaurantDetail')],
    handler: OrdersController.vendorOrderRefundRequest,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/dining_refund_request',
    preHandler: [webAuth('restaurantDetail')],
    handler: OrdersController.vendorDiningRefundRequest,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/tiffin_subscription_refund_request',
    preHandler: [webAuth('restaurantDetail')],
    handler: OrdersController.vendorTiffinRefundRequest,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/media_files',
    preHandler: [webAuth('restaurantDetail')],
    handler: MediaController.vendorMediaFiles,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/outlet_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: RestaurantController.vendorOutletList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/disbursement_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: DisbursementController.vendorDisbursementList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/collected_cash_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: CollectCashController.vendorCollectedCashList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/withdrawal_request_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: WithdrawalRequestController.vendorWithdrawalRequest,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/payout_accounts',
    preHandler: [webAuth('restaurantDetail')],
    handler: RestaurantPayoutMethodController.vendorPayoutAccounts,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/all_reviews',
    preHandler: [webAuth('restaurantDetail')],
    handler: ReviewRatingController.vendorAllReviews,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/vendor_reviews',
    preHandler: [webAuth('restaurantDetail')],
    handler: ReviewRatingController.vendorReviews,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/vendor_food_reviews',
    preHandler: [webAuth('restaurantDetail')],
    handler: ReviewRatingController.vendorFoodReviews,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/information/:id',
    preHandler: [
      webAuth('restaurantDetail'),
      validate(RestaurantValidation.vendorInformationValidation),
    ],
    handler: RestaurantController.vendorInformation,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/wallet_transactions',
    preHandler: [webAuth('restaurantDetail')],
    handler: WalletController.vendorTransactionList,
  });
  route({
    method: 'GET',
    url: '/vendor_detail/kitchen_owner_list',
    preHandler: [webAuth('restaurantDetail')],
    handler: KitchenOwnerController.vendorKitchenOwnerList,
  });
  // Restaurant Detail Routes //

  // Deliveryman Detail Routes //
  route({
    method: 'GET',
    url: '/deliveryman_detail/information/:id',
    preHandler: [
      webAuth('deliverymanDetail'),
      validate(DriverValidation.deliverymanInformationValidation),
    ],
    handler: DriverController.deliverymanInformation,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/order_list',
    preHandler: [webAuth('deliverymanDetail')],
    handler: OrdersController.deliverymanOrderList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/disbursement_list',
    preHandler: [webAuth('deliverymanDetail')],
    handler: DisbursementController.deliverymanDisbursementList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/collected_cash_list',
    preHandler: [webAuth('deliverymanDetail')],
    handler: CollectCashController.deliverymanCollectedCashList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/payout_accounts',
    preHandler: [webAuth('deliverymanDetail')],
    handler: DeliverymanPayoutMethodController.deliverymanPayoutAccounts,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/withdrawal_request_list',
    preHandler: [webAuth('deliverymanDetail')],
    handler: WithdrawalRequestController.deliverymanWithdrawalRequest,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/reviews',
    preHandler: [webAuth('deliverymanDetail')],
    handler: ReviewRatingController.deliverymanReviews,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/media_files',
    preHandler: [webAuth('deliverymanDetail')],
    handler: MediaController.deliverymanMediaFiles,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/complaints',
    preHandler: [webAuth('deliverymanDetail')],
    handler: ComplaintsController.deliverymanComplaintList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/complaint_orders',
    preHandler: [webAuth('deliverymanDetail')],
    handler: ComplaintsController.deliverymanUserOrderComplaintList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/complaint_vendor',
    preHandler: [webAuth('deliverymanDetail')],
    handler: ComplaintsController.deliverymanRestaurantComplaintList,
  });
  route({
    method: 'GET',
    url: '/deliveryman_detail/wallet_transactions',
    preHandler: [webAuth('deliverymanDetail')],
    handler: WalletController.deliverymanTransactionList,
  });
  //
  // Deliveryman Detail Routes //

  // POS Routes //
  route({
    method: 'GET',
    url: '/pos/initial',
    preHandler: [webAuth('posOrder')],
    handler: CityController.posCities,
  });
  route({
    method: 'GET',
    url: '/pos/restaurants/:cityId',
    preHandler: [
      webAuth('posOrder'),
      validate(RestaurantValidation.cityIdValidation),
    ],
    handler: RestaurantController.posRestaurantListFromCity,
  });
  route({
    method: 'GET',
    url: '/pos/categories/:restaurantId',
    preHandler: [
      webAuth('posOrder'),
      validate(RestaurantValidation.idValidation),
    ],
    handler: RestaurantController.posRestaurantData,
  });
  route({
    method: 'POST',
    url: '/pos/food_list/',
    preHandler: [
      webAuth('posOrder'),
      validate(RestaurantValidation.posFoodListWebValidation),
    ],
    handler: RestaurantController.getPosFoodDataWeb,
  });
  route({
    method: 'GET',
    url: '/pos/search/:vendor/:searchQuery',
    preHandler: [
      webAuth('posOrder'),
      validate(RestaurantValidation.posFoodSearchValidation),
    ],
    handler: RestaurantController.posFoodSearch,
  });
  route({
    method: 'POST',
    url: '/pos/createCustomer',
    preHandler: [
      webAuth('createCustomer'),
      validate(AuthValidation.adminAddCustomerValidation),
    ],
    handler: UserController.adminCreateCustomer,
  });
  route({
    method: 'GET',
    url: '/pos/customer_detail/:user',
    preHandler: [
      webAuth('posOrder'),
      validate(UserValidation.idValidation),
    ],
    handler: UserController.adminPosCustomerDetail,
  });
  route({
    method: 'POST',
    url: '/pos/place_order',
    preHandler: [
      webAuth('posOrder'),
      validate(OrdersValidation.adminPOSOrderValidation),
    ],
    handler: OrdersController.placePOSAdminOrder,
  });
  // POS Routes //

  // Roles Routes //
  route({
    method: 'GET',
    url: '/auth_roles/role_account_list',
    preHandler: [
      webAuth('manage_role'),
      validate(AuthValidation.roleAccountListValidation),
    ],
    handler: AuthController.getRoleAccountList,
  });
  route({
    method: 'POST',
    url: '/auth_roles/new_admin',
    preHandler: [
      webAuth('manage_role'),
      validate(AuthValidation.roleValidation),
    ],
    handler: AuthController.addAdminAccount,
  });
  route({
    method: 'GET',
    url: '/auth_roles/detail/:id',
    preHandler: [
      webAuth('manage_role'),
      validate(AuthValidation.roleAccountDetailValidation),
    ],
    handler: AuthController.roleAccountDetail,
  });
  route({
    method: 'PATCH',
    url: '/auth_roles/update_status/:id',
    preHandler: [
      webAuth('manage_role'),
      validate(AuthValidation.updateRoleStatusValidation),
    ],
    handler: AuthController.updateRoleStatus,
  });
  route({
    method: 'PATCH',
    url: '/auth_roles/update_detail/:id',
    preHandler: [
      webAuth('manage_role'),
      validate(AuthValidation.updateRoleDetailValidation),
    ],
    handler: AuthController.updateRoleDetail,
  });
  route({
    method: 'POST',
    url: '/auth_roles/new_accountant',
    preHandler: [
      webAuth('manage_role'),
      validate(AuthValidation.roleValidation),
    ],
    handler: AuthController.addAccountantAccount,
  });
  route({
    method: 'POST',
    url: '/auth_roles/new_support_team',
    preHandler: [
      webAuth('manage_role'),
      validate(AuthValidation.roleValidation),
    ],
    handler: AuthController.addSupportTeamAccount,
  });
  route({
    method: 'GET',
    url: '/auth_roles/city_master_list',
    preHandler: [
      webAuth('manage_role'),
      validate(AuthValidation.cityZenAccountListValidation),
    ],
    handler: AuthController.cityMasterList,
  });
  route({
    method: 'POST',
    url: '/auth_roles/new_city_master',
    preHandler: [
      webAuth('manage_role'),
      validate(AuthValidation.cityRoleValidation),
    ],
    handler: AuthController.addCityMaterAccount,
  });
  route({
    method: 'GET',
    url: '/auth_roles/city_master_detail/:id',
    preHandler: [
      webAuth('manage_role'),
      validate(AuthValidation.roleAccountDetailValidation),
    ],
    handler: AuthController.cityMasterAccountDetail,
  });
  route({
    method: 'PATCH',
    url: '/auth_roles/update_city_master/:id',
    preHandler: [
      webAuth('manage_role'),
      validate(AuthValidation.updateCityMasterValidation),
    ],
    handler: AuthController.updateCityMasterDetail,
  });
  // Roles Routes //

  // Admin Profile //
  route({
    method: 'GET',
    url: '/admin_profile/:id',
    preHandler: [
      webAuth('admin_profile'),
      validate(UserValidation.adminProfileValidation),
    ],
    handler: UserController.getAdminProfile,
  });
  route({
    method: 'PATCH',
    url: '/update_admin/:id',
    preHandler: [
      webAuth('update_admin'),
      validate(UserValidation.updateAdminProfileValidation),
    ],
    handler: UserController.updateAdminProfile,
  });
  route({
    method: 'PATCH',
    url: '/update_admin_password/:id',
    preHandler: [
      webAuth('update_admin_password'),
      validate(UserValidation.updateAdminPasswordValidation),
    ],
    handler: UserController.updateAdminPassword,
  });
  // Admin Profile //

  // User Account Delete Reason Routes //
  route({
    method: 'POST',
    url: '/delete_account_reason/save',
    preHandler: [
      webAuth('create_user_delete_account_reason'),
      validate(UserAccountDeleteReasonValidation.createAccountDeleteReasonValidation),
    ],
    handler: UserDeleteAccountReasonController.create,
  });
  route({
    method: 'PATCH',
    url: '/update_delete_account_reason/:reasonId',
    preHandler: [
      webAuth('update_delete_account_reason'),
      validate(UserAccountDeleteReasonValidation.idValidation),
    ],
    handler: UserDeleteAccountReasonController.update,
  });
  route({
    method: 'GET',
    url: '/delete_account_reason_list',
    preHandler: [
      webAuth('delete_account_reason_list'),
      validate(UserAccountDeleteReasonValidation.allValidation),
    ],
    handler: UserDeleteAccountReasonController.get,
  });
  route({
    method: 'DELETE',
    url: '/drop_delete_account_reason/:reasonId',
    preHandler: [
      webAuth('drop_delete_account_reason'),
      validate(UserAccountDeleteReasonValidation.idValidation),
    ],
    handler: UserDeleteAccountReasonController.drop,
  });
  // User Account Delete Reason Routes //

  // Deleted Account Routes //
  route({
    method: 'GET',
    url: '/customer/deleted_accounts',
    preHandler: [
      webAuth('customer_deleted_accounts'),
      validate(UserValidation.deletedAccountValidation),
    ],
    handler: UserController.customerDeletedAccount,
  });
  route({
    method: 'GET',
    url: '/waiters/deleted_waiter',
    preHandler: [
      webAuth('waiter_deleted_accounts'),
      validate(UserValidation.deletedAccountValidation),
    ],
    handler: UserController.waiterDeletedAccount,
  });
  route({
    method: 'GET',
    url: '/deliveryman/deleted_deliveryman',
    preHandler: [
      webAuth('deliveryman_deleted_accounts'),
      validate(UserValidation.deletedAccountValidation),
    ],
    handler: UserController.deliverymanDeletedAccount,
  });
  route({
    method: 'GET',
    url: '/restaurants/deleted_restaurants',
    preHandler: [
      webAuth('restaurant_deleted_accounts'),
      validate(UserValidation.deletedAccountValidation),
    ],
    handler: UserController.restaurantDeletedAccount,
  });
  route({
    method: 'GET',
    url: '/kitchen/deleted_kitchen_owner',
    preHandler: [
      webAuth('deleted_kitchen_owner'),
      validate(UserValidation.deletedAccountValidation),
    ],
    handler: UserController.kitchenDeletedAccount,
  });
  // Deleted Account Routes //

  // Notification Routes //
  route({
    method: 'POST',
    url: '/send_notification',
    preHandler: [
      webAuth('send_notification'),
      validate(UserValidation.sendNotificationValidation),
    ],
    handler: FcmController.adminSendNotification,
  });
  route({
    method: 'GET',
    url: '/admin_header_content',
    preHandler: [webAuth('admin_header_content')],
    handler: NotificationListController.adminHeaderContent,
  });
  route({
    method: 'GET',
    url: '/notification_list',
    preHandler: [webAuth('notification_list')],
    handler: NotificationListController.adminNotificationList,
  });
  route({
    method: 'GET',
    url: '/regular_chat_list',
    preHandler: [webAuth('regular_chat_list')],
    handler: ChatRoomController.adminChatList,
  });
  route({
    method: 'GET',
    url: '/support_chat_list',
    preHandler: [webAuth('support_chat_list')],
    handler: SupportChatRoomController.adminSupportChatList,
  });
  route({
    method: 'GET',
    url: '/regular_chat_messages/:id',
    preHandler: [
      webAuth('regular_chat_messages'),
      validate(ChatRoomValidation.adminChatMessagesValidation),
    ],
    handler: ChatRoomController.adminGetChatMessages,
  });
  route({
    method: 'GET',
    url: '/support_chat_messages/:id',
    preHandler: [
      webAuth('support_chat_messages'),
      validate(ChatRoomValidation.adminChatMessagesValidation),
    ],
    handler: SupportChatRoomController.adminChatMessages,
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
  // Notification Routes //

  // Admin User Contact Detail Routes //
  route({
    method: 'GET',
    url: '/user_contact_detail/:id',
    preHandler: [
      webAuth('user_contact_detail'),
      validate(UserValidation.adminUserContactDetailValidation),
    ],
    handler: UserController.adminUserContactDetail,
  });
  // Admin User Contact Detail Routes //
  // Import & Export Routes //
  route({
    method: 'GET',
    url: '/cities/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(CityValidation.exportValidation),
    ],
    handler: CityController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/localities/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(LocalityValidation.exportValidation),
    ],
    handler: LocalityController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/cuisine/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(CuisineValidation.exportValidation),
    ],
    handler: CuisineController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/report_issue/restaurant/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(ReportIssueRestaurantReasonValidation.exportValidation),
    ],
    handler: ReportIssueRestaurantReasonController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/hide_reason/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(HideRestaurantReasonValidation.exportValidation),
    ],
    handler: HideRestaurantReasonController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/restaurant_type/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantTypeValidation.exportValidation),
    ],
    handler: RestaurantTypeController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/restaurant_facilities/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantFacilitiesValidation.exportValidation),
    ],
    handler: RestaurantFacilitiesController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/category/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(CategoryValidation.exportValidation),
    ],
    handler: CategoryController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/sub_category/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(SubCategoryValidation.exportValidation),
    ],
    handler: SubCategoryController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/vehicle/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(VehicleValidation.exportValidation),
    ],
    handler: VehicleController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/deliveryshift_schedule/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DeliveryShiftScheduleValidation.exportValidation),
    ],
    handler: DeliveryShiftScheduleController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/auth_roles/admin/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportRoleValidation),
    ],
    handler: AuthController.exportCollectionAdminRole,
  });
  route({
    method: 'GET',
    url: '/auth_roles/accountant/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportRoleValidation),
    ],
    handler: AuthController.exportCollectionAccountantRole,
  });
  route({
    method: 'GET',
    url: '/auth_roles/support_team/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportRoleValidation),
    ],
    handler: AuthController.exportCollectionSupportRole,
  });
  route({
    method: 'GET',
    url: '/auth_roles/cityzen/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportRoleValidation),
    ],
    handler: AuthController.exportCollectionCityzenRole,
  });
  route({
    method: 'GET',
    url: '/restaurant_all_data/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantValidation.exportValidation),
    ],
    handler: RestaurantController.exportCollectionRestaurantAllData,
  });
  route({
    method: 'GET',
    url: '/outlet_all_data/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantValidation.exportValidation),
    ],
    handler: RestaurantController.exportCollectionOutletAllData,
  });
  route({
    method: 'GET',
    url: '/report_issue_list/restaurant/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(ReportIssueRestaurantReasonValidation.restaurantReportExportValidation),
    ],
    handler: ReportIssueRestaurantController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/hidden_restaurants/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(HideRestaurantReasonValidation.exportValidation),
    ],
    handler: HideRestaurantController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/waiter/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(WaiterValidation.exportValidation),
    ],
    handler: WaiterController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/kitchen_owners/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(KitchenOwnerValidation.exportValidation),
    ],
    handler: KitchenOwnerController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/restaurant_request/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantJoiningRequestValidation.exportValidation),
    ],
    handler: RestaurantJoiningRequestController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/order_cancel_reason/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(OrderCancellationReasonValidation.exportValidation),
    ],
    handler: OrderCancellationReasonController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/order_rating_message/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(OrderRatingMessageValidation.exportValidation),
    ],
    handler: OrderRatingMessageController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/invoice_instruction/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(InvoiceInstructionValidation.exportValidation),
    ],
    handler: InvoiceInstructionController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/restaurant_food_license/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantFoodLicenseValidation.exportValidation),
    ],
    handler: RestaurantFoodLicenseController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/restaurant_notice/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantNoticeValidation.exportValidation),
    ],
    handler: RestaurantNoticeController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/delivery_instruction/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DeliveryInstructionValidation.exportValidation),
    ],
    handler: DeliveryInstructionController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/gratitude/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DeliveryGratitudeValidation.exportValidation),
    ],
    handler: DeliveryGratitudeController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/driver_incentive/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DriverIncentiveValidation.exportValidation),
    ],
    handler: DriverIncentiveController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/driver_offline_messages/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DriverOfflineMessagesValidation.exportValidation),
    ],
    handler: DriverOfflineMessagesController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/delete_account_reason_list/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserAccountDeleteReasonValidation.exportValidation),
    ],
    handler: UserDeleteAccountReasonController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/dining_category/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DiningCategoryValidation.exportValidation),
    ],
    handler: DiningCategoryController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/dining_cancel_reason/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DiningCancellationReasonValidation.exportValidation),
    ],
    handler: DiningCancellationReasonController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/dining_notice/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DiningNoticeValidation.exportValidation),
    ],
    handler: DiningNoticeController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/language/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(LanguageValidation.exportValidation),
    ],
    handler: LangaugeController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/user_avatar/export/:type',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportValidation),
    ],
    handler: UserAvatarController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/addons/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(AddonsValidation.exportValidation),
    ],
    handler: AddonsController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/food_taxation/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(FoodTaxationValidation.exportValidation),
    ],
    handler: FoodTaxationController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/subscription/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(SubscriptionValidation.exportValidation),
    ],
    handler: SubscriptionController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/subscriber/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(SubscriberValidation.exportValidation),
    ],
    handler: SubscriberController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/foods/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(FoodValidation.exportValidation),
    ],
    handler: FoodController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/feedback/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(FeedbackFormValidation.exportValidation),
    ],
    handler: FeedbackFormController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/report_emergency/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(ReportEmergencyValidation.exportValidation),
    ],
    handler: ReportEmergencyController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/wallet_bonus/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(WalletBonusValidation.exportValidation),
    ],
    handler: WalletBonusController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/customer/deleted_accounts/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportDeletedAccountValidation),
    ],
    handler: UserController.exportCollectionCustomerDeletedAccounts,
  });
  route({
    method: 'GET',
    url: '/restaurants/deleted_restaurants/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportDeletedAccountValidation),
    ],
    handler: UserController.exportCollectionRestaurantDeletedAccounts,
  });
  route({
    method: 'GET',
    url: '/deliveryman/deleted_deliveryman/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportDeletedAccountValidation),
    ],
    handler: UserController.exportCollectionDeliverymanDeletedAccounts,
  });
  route({
    method: 'GET',
    url: '/waiters/deleted_waiter/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportDeletedAccountValidation),
    ],
    handler: UserController.exportCollectionWaiterDeletedAccounts,
  });
  route({
    method: 'GET',
    url: '/kitchen/deleted_kitchen_owner/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportDeletedAccountValidation),
    ],
    handler: UserController.exportCollectionKitchenOwnerDeletedAccounts,
  });
  route({
    method: 'GET',
    url: '/medias/export/:type',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportValidation),
    ],
    handler: MediaController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/restaurant_campaign/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantCampaignValidation.exportValidation),
    ],
    handler: RestaurantCampaignController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/dining_campaign/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DiningCampaignValidation.exportValidation),
    ],
    handler: DiningCampaignController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/food_campaign/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(FoodCampaignValidation.exportValidation),
    ],
    handler: FoodCampaignController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/banners/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(BannersValidation.exportValidation),
    ],
    handler: BannersController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/coupon/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(CouponValidation.exportValidation),
    ],
    handler: CouponController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/dining_coupon/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DiningCouponValidation.exportValidation),
    ],
    handler: DiningCouponController.exportCollection,
  });
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
    url: '/complaints_reason/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(ComplaintsReasonValidation.exportValidation),
    ],
    handler: ComplaintsReasonController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/complaints/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.adminComplaintExportValidation),
    ],
    handler: ComplaintsController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/restaurant_complaints/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.adminRestaurantComplaintExportValidation),
    ],
    handler: RestaurantComplaintsController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/refund_request_reason/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(RefundRequestReasonValidation.exportValidation),
    ],
    handler: RefundRequestReasonController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/tiffin_subscription_refund_request_reason/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(TiffinSubscriptionRefundRequestReasonValidation.exportValidation),
    ],
    handler: TiffinSubscriptionRefundRequestReasonController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/dining_booking_refund_request_reason/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DiningBookingRefundRequestReasonValidation.exportValidation),
    ],
    handler: DiningBookingRefundRequestReasonController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/tiffin_subscription_cancel_reason/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(TiffinSubscriptionCancellationReasonValidation.exportValidation),
    ],
    handler: TiffinSubscriptionCancellationReasonController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/orders/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(OrdersValidation.exportValidation),
    ],
    handler: OrdersController.exportQueryCollection,
  });
  route({
    method: 'GET',
    url: '/unassigned_orders/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(OrdersValidation.exportUnassignedValidation),
    ],
    handler: OrdersController.exportUnAssignedOrderCollection,
  });
  route({
    method: 'GET',
    url: '/subscription_orders/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(OrdersValidation.exportUnassignedValidation),
    ],
    handler: OrdersController.exportSubscriptionOrderCollection,
  });
  route({
    method: 'GET',
    url: '/pos_orders/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(PosOrTableOrderValidation.exportValidation),
    ],
    handler: PosOrTableOrderController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/table_orders/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(TableOrderValidation.exportValidation),
    ],
    handler: TableOrderController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/tiffin_packages/export',
    preHandler: [
      webAuth('export_collection'),
      validate(SubscriptionTiffinPackageValidation.exportValidation),
    ],
    handler: SubscriptionTiffinPackageController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/dining_booking/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DiningBookingValidation.exportValidation),
    ],
    handler: DiningBookingController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/refund_request/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(RefundRequestValidation.exportValidation),
    ],
    handler: RefundRequestController.exportQueryCollection,
  });
  route({
    method: 'GET',
    url: '/tiffin_subscription_refund_request/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(TiffinSubscriptionRefundRequestValidation.exportValidation),
    ],
    handler: TiffinSubscriptionRefundRequestController.exportQueryCollection,
  });
  route({
    method: 'GET',
    url: '/dining_booking_refund_request/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DiningBookingRefundRequestValidation.exportValidation),
    ],
    handler: DiningBookingRefundRequestController.exportQueryCollection,
  });
  route({
    method: 'GET',
    url: '/system_deliveryman/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DriverValidation.exportValidation),
    ],
    handler: DriverController.exportSystemDeliverymanCollection,
  });
  route({
    method: 'GET',
    url: '/vendor_deliveryman/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DriverValidation.exportValidation),
    ],
    handler: DriverController.exportVendorDeliverymanCollection,
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
    url: '/restaurant_disbursement/export/:type/:status',
    preHandler: [
      webAuth('export_collection'),
      validate(DisbursementValidation.exportValidation),
    ],
    handler: DisbursementController.exportRestaurantCollection,
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
    url: '/expense/export/:type/:status',
    preHandler: [
      webAuth('export_collection'),
      validate(AdminExpenseValidation.exportValidation),
    ],
    handler: AdminExpenseController.exportQueryCollection,
  });
  route({
    method: 'GET',
    url: '/customer/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportCustomerValidation),
    ],
    handler: UserController.exportCustomerCollection,
  });
  route({
    method: 'GET',
    url: '/restaurant/filter/export/:type/:kind/:id',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantValidation.exportFilterValidation),
    ],
    handler: RestaurantController.exportRestaurantFilterTypeCollection,
  });
  route({
    method: 'GET',
    url: '/restaurant/filter_restaurant/export',
    preHandler: [
      webAuth('export_collection'),
      validate(RestaurantValidation.exportFilterQueryValidation),
    ],
    handler: RestaurantController.exportRestaurantFilterQueryCollection,
  });
  route({
    method: 'GET',
    url: '/driver/wallet_fund/export/:type/:query',
    preHandler: [
      webAuth('export_collection'),
      validate(DriverValidation.fundExportValidation),
    ],
    handler: DriverController.exportDeliverymanFundCollection,
  });
  route({
    method: 'GET',
    url: '/deliveryman_request/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(DeliverymanJoiningRequestValidation.exportValidation),
    ],
    handler: DeliverymanJoiningRequestController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/customer/wallet_fund/export/:type/:query',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportWalletFundValidation),
    ],
    handler: UserController.exportCustomerFundCollection,
  });
  route({
    method: 'GET',
    url: '/customer/loyalty_points/export',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.exportLoyalityPointsValidation),
    ],
    handler: LoyaltyPointsController.exportCollection,
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
    url: '/disbursement/deliveryman_report/export/:id/:type',
    preHandler: [
      webAuth('export_collection'),
      validate(DisbursementValidation.exportDisbursementReportValidation),
    ],
    handler: DisbursementController.exportDeliverymanDisbursementCollection,
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
      validate(OrdersValidation.exportOrderReportValidation),
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
  route({
    method: 'GET',
    url: '/tiffin_packages/purchased/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserPurchasedTiffinSubscriptionValidation.exportCollection),
    ],
    handler: UserPurchasedTiffinSubscriptionController.exportCollection,
  });
  route({
    method: 'GET',
    url: '/regular_chat_list/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.chatExportValidation),
    ],
    handler: ChatRoomController.exportChatListCollection,
  });
  route({
    method: 'GET',
    url: '/regular_chat_message/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.chatExportValidation),
    ],
    handler: ChatRoomController.exportChatMessageCollection,
  });

  route({
    method: 'GET',
    url: '/support_chat_list/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.chatExportValidation),
    ],
    handler: SupportChatRoomController.exportChatListCollection,
  });
  route({
    method: 'GET',
    url: '/support_chat_message/export/',
    preHandler: [
      webAuth('export_collection'),
      validate(UserValidation.chatExportValidation),
    ],
    handler: SupportChatRoomController.exportChatMessageCollection,
  });

  route({
    method: 'GET',
    url: '/download_import_sample/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.downloadImportValidation),
    ],
    handler: UserController.downloadImportFile,
  });
  route({
    method: 'POST',
    url: '/cities/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: CityController.importCollection,
  });
  route({
    method: 'POST',
    url: '/localities/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: LocalityController.importCollection,
  });
  route({
    method: 'POST',
    url: '/cuisine/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: CuisineController.importCollection,
  });
  route({
    method: 'POST',
    url: '/order_cancel_reason/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: OrderCancellationReasonController.importCollection,
  });
  route({
    method: 'POST',
    url: '/order_rating_message/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: OrderRatingMessageController.importCollection,
  });
  route({
    method: 'POST',
    url: '/invoice_instruction/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: InvoiceInstructionController.importCollection,
  });
  route({
    method: 'POST',
    url: '/restaurant_food_license/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: RestaurantFoodLicenseController.importCollection,
  });
  route({
    method: 'POST',
    url: '/restaurant_notice/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: RestaurantNoticeController.importCollection,
  });
  route({
    method: 'POST',
    url: '/delivery_instruction/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DeliveryInstructionController.importCollection,
  });
  route({
    method: 'POST',
    url: '/gratitude/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DeliveryGratitudeController.importCollection,
  });
  route({
    method: 'POST',
    url: '/driver_incentive/import_collection',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DriverIncentiveController.importCollection,
  });
  route({
    method: 'POST',
    url: '/driver_offline_messages/import_collection',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DriverOfflineMessagesController.importCollection,
  });
  route({
    method: 'POST',
    url: '/delete_account_reason/import_collection',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: UserDeleteAccountReasonController.importCollection,
  });
  route({
    method: 'POST',
    url: '/dining_category/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DiningCategoryController.importCollection,
  });
  route({
    method: 'POST',
    url: '/dining_cancel_reason/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DiningCancellationReasonController.importCollection,
  });
  route({
    method: 'POST',
    url: '/dining_notice/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DiningNoticeController.importCollection,
  });
  route({
    method: 'POST',
    url: '/language/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: LangaugeController.importCollection,
  });
  route({
    method: 'POST',
    url: '/user_avatar/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: UserAvatarController.importCollection,
  });
  route({
    method: 'POST',
    url: '/subscription/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: SubscriptionController.importCollection,
  });
  route({
    method: 'POST',
    url: '/subscriber/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: SubscriberController.importCollection,
  });
  route({
    method: 'POST',
    url: '/report_issue_list/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: ReportIssueRestaurantController.importCollection,
  });
  route({
    method: 'POST',
    url: '/report_issue_restaurant/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: ReportIssueRestaurantReasonController.importCollection,
  });
  route({
    method: 'POST',
    url: '/customer/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: UserController.importCollection,
  });
  route({
    method: 'POST',
    url: '/loyality_points/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: LoyaltyPointsController.importCollection,
  });
  route({
    method: 'POST',
    url: '/hidden_restaurant/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: HideRestaurantController.importCollection,
  });
  route({
    method: 'POST',
    url: '/hide_restaurant_reason/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: HideRestaurantReasonController.importCollection,
  });
  route({
    method: 'POST',
    url: '/restaurant_type/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: RestaurantTypeController.importCollection,
  });
  route({
    method: 'POST',
    url: '/restaurant_facilities/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: RestaurantFacilitiesController.importCollection,
  });
  route({
    method: 'POST',
    url: '/vehicle/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: VehicleController.importCollection,
  });
  route({
    method: 'POST',
    url: '/delivery_shift_schedule/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DeliveryShiftScheduleController.importCollection,
  });
  route({
    method: 'POST',
    url: '/auth_role/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importAuthRoleCollectionValidation),
    ],
    handler: UserController.importAuthRoleCollection,
  });
  route({
    method: 'POST',
    url: '/customer_wallet_fund/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: UserController.importCustomerWalletFundCollection,
  });
  route({
    method: 'POST',
    url: '/wallet_bonus/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: WalletBonusController.importCollection,
  });
  route({
    method: 'POST',
    url: '/refund_request_reason/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: RefundRequestReasonController.importCollection,
  });
  route({
    method: 'POST',
    url: '/tiffin_subscription_refund_request_reason/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: TiffinSubscriptionRefundRequestReasonController.importCollection,
  });
  route({
    method: 'POST',
    url: '/dining_booking_refund_request_reason/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DiningBookingRefundRequestReasonController.importCollection,
  });
  route({
    method: 'POST',
    url: '/complaints_reason/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: ComplaintsReasonController.importCollection,
  });
  route({
    method: 'POST',
    url: '/medias/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: MediaController.importCollection,
  });
  route({
    method: 'POST',
    url: '/addons/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: AddonsController.importCollection,
  });
  route({
    method: 'POST',
    url: '/category/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: CategoryController.importCollection,
  });
  route({
    method: 'POST',
    url: '/sub_category/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: SubCategoryController.importCollection,
  });
  route({
    method: 'POST',
    url: '/food_taxation/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: FoodTaxationController.importCollection,
  });
  route({
    method: 'POST',
    url: '/tiffin_subscription_cancel_reason/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: TiffinSubscriptionCancellationReasonController.importCollection,
  });
  route({
    method: 'POST',
    url: '/cash_collection/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: CollectCashController.importCollection,
  });
  route({
    method: 'POST',
    url: '/banners/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: BannersController.importCollection,
  });
  route({
    method: 'POST',
    url: '/deliveryman_wallet_fund/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: UserController.importDeliverymanWalletFundCollection,
  });
  route({
    method: 'POST',
    url: '/system_deliveryman/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DriverController.importSystemDeliverymanCollection,
  });
  route({
    method: 'POST',
    url: '/vendor_deliveryman/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DriverController.importVendorDeliverymanCollection,
  });
  route({
    method: 'POST',
    url: '/restaurant_waiters/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: WaiterController.importCollection,
  });
  route({
    method: 'POST',
    url: '/restaurant_kitchen_owner/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: KitchenOwnerController.importCollection,
  });
  route({
    method: 'POST',
    url: '/restaurants/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: RestaurantController.importRestaurantCollection,
  });
  route({
    method: 'POST',
    url: '/outlets/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: RestaurantController.importRestaurantOutletCollection,
  });
  route({
    method: 'POST',
    url: '/regular_chat_list/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: ChatRoomController.importChatListCollection,
  });
  route({
    method: 'POST',
    url: '/regular_chat_messages/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: ChatRoomController.importChatMessagesCollection,
  });
  route({
    method: 'POST',
    url: '/support_chat_list/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: SupportChatRoomController.importChatListCollection,
  });
  route({
    method: 'POST',
    url: '/support_chat_messages/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: SupportChatRoomController.importChatMessagesCollection,
  });
  route({
    method: 'POST',
    url: '/customer_complaints/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: ComplaintsController.importCollection,
  });
  route({
    method: 'POST',
    url: '/restaurant_complaints/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: RestaurantComplaintsController.importCollection,
  });
  route({
    method: 'POST',
    url: '/admin_expense/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: AdminExpenseController.importCollection,
  });
  route({
    method: 'POST',
    url: '/wallet_transactions/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: WalletController.importCollection,
  });
  route({
    method: 'POST',
    url: '/payment_transactions/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: PaymentInitiationController.importCollection,
  });
  route({
    method: 'POST',
    url: '/order_refund_request/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: RefundRequestController.importCollection,
  });
  route({
    method: 'POST',
    url: '/tiffin_refund_request/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: TiffinSubscriptionRefundRequestController.importCollection,
  });
  route({
    method: 'POST',
    url: '/dining_refund_request/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DiningBookingRefundRequestController.importCollection,
  });
  route({
    method: 'POST',
    url: '/order_coupon/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: CouponController.importCollection,
  });
  route({
    method: 'POST',
    url: '/dining_coupon/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DiningCouponController.importCollection,
  });
  route({
    method: 'POST',
    url: '/restaurant_campaign/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: RestaurantCampaignController.importCollection,
  });
  route({
    method: 'POST',
    url: '/dining_campaign/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DiningCampaignController.importCollection,
  });
  route({
    method: 'POST',
    url: '/food_campaign/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: FoodCampaignController.importCollection,
  });
  route({
    method: 'POST',
    url: '/dining_booking/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: DiningBookingController.importCollection,
  });
  route({
    method: 'POST',
    url: '/withdrawal_methods/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: WithdrawalMethodController.importCollection,
  });
  route({
    method: 'POST',
    url: '/tiffin_packages_list/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: SubscriptionTiffinPackageController.importCollection,
  });
  route({
    method: 'POST',
    url: '/tiffin_purchased_list/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: UserPurchasedTiffinSubscriptionController.importCollection,
  });
  route({
    method: 'POST',
    url: '/foods/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: FoodController.importCollection,
  });
  route({
    method: 'POST',
    url: '/regular_orders/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: OrdersController.importCollection,
  });
  route({
    method: 'POST',
    url: '/vendor_pos_order_list/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: PosOrTableOrderController.importCollection,
  });
  route({
    method: 'POST',
    url: '/vendor_table_order_list/import_collection/',
    preHandler: [
      webAuth('download_sample'),
      validate(UserValidation.importCollectionValidation),
    ],
    handler: TableOrderController.importCollection,
  });
  // Import & Export Routes //

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

  // Media Storage Setting Routes //
  route({
    method: 'GET',
    url: '/media_storage_setting/get',
    preHandler: [webAuth('media_storage_settings')],
    handler: MediaStorageSettingController.get,
  });
  route({
    method: 'POST',
    url: '/media_storage_setting/save',
    preHandler: [
      webAuth('media_storage_settings'),
      validate(MediaStorageSettingValidation.createOrUpdateSettings),
    ],
    handler: MediaStorageSettingController.create,
  });
  route({
    method: 'PATCH',
    url: '/media_storage_setting/update/:settingId',
    preHandler: [
      webAuth('media_storage_settings'),
      validate(MediaStorageSettingValidation.createOrUpdateSettings),
    ],
    handler: MediaStorageSettingController.update,
  });
  // Media Storage Setting Routes //

  // Landing Page Routes //
  route({
    method: 'GET',
    url: '/landing_page/get_content',
    preHandler: [webAuth('save_landing')],
    handler: LandingPageController.getContent,
  });
  route({
    method: 'POST',
    url: '/landing_page/save_hero_content',
    preHandler: [
      webAuth('save_landing'),
      validate(LandingPageValidation.heroValidation),
    ],
    handler: LandingPageController.saveHero,
  });
  route({
    method: 'POST',
    url: '/landing_page/save_service_content',
    preHandler: [
      webAuth('save_landing'),
      validate(LandingPageValidation.serviceValidation),
    ],
    handler: LandingPageController.saveService,
  });
  route({
    method: 'POST',
    url: '/landing_page/save_faqs_content',
    preHandler: [
      webAuth('save_landing'),
      validate(LandingPageValidation.faqsValidation),
    ],
    handler: LandingPageController.saveFaqs,
  });
  route({
    method: 'POST',
    url: '/landing_page/save_review_content',
    preHandler: [
      webAuth('save_landing'),
      validate(LandingPageValidation.reviewValidation),
    ],
    handler: LandingPageController.saveReview,
  });
  route({
    method: 'POST',
    url: '/landing_page/save_scan_qr_content',
    preHandler: [
      webAuth('save_landing'),
      validate(LandingPageValidation.scanQrValidation),
    ],
    handler: LandingPageController.saveScanQr,
  });
  route({
    method: 'POST',
    url: '/landing_page/save_app_feature_content',
    preHandler: [
      webAuth('save_landing'),
      validate(LandingPageValidation.appFeatureValidation),
    ],
    handler: LandingPageController.saveAppFeatures,
  });
  route({
    method: 'POST',
    url: '/landing_page/save_feature_content',
    preHandler: [
      webAuth('save_landing'),
      validate(LandingPageValidation.projectFeatureValidation),
    ],
    handler: LandingPageController.saveFeatures,
  });
  // Landing Page Routes //
};
