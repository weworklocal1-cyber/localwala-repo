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


const PublicValidation = require('../../validations/public.validation');
const EmailConfigValidation = require('../../validations/email.config.validation');
const AppPageValidation = require('../../validations/app.pages.validation');
const FoodCampaignValidation = require('../../validations/food.campaign.validation');
const RestaurantCampaignValidation = require('../../validations/restaurant.campaign.validation');
const FoodValidation = require('../../validations/food.validation');
const PaymentInitiationValidation = require('../../validations/payment.initiation.validation');
const PushNotificationTokenValidation = require('../../validations/push.notification.token.validation');
const AuthValidation = require('../../validations/auth.validation');
const SubscriptionTiffinPackageValidation = require('../../validations/subscription.tiffin.packages.validation');
const DiningCampaignValidation = require('../../validations/dining.campaign.validation');
const FeedbackFormValidation = require('../../validations/feedback.form.validation');
const ReportEmergencyValidation = require('../../validations/report.emergency.form.validation');
const CartItemValidation = require('../../validations/cart.item.validation');
const RestaurantJoiningRequestValidation = require('../../validations/restaurant.joining.request.validation');
const DeliverymanJoiningRequestValidation = require('../../validations/deliveryman.joining.request.validation');
const SmsProviderConfigValidation = require('../../validations/sms.provider.config.validation');
const RestaurantValidation = require('../../validations/restaurant.validation');
const TableOrderCartItemValidation = require('../../validations/table.order.cart.item.validation');

const PublicController = require('../../controllers/public.controller');
const LocalityController = require('../../controllers/locality.controller');
const RestaurantController = require('../../controllers/restaurant.controller');
const BusinessSettingsController = require('../../controllers/business.settings.controller');
const EmailConfigController = require('../../controllers/email.config.controller');
const AppPageController = require('../../controllers/app.pages.controller');
const FoodCampaignController = require('../../controllers/food.campaign.controller');
const RestaurantCampaignController = require('../../controllers/restaurant.campaign.controller');
const FoodController = require('../../controllers/food.controller');
const PaymentInitiationController = require('../../controllers/payment.initiation.controller');
const PushNotificationTokenController = require('../../controllers/push.notification.token.controller');
const AuthController = require('../../controllers/auth.controller');
const ReviewRatingController = require('../../controllers/review.ratings.controller');
const SubscriptionTiffinPackageController = require('../../controllers/subscription.tiffin.package.controller');
const DiningCampaignController = require('../../controllers/dining.campaign.controller');
const FeedbackFormController = require('../../controllers/feedback.form.controller');
const ReportEmergencyController = require('../../controllers/report.emergency.form.controller');
const CartItemController = require('../../controllers/cart.item.controller');
const FileController = require('../../controllers/file.controller');
const CuisineController = require('../../controllers/cuisine.controller');
const RestaurantTypeController = require('../../controllers/restaurant.type.controller');
const RestaurantFacilitiesController = require('../../controllers/restaurant.facilities.controller');
const RestaurantJoiningRequestController = require('../../controllers/restaurant.joining.request.controller');
const DriverController = require('../../controllers/driver.controller');
const DeliverymanJoiningRequestController = require('../../controllers/deliveryman.joining.request.controller');
const TableOrderCartItemController = require('../../controllers/table.order.cart.item.controller');
const LandingPageController = require('../../controllers/landing.page.controller');

const validate = require('../../middlewares/validate');

