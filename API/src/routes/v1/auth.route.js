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

const validate = require('../../middlewares/validate');
const AuthValidation = require('../../validations/auth.validation');
const AuthController = require('../../controllers/auth.controller');

module.exports.register = function register(route) {
  route({
    method: 'POST',
    url: '/verifyAccount',
    preHandler: [validate(AuthValidation.userRegister)],
    handler: AuthController.verifyUserRegisterAccount,
  });
  route({
    method: 'POST',
    url: '/verifyOTP',
    preHandler: [validate(AuthValidation.verifyOTP)],
    handler: AuthController.verifyOTP,
  });
  route({
    method: 'GET',
    url: '/resendOTP/:id',
    preHandler: [validate(AuthValidation.resendOTP)],
    handler: AuthController.resendOTP,
  });
  route({
    method: 'POST',
    url: '/register-user-account',
    preHandler: [validate(AuthValidation.userRegister)],
    handler: AuthController.register,
  });
  route({
    method: 'POST',
    url: '/register-user-account-firebase',
    preHandler: [validate(AuthValidation.userRegisterFirebaseVerification)],
    handler: AuthController.registerFirebaseAccount,
  });
  route({
    method: 'POST',
    url: '/register-admin-account',
    preHandler: [validate(AuthValidation.registerAdmin)],
    handler: AuthController.registerAdminAccount,
  });
  route({
    method: 'POST',
    url: '/customer/login',
    preHandler: [validate(AuthValidation.loginWithEmailPassword)],
    handler: AuthController.userLoginWithEmailAndPassword,
  });
  route({
    method: 'POST',
    url: '/customer/login_cmp',
    preHandler: [validate(AuthValidation.loginWithCountryCodeAndMobilePassword)],
    handler: AuthController.userLoginWithCountryCodeAndMobilePassword,
  });
  route({
    method: 'POST',
    url: '/customer/login_eo_verification',
    preHandler: [validate(AuthValidation.emailOtpValidation)],
    handler: AuthController.userLoginWithEmailOtpVerification,
  });
  route({
    method: 'POST',
    url: '/customer/login_eo',
    preHandler: [validate(AuthValidation.loginWithEmailOTPValidation)],
    handler: AuthController.userLoginWithEmailOtp,
  });
  route({
    method: 'POST',
    url: '/customer/login_po_verification',
    preHandler: [validate(AuthValidation.phoneOtpValidation)],
    handler: AuthController.userLoginWithPhoneOtpVerification,
  });
  route({
    method: 'POST',
    url: '/customer/login_po/',
    preHandler: [validate(AuthValidation.userLoginWithPhoneOTPValidation)],
    handler: AuthController.userLoginWithPhoneOTP,
  });
  route({
    method: 'POST',
    url: '/customer/login_po_firebase',
    preHandler: [validate(AuthValidation.userLoginWithFirebasePhoneOTPValidation)],
    handler: AuthController.verifyUserLoginFirebaseOTP,
  });
  route({
    method: 'POST',
    url: '/customer/login_with_google_account/',
    preHandler: [validate(AuthValidation.googleLoginValidation)],
    handler: AuthController.userLoginWithGoogleAccount,
  });
  route({
    method: 'POST',
    url: '/customer/check_mobile_exist/',
    preHandler: [validate(AuthValidation.checkMobileNumberExistValidation)],
    handler: AuthController.checkMobileNumberExist,
  });
  route({
    method: 'POST',
    url: '/customer/create_google_user_account/',
    preHandler: [validate(AuthValidation.registerGoogleAccountValidation)],
    handler: AuthController.createGoogleUserAccount,
  });
  route({
    method: 'POST',
    url: '/customer/login_with_facebook_account/',
    preHandler: [validate(AuthValidation.facebookLoginValidation)],
    handler: AuthController.userLoginWithFacebookAccount,
  });
  route({
    method: 'POST',
    url: '/customer/create_facebook_user_account/',
    preHandler: [validate(AuthValidation.registerFacebookAccountValidation)],
    handler: AuthController.createFacebookUserAccount,
  });
  route({
    method: 'POST',
    url: '/admin/login',
    preHandler: [validate(AuthValidation.loginWithEmailPassword)],
    handler: AuthController.adminLoginWithEmailAndPassword,
  });
  route({
    method: 'POST',
    url: '/vendor/login',
    preHandler: [validate(AuthValidation.loginWithEmailPassword)],
    handler: AuthController.vendorLoginWithEmailAndPassword,
  });
  route({
    method: 'POST',
    url: '/vendor_web/login',
    preHandler: [validate(AuthValidation.loginWithEmailPassword)],
    handler: AuthController.vendorWebLoginWithEmailAndPassword,
  });
  route({
    method: 'POST',
    url: '/vendor/login_cmp',
    preHandler: [validate(AuthValidation.loginWithCountryCodeAndMobilePassword)],
    handler: AuthController.vendorLoginWithCountryCodeAndMobilePassword,
  });
  route({
    method: 'POST',
    url: '/vendor/login_cmp_web',
    preHandler: [validate(AuthValidation.loginWithCountryCodeAndMobilePassword)],
    handler: AuthController.vendorWebLoginWithCountryCodeAndMobilePassword,
  });
  route({
    method: 'POST',
    url: '/vendor/login_eo_verification',
    preHandler: [validate(AuthValidation.emailOtpValidation)],
    handler: AuthController.vendorLoginWithEmailOtpVerification,
  });
  route({
    method: 'POST',
    url: '/vendor/login_eo',
    preHandler: [validate(AuthValidation.loginWithEmailOTPValidation)],
    handler: AuthController.vendorLoginWithEmailOtp,
  });
  route({
    method: 'POST',
    url: '/vendor/login_eo_web',
    preHandler: [validate(AuthValidation.loginWithEmailOTPValidation)],
    handler: AuthController.vendorWebLoginWithEmailOtp,
  });
  route({
    method: 'POST',
    url: '/vendor/login_po_verification',
    preHandler: [validate(AuthValidation.phoneOtpValidation)],
    handler: AuthController.vendorLoginWithPhoneOtpVerification,
  });
  route({
    method: 'POST',
    url: '/vendor/login_po_web_verification',
    preHandler: [validate(AuthValidation.phoneOtpWebValidation)],
    handler: AuthController.vendorWebLoginWithPhoneOtpVerification,
  });
  route({
    method: 'POST',
    url: '/vendor/login_po/',
    preHandler: [validate(AuthValidation.userLoginWithPhoneOTPValidation)],
    handler: AuthController.vendorLoginWithPhoneOTP,
  });
  route({
    method: 'POST',
    url: '/vendor/login_po_web/',
    preHandler: [validate(AuthValidation.userLoginWithPhoneOTPValidation)],
    handler: AuthController.vendorWebLoginWithPhoneOTP,
  });
  route({
    method: 'POST',
    url: '/vendor/login_po_firebase/',
    preHandler: [validate(AuthValidation.userLoginWithFirebasePhoneOTPValidation)],
    handler: AuthController.verifyVendorLoginFirebaseOTP,
  });
  route({
    method: 'POST',
    url: '/vendor/login_po_firebase_web/',
    preHandler: [validate(AuthValidation.userWebLoginWithFirebasePhoneOTPValidation)],
    handler: AuthController.verifyWebVendorLoginFirebaseOTP,
  });
  route({
    method: 'POST',
    url: '/vendor/login_with_google_account/',
    preHandler: [validate(AuthValidation.googleLoginValidation)],
    handler: AuthController.vendorLoginWithGoogleAccount,
  });
  route({
    method: 'POST',
    url: '/vendor/login_with_facebook_account/',
    preHandler: [validate(AuthValidation.facebookLoginValidation)],
    handler: AuthController.vendorLoginWithFacebookAccount,
  });
  route({
    method: 'POST',
    url: '/driver/login',
    preHandler: [validate(AuthValidation.loginWithEmailPassword)],
    handler: AuthController.driverLognWithEmailAndPassword,
  });
  route({
    method: 'POST',
    url: '/driver/login_cmp',
    preHandler: [validate(AuthValidation.loginWithCountryCodeAndMobilePassword)],
    handler: AuthController.driverLoginWithCountryCodeAndMobilePassword,
  });
  route({
    method: 'POST',
    url: '/driver/login_eo_verification',
    preHandler: [validate(AuthValidation.emailOtpValidation)],
    handler: AuthController.driverLoginWithEmailOtpVerification,
  });
  route({
    method: 'POST',
    url: '/driver/login_eo',
    preHandler: [validate(AuthValidation.loginWithEmailOTPValidation)],
    handler: AuthController.driverLoginWithEmailOtp,
  });
  route({
    method: 'POST',
    url: '/driver/login_po_verification',
    preHandler: [validate(AuthValidation.phoneOtpValidation)],
    handler: AuthController.driverLoginWithPhoneOtpVerification,
  });
  route({
    method: 'POST',
    url: '/driver/login_po/',
    preHandler: [validate(AuthValidation.userLoginWithPhoneOTPValidation)],
    handler: AuthController.driverLoginWithPhoneOTP,
  });
  route({
    method: 'POST',
    url: '/driver/login_po_firebase',
    preHandler: [validate(AuthValidation.userLoginWithFirebasePhoneOTPValidation)],
    handler: AuthController.verifyDriverLoginFirebaseOTP,
  });
  route({
    method: 'POST',
    url: '/driver/login_with_google_account/',
    preHandler: [validate(AuthValidation.googleLoginValidation)],
    handler: AuthController.driverLoginWithGoogleAccount,
  });
  route({
    method: 'POST',
    url: '/driver/login_with_facebook_account/',
    preHandler: [validate(AuthValidation.facebookLoginValidation)],
    handler: AuthController.driverLoginWithFacebookAccount,
  });
  route({
    method: 'GET',
    url: '/register_guest_account/:agent/:locale',
    preHandler: [validate(AuthValidation.createGuestAccount)],
    handler: AuthController.createGuestAccount,
  });
  route({
    method: 'POST',
    url: '/logout',
    preHandler: [validate(AuthValidation.logout)],
    handler: AuthController.logout,
  });
  route({
    method: 'POST',
    url: '/logout_web',
    handler: AuthController.logoutWeb,
  });
  route({
    method: 'POST',
    url: '/refresh-tokens-web',
    handler: AuthController.refreshTokensWeb,
  });
  route({
    method: 'POST',
    url: '/refresh-tokens-app',
    preHandler: [validate(AuthValidation.refreshTokens)],
    handler: AuthController.refreshTokensApp,
  });
  route({
    method: 'POST',
    url: '/forgot-password-email',
    preHandler: [validate(AuthValidation.forgotPasswordWithEmail)],
    handler: AuthController.forgotPasswordWithEmail,
  });
  route({
    method: 'POST',
    url: '/forgot-password-phone',
    preHandler: [validate(AuthValidation.forgotPasswordWithPhone)],
    handler: AuthController.forgotPasswordWithPhone,
  });
  route({
    method: 'POST',
    url: '/forgot-password-phone-web',
    preHandler: [validate(AuthValidation.forgotWebPasswordWithPhone)],
    handler: AuthController.forgotWebPasswordWithPhone,
  });
  route({
    method: 'POST',
    url: '/reset-password',
    preHandler: [validate(AuthValidation.resetPassword)],
    handler: AuthController.resetPassword,
  });
  route({
    method: 'POST',
    url: '/reset-web-password',
    preHandler: [validate(AuthValidation.resetPasswordWeb)],
    handler: AuthController.resetWebPassword,
  });
  route({
    method: 'POST',
    url: '/reset-password-firebase',
    preHandler: [validate(AuthValidation.resetPasswordFirebase)],
    handler: AuthController.resetPasswordFirebase,
  });
  route({
    method: 'POST',
    url: '/reset-password-firebase-web',
    preHandler: [validate(AuthValidation.resetPasswordFirebaseWeb)],
    handler: AuthController.resetFirebaseWebPassword,
  });
  route({
    method: 'POST',
    url: '/verify-email',
    preHandler: [validate(AuthValidation.verifyEmail)],
    handler: AuthController.verifyEmail,
  });
  route({
    method: 'GET',
    url: '/installations',
    handler: AuthController.isAdminSetupDone,
  });
  route({
    method: 'POST',
    url: '/check-register-status',
    preHandler: [validate(AuthValidation.checkRegisterStatusValidation)],
    handler: AuthController.checkUserRegisterStatus,
  });

  // Waiter Auth //
  route({
    method: 'POST',
    url: '/waiter/login',
    preHandler: [validate(AuthValidation.loginWithEmailPassword)],
    handler: AuthController.waiterLognWithEmailAndPassword,
  });
  route({
    method: 'POST',
    url: '/waiter/login_cmp',
    preHandler: [validate(AuthValidation.loginWithCountryCodeAndMobilePassword)],
    handler: AuthController.waiterLoginWithPhoneAndPassword,
  });
  route({
    method: 'POST',
    url: '/waiter/login_eo_verification',
    preHandler: [validate(AuthValidation.emailOtpValidation)],
    handler: AuthController.waiterLoginWithEmailOtpVerification,
  });
  route({
    method: 'POST',
    url: '/waiter/login_eo',
    preHandler: [validate(AuthValidation.loginWithEmailOTPValidation)],
    handler: AuthController.waiterLoginWithEmailOtp,
  });
  route({
    method: 'POST',
    url: '/waiter/login_po_verification',
    preHandler: [validate(AuthValidation.phoneOtpValidation)],
    handler: AuthController.waiterLoginWithPhoneOtpVerification,
  });
  route({
    method: 'POST',
    url: '/waiter/login_po/',
    preHandler: [validate(AuthValidation.userLoginWithPhoneOTPValidation)],
    handler: AuthController.waiterLoginWithPhoneOTP,
  });
  route({
    method: 'POST',
    url: '/waiter/login_po_firebase/',
    preHandler: [validate(AuthValidation.userLoginWithFirebasePhoneOTPValidation)],
    handler: AuthController.verifyWaiterLoginFirebaseOTP,
  });
  route({
    method: 'POST',
    url: '/waiter/login_with_google_account/',
    preHandler: [validate(AuthValidation.googleLoginValidation)],
    handler: AuthController.waiterLoginWithGoogleAccount,
  });
  route({
    method: 'POST',
    url: '/waiter/login_with_facebook_account/',
    preHandler: [validate(AuthValidation.facebookLoginValidation)],
    handler: AuthController.waiterLoginWithFacebookAccount,
  });
  // Waiter Auth //

  // Kitchen Auth //
  route({
    method: 'POST',
    url: '/kitchen/login',
    preHandler: [validate(AuthValidation.loginWithEmailPassword)],
    handler: AuthController.kitchenOwnerLoginWithEmailAndPassword,
  });
  route({
    method: 'POST',
    url: '/kitchen/login_cmp',
    preHandler: [validate(AuthValidation.loginWithCountryCodeAndMobilePassword)],
    handler: AuthController.kitchenLoginWithPhoneAndPassword,
  });
  route({
    method: 'POST',
    url: '/kitchen/login_eo_verification',
    preHandler: [validate(AuthValidation.emailOtpValidation)],
    handler: AuthController.kitchenLoginWithEmailOtpVerification,
  });
  route({
    method: 'POST',
    url: '/kitchen/login_eo',
    preHandler: [validate(AuthValidation.loginWithEmailOTPValidation)],
    handler: AuthController.kitchenLoginWithEmailOtp,
  });
  route({
    method: 'POST',
    url: '/kitchen/login_po_verification',
    preHandler: [validate(AuthValidation.phoneOtpValidation)],
    handler: AuthController.kitchenLoginWithPhoneOtpVerification,
  });
  route({
    method: 'POST',
    url: '/kitchen/login_po/',
    preHandler: [validate(AuthValidation.userLoginWithPhoneOTPValidation)],
    handler: AuthController.kitchenLoginWithPhoneOTP,
  });
  route({
    method: 'POST',
    url: '/kitchen/login_po_firebase/',
    preHandler: [validate(AuthValidation.userLoginWithFirebasePhoneOTPValidation)],
    handler: AuthController.verifyKitchenLoginFirebaseOTP,
  });
  route({
    method: 'POST',
    url: '/kitchen/login_with_google_account/',
    preHandler: [validate(AuthValidation.googleLoginValidation)],
    handler: AuthController.kitchenLoginWithGoogleAccount,
  });
  route({
    method: 'POST',
    url: '/kitchen/login_with_facebook_account/',
    preHandler: [validate(AuthValidation.facebookLoginValidation)],
    handler: AuthController.kitchenLoginWithFacebookAccount,
  });
  // Kitchen Auth //

  // Accountant Auth //
  route({
    method: 'POST',
    url: '/accountant/login',
    preHandler: [validate(AuthValidation.loginWithEmailPassword)],
    handler: AuthController.loginAccountantWithEmailAndPassword,
  });
  // Accountant Auth //

  // Support Team Auth //
  route({
    method: 'POST',
    url: '/support_team/login',
    preHandler: [validate(AuthValidation.loginWithEmailPassword)],
    handler: AuthController.loginSupportTeamWithEmailAndPassword,
  });
  // Support Team Auth //

  // City Master Team Auth //
  route({
    method: 'POST',
    url: '/cityzen/login',
    preHandler: [validate(AuthValidation.loginWithEmailPassword)],
    handler: AuthController.loginCityzenWithEmailAndPassword,
  });
  // City Master Team Auth //

  // Web Otp Verification Auth //
  route({
    method: 'GET',
    url: '/web_verification/:id',
    preHandler: [validate(AuthValidation.smsVerificationWebValidation)],
    handler: AuthController.webOtpVerification,
  });
  // Web Otp Verification Auth //
};