module.exports.register = function register(route) {
  // Settings Routes //
  route({
    method: 'POST',
    url: '/getDefaultSettings/',
    preHandler: [validate(PublicValidation.visitorTrackingValidation)],
    handler: PublicController.getDefaultSettings,
  });
  route({
    method: 'GET',
    url: '/get_web_settings/',
    handler: PublicController.getDefaultWebSettings,
  });
  route({
    method: 'GET',
    url: '/getVendorSettings',
    handler: BusinessSettingsController.getVendorSettings,
  });
  route({
    method: 'GET',
    url: '/getDriverSettings',
    handler: PublicController.getDriverDefaultSettings,
  });
  route({
    method: 'GET',
    url: '/getWaiterSettings',
    handler: PublicController.getWaiterDefaultSettings,
  });
  route({
    method: 'GET',
    url: '/getKitchenSetting',
    handler: PublicController.getKitchenDefaultSettings,
  });
  route({
    method: 'GET',
    url: '/customer_header_content',
    handler: PublicController.publicHeaderContent,
  });
  // Settings Routes //

  // Restaurant Routes //
  route({
    method: 'POST',
    url: '/restaurant/near',
    preHandler: [validate(PublicValidation.nearMeRestaurants)],
    handler: RestaurantController.getNearMeRestaurants,
  });
  route({
    method: 'POST',
    url: '/restaurant/find_with_cuisine/',
    preHandler: [validate(PublicValidation.restaurantsByCuisine)],
    handler: RestaurantController.getRestaurantsByCuisine,
  });
  route({
    method: 'POST',
    url: '/restaurant/find_with_category/',
    preHandler: [validate(PublicValidation.restaurantsByCategory)],
    handler: RestaurantController.getRestaurantsByCategory,
  });
  route({
    method: 'POST',
    url: '/restaurant/find_with_brands/',
    preHandler: [validate(PublicValidation.restaurantsByBrands)],
    handler: RestaurantController.getRestaurantsByBrand,
  });
  route({
    method: 'POST',
    url: '/restaurant/get_restaurant_info/',
    preHandler: [validate(PublicValidation.getRestaurantInfo)],
    handler: RestaurantController.getRestaurantsInfo,
  });
  route({
    method: 'POST',
    url: '/restaurant/find_with_localities/',
    preHandler: [validate(PublicValidation.restaurantsByLocalities)],
    handler: RestaurantController.getRestaurantsByLocalities,
  });
  route({
    method: 'POST',
    url: '/dining_restaurant/near',
    preHandler: [validate(PublicValidation.nearMeDiningRestaurants)],
    handler: RestaurantController.getNearMeDiningRestaurants,
  });
  route({
    method: 'POST',
    url: '/dining_restaurant/near_on_map',
    preHandler: [validate(PublicValidation.nearMeDiningRestaurantOnMap)],
    handler: RestaurantController.getNearMeDiningRestaurantOnMap,
  });
  route({
    method: 'POST',
    url: '/campaign/dining_campaign/:campaignId/',
    preHandler: [validate(DiningCampaignValidation.infoValidation)],
    handler: DiningCampaignController.getDiningCampaign,
  });
  route({
    method: 'POST',
    url: '/dining_restaurant/find_with_category',
    preHandler: [validate(PublicValidation.diningByCategory)],
    handler: RestaurantController.getDiningByCategory,
  });
  route({
    method: 'POST',
    url: '/restaurant/detail_information/',
    preHandler: [validate(PublicValidation.restaurantDetailInformation)],
    handler: RestaurantController.getRestaurantDetailInformation,
  });
  // Restaurant Routes //

  // Cart Item Routes //
  route({
    method: 'POST',
    url: '/cart/addToCart/',
    preHandler: [validate(CartItemValidation.addItemToCartValidation)],
    handler: CartItemController.addToCart,
  });
  route({
    method: 'POST',
    url: '/cart/removeCartItemByRestaurant/',
    preHandler: [validate(CartItemValidation.removeCartItemByRestaurantValidation)],
    handler: CartItemController.removeCartItemByRestaurant,
  });
  route({
    method: 'DELETE',
    url: '/cart/removeCartItemByTracking/:trackingId',
    preHandler: [validate(CartItemValidation.removeCartItemByTrackingValidation)],
    handler: CartItemController.removeCartItemByTrackingId,
  });
  route({
    method: 'POST',
    url: '/cart/removeFromCartWithUuid/',
    preHandler: [validate(CartItemValidation.removeFromCartWithUuidValidation)],
    handler: CartItemController.removeFromCartWithUuid,
  });
  route({
    method: 'POST',
    url: '/cart/removeFromCartWithFoodId/',
    preHandler: [validate(CartItemValidation.removeFromCartWithFoodIdValidation)],
    handler: CartItemController.removeFromCartWithFoodId,
  });
  route({
    method: 'POST',
    url: '/cart/updateFoodQuantity/',
    preHandler: [validate(CartItemValidation.updateFoodQuantityValidation)],
    handler: CartItemController.updateFoodQuantity,
  });
  route({
    method: 'POST',
    url: '/cart/updateFoodVariationQuantity/',
    preHandler: [validate(CartItemValidation.updateFoodVariationQuantityValidation)],
    handler: CartItemController.updateFoodVariationQuantity,
  });
  // Cart Item Routes //

  // Search Routes //
  route({
    method: 'POST',
    url: '/search/global/initial/',
    preHandler: [validate(PublicValidation.globalSearchInitial)],
    handler: RestaurantController.globalSearchInitial,
  });
  route({
    method: 'POST',
    url: '/search/global_dining/initial/',
    preHandler: [validate(PublicValidation.globalSearchInitial)],
    handler: RestaurantController.globalDiningSearchInitial,
  });
  route({
    method: 'POST',
    url: '/search/global/',
    preHandler: [validate(PublicValidation.globalSearch)],
    handler: RestaurantController.globalSearch,
  });
  route({
    method: 'POST',
    url: '/search/global_dining/',
    preHandler: [validate(PublicValidation.globalSearch)],
    handler: RestaurantController.globalDiningSearch,
  });
  route({
    method: 'POST',
    url: '/search/food/initial',
    preHandler: [validate(PublicValidation.foodSearchInitial)],
    handler: RestaurantController.foodSearchInitial,
  });
  route({
    method: 'POST',
    url: '/search/food/',
    preHandler: [validate(PublicValidation.foodSearch)],
    handler: RestaurantController.foodSearch,
  });
  // Search Routes //

  // Foods Routes //
  route({
    method: 'POST',
    url: '/foods/find_foods_with_category/',
    preHandler: [validate(PublicValidation.restaurantsFoodsByCategory)],
    handler: RestaurantController.getFoodsNearMeByCategory,
  });
  route({
    method: 'POST',
    url: '/foods/single_food/',
    preHandler: [validate(FoodValidation.singleFoodInfoValidation)],
    handler: FoodController.getSingleFoodInfo,
  });
  // Foods Routes //

  // Pages Routes //
  route({
    method: 'GET',
    url: '/app_pages/content/:slug',
    preHandler: [validate(AppPageValidation.idValidation)],
    handler: AppPageController.getContent,
  });
  route({
    method: 'GET',
    url: '/app_pages/getContent/:slug',
    preHandler: [validate(AppPageValidation.idValidation)],
    handler: AppPageController.getPageContent,
  });
  // Pages Routes //

  // Campaign Routes //
  route({
    method: 'POST',
    url: '/campaign/food_campaign/:campaignId/',
    preHandler: [validate(FoodCampaignValidation.contentValidation)],
    handler: FoodCampaignController.getFoodCampaign,
  });
  route({
    method: 'POST',
    url: '/campaign/restaurant_campaign/:campaignId/',
    preHandler: [validate(RestaurantCampaignValidation.infoValidation)],
    handler: RestaurantCampaignController.getRestaurantCampaign,
  });
  // Campaign Routes //

  // Test Routes ///
  route({
    method: 'GET',
    url: '/email_config/userEmailVerification/:email/:locale',
    preHandler: [validate(EmailConfigValidation.demoTestValidation)],
    handler: EmailConfigController.sendVerificationEmail,
  });
  // Test Route ///

  // Payment Routes //
  route({
    method: 'GET',
    url: '/payments/makePayment/:id',
    preHandler: [validate(PaymentInitiationValidation.idValidation)],
    handler: PaymentInitiationController.makePayment,
  });
  route({
    method: 'GET',
    url: '/payments/paid_success/:id',
    preHandler: [validate(PaymentInitiationValidation.idValidation)],
    handler: PaymentInitiationController.successPayment,
  });
  route({
    method: 'POST',
    url: '/payments/paid_success/:id',
    preHandler: [validate(PaymentInitiationValidation.idValidation)],
    handler: PaymentInitiationController.successPayment,
  });
  route({
    method: 'GET',
    url: '/payments/payment_processed/',
    handler: PaymentInitiationController.paymentProcessed,
  });
  route({
    method: 'GET',
    url: '/payments/payment_repeated/',
    handler: PaymentInitiationController.repeatedPayment,
  });
  route({
    method: 'GET',
    url: '/payments/paid_failed/:id',
    preHandler: [validate(PaymentInitiationValidation.idValidation)],
    handler: PaymentInitiationController.failedPayment,
  });
  // Payment Routes //

  // Push Notification Tokens
  route({
    method: 'POST',
    url: '/pushTokens/save',
    preHandler: [validate(PushNotificationTokenValidation.saveTokenValidation)],
    handler: PushNotificationTokenController.save,
  });
  route({
    method: 'POST',
    url: '/pushTokens/update',
    preHandler: [validate(PushNotificationTokenValidation.saveTokenValidation)],
    handler: PushNotificationTokenController.update,
  });
  // Push Notification Tokens

  // Web OTP Verification //
  route({
    method: 'GET',
    url: '/verification/otp/:locale/:id',
    preHandler: [validate(AuthValidation.verifyWebSMSOTPValidation)],
    handler: AuthController.verifyWebSMSOTP,
  });
  route({
    method: 'GET',
    url: '/verification/otp_web_version/:id',
    preHandler: [validate(AuthValidation.verifyWebVersionSMSOTPValidation)],
    handler: AuthController.verifyWebVersionSMSOTP,
  });
  route({
    method: 'GET',
    url: '/verification/otp_web_reset_password_version/',
    preHandler: [validate(AuthValidation.verifyWebVersionSMSOTPValidation)],
    handler: AuthController.verifyWebVersionResetPasswordSMSOTP,
  });
  route({
    method: 'GET',
    url: '/verification/firebase_otp_web_version/',
    preHandler: [validate(AuthValidation.verifyFirebaseWebVersionSMSOTPValidation)],
    handler: AuthController.verifyFirebaseWebVersionSMSOTP,
  });
  route({
    method: 'GET',
    url: '/verification/firebase_reset_password_otp_web_version/',
    preHandler: [validate(AuthValidation.verifyFirebaseWebVersionSMSOTPValidation)],
    handler: AuthController.verifyFirebaseWebVersionResetPasswordSMSOTP,
  });
  route({
    method: 'GET',
    url: '/otp/verify/:id',
    preHandler: [validate(AuthValidation.verificationIdValidation)],
    handler: AuthController.smsVerification,
  });
  route({
    method: 'GET',
    url: '/otp/verify_web/:id',
    preHandler: [validate(AuthValidation.smsVerificationWebValidation)],
    handler: AuthController.smsWebVersionVerification,
  });
  route({
    method: 'GET',
    url: '/otp/verify_reset_password_web/',
    preHandler: [validate(AuthValidation.smsVerificationWebValidation)],
    handler: AuthController.smsWebVersionResetPasswordVerification,
  });
  route({
    method: 'GET',
    url: '/otp/success/:id',
    preHandler: [validate(AuthValidation.verificationIdValidation)],
    handler: AuthController.smsVerificationSuccess,
  });
  route({
    method: 'GET',
    url: '/otp/failed/:id',
    preHandler: [validate(AuthValidation.verificationIdValidation)],
    handler: AuthController.smsVerificationFailed,
  });
  // Web OTP Verification //

  // Review Ratings Routes //
  route({
    method: 'POST',
    url: '/restaurant/reviews',
    preHandler: [validate(PublicValidation.restaurantReview)],
    handler: ReviewRatingController.getRestaurantReview,
  });
  route({
    method: 'POST',
    url: '/food/reviews',
    preHandler: [validate(PublicValidation.foodReview)],
    handler: ReviewRatingController.getFoodReview,
  });
  // Review Ratings Routes //

  // Subscription Tiffin Package Routes //
  route({
    method: 'GET',
    url: '/tiffin_packages/info/:id/',
    preHandler: [validate(SubscriptionTiffinPackageValidation.getDetailValidation)],
    handler: SubscriptionTiffinPackageController.getSubscriptionPackageDetailCustomer,
  });
  route({
    method: 'POST',
    url: '/tiffin_packages/from_restaurant/',
    preHandler: [validate(SubscriptionTiffinPackageValidation.getSubscriptionPackageFromVendorValidation)],
    handler: SubscriptionTiffinPackageController.getSubscriptionPackageFromVendor,
  });
  // Subscription Tiffin Package Routes //

  /// Dining Booking Routes ///
  route({
    method: 'POST',
    url: '/dining_booking/info/',
    preHandler: [validate(PublicValidation.diningBookingInformationValidation)],
    handler: RestaurantController.getDiningBookingInformation,
  });

  /// Dining Booking Routes ///

  ///  Phone Call Routes ///
  route({
    method: 'GET',
    url: '/restaurant/call/:restaurant',
    preHandler: [validate(PublicValidation.fetchRestaurantCallNumberValidation)],
    handler: RestaurantController.fetchResturantPhoneNumber,
  });
  ///  Phone Call Routes ///

  // Feedback Form Routes //
  route({
    method: 'POST',
    url: '/feedback_form/save/',
    preHandler: [validate(FeedbackFormValidation.saveFeedback)],
    handler: FeedbackFormController.saveFeedback,
  });
  route({
    method: 'POST',
    url: '/report_emergency/save/',
    preHandler: [validate(ReportEmergencyValidation.saveReportEmergencyValidation)],
    handler: ReportEmergencyController.saveReportEmergency,
  });
  // Feedback Form Routes //

  // Locality Routes //
  route({
    method: 'GET',
    url: '/localities_from_city/:id',
    preHandler: [validate(PublicValidation.cityValidation)],
    handler: LocalityController.getLocalitiesList,
  });
  // Locality Routes //

  // Restaurant Register Request Routes //
  route({
    method: 'GET',
    url: '/register/getBasicDataRestaurantRequest',
    handler: RestaurantController.getBasicDataRegisterRequest,
  });
  route({
    method: 'GET',
    url: '/register/restaurant_web_self_register_detail',
    handler: RestaurantController.getBasicDataRegisterRequestWeb,
  });
  route({
    method: 'GET',
    url: '/restaurant/activeCuisine/',
    handler: CuisineController.getActiveCuisine,
  });
  route({
    method: 'GET',
    url: '/restaurant/activeType/',
    handler: RestaurantTypeController.getActiveRestaurantType,
  });
  route({
    method: 'GET',
    url: '/restaurant/activeFacility/',
    handler: RestaurantFacilitiesController.getActiveFacilities,
  });
  route({
    method: 'POST',
    url: '/uploadImage',
    handler: FileController.uploadImage,
  });
  route({
    method: 'POST',
    url: '/restaurant_joining/request/',
    preHandler: [validate(RestaurantJoiningRequestValidation.createRequestValidation)],
    handler: RestaurantJoiningRequestController.createRequest,
  });
  // Restaurant Register Request Routes //

  // Deliveryman Register Request Routes //
  route({
    method: 'GET',
    url: '/deliveryman_joining/getBasicDataDeliverymanRequest',
    handler: DriverController.getBasicDataRegisterRequest,
  });
  route({
    method: 'POST',
    url: '/deliveryman_joining/request/',
    preHandler: [validate(DeliverymanJoiningRequestValidation.createRequestValidation)],
    handler: DeliverymanJoiningRequestController.createRequest,
  });
  // Deliveryman Register Request Routes //

  // Firebase Auth Test //
  route({
    method: 'GET',
    url: '/sms_provider/demo_firebase/',
    preHandler: [validate(SmsProviderConfigValidation.firebaseWebDemoValidation)],
    handler: AuthController.adminDemoFirebaseSMS,
  });
  // Firebase Auth Test //
  // MSG91 Auth Test //
  route({
    method: 'GET',
    url: '/sms_provider/demo_msg91/',
    preHandler: [validate(SmsProviderConfigValidation.firebaseWebDemoValidation)],
    handler: AuthController.adminDemoMSG91SMS,
  });
  // MSG91 Auth Test //

  // Customer Table Order Menu Routes //
  route({
    method: 'GET',
    url: '/qr_code_menu/:restaurant/:table',
    preHandler: [validate(RestaurantValidation.userTableQrMenuValidation)],
    handler: RestaurantController.userTableQrMenu,
  });
  route({
    method: 'POST',
    url: '/qr_code_menu/add_to_cart/',
    preHandler: [validate(TableOrderCartItemValidation.customerAddItemToCartValidation)],
    handler: TableOrderCartItemController.customerAddItemToCart,
  });
  // Customer Table Order Menu Routes //

  // Landing Page Routes //
  route({
    method: 'GET',
    url: '/landing_page/get_content',
    handler: LandingPageController.getContent,
  });
  // Landing Page Routes //
};
