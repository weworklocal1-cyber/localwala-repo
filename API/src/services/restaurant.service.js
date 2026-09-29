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

const { getRestaurantById, getById, getByUserId, getByManagerId, getByCityId, getSlots, getMyInfo, getRestaurantManagerTypeAndCommission, getRestaurantByIdVendorLogin, getOutletPermission, getRestaurantLoginResponse, getRestaurantExtraInformation, createRestaurant, cityzenCreateRestaurant, createOutletRestaurant, updateStatus, updateRestaurantById, cityzenUpdateRestaurantById, updateOutletById, updateSlotByRestaurantId, updateSlotByRestaurantIdWeb, updateDiningInformation, updateRestaurantDetail, updateMenuAndPhotoInformation, closeTemporaryRestaurant, reOpenTemporaryRestaurant } = require('./restaurant.identity.internal.js');
const { getAllRestaurant, getCityzenRestaurant, getCityzenOutlet, getAllOutlet, getMyOutletList, getRestaurantsInfo, getRestaurantsByLocalities, getRestaurantsByCategory, getRestaurantsByCuisine, getRestaurantsByBrands, getFoodsNearMeByCategory, getRestaurantLimitedDetails, cityzenRestaurantsLimitedDetails, getRestaurantsByCityIdLimitedDetailsForAdmin, getRestaurantsByCityIdForTiffinPackagesAdmin, getDiningSupportedRestaurantByCityId, getRestaurantByCityIdFromCollectCash, getRestaurantInfoForNewDriver, getRestaurantDetailForUpdateApp, getOutletDetailForApp, driverNearTrendingRestaurant, fetchResturantPhoneNumber, nearMeRestaurant, nearMeDiningRestaurant, nearMeDiningRestaurantOnMap, cityMapDialogData, cityMapDialogRestaurants, filterRestaurantList, globalSearch, globalSearchInitial, globalDiningSearch, globalDiningSearchInitial, foodSearch, foodSearchInitial, globalRestaurantSearchForReview, getRestaurantInfoForDirectReview, cityzenDetail } = require('./restaurant.discovery.internal.js');
const { getPosData, getPosDataWeb, getPosFoodDataWeb, posRestaurantData, posRestaurantListFromCity, posFoodSearch, posFoodSearchInitialData, checkPosPermissionOfRestaurant, checkTableOrderPermission, waiterFoodList, waiterFoodSearch, waiterFoodSearchInitialData, userTableQrMenu, vendorTableQrDetail } = require('./restaurant.pos.internal.js');
const { getDiningByCategory, getDiningBookingInformation, getDiningBookingConfirmInformation, getVendorDiningInformation, getVendorDiningInformationWeb } = require('./restaurant.dining.internal.js');
const { vendorInformation, restaurantWalletDetail, addMoneyToWalletAfterDelivery } = require('./restaurant.wallet.internal.js');
const { getByUserIdVendorLogin, vendorOutletList, getRestaurantDetailInformation, vendorSubscriptionInfo, getVendorSubscriptionStatus, blockExpiredSubscriptionRestaurants, getExpiringSoonRestaurants, restaurantReport, restauratReportInitialFilter, supportTeamRestaurantList, supportTeamRestaurantDetail } = require('./restaurant.vendor.internal.js');
const { exportCollectionOutletAllData, exportCollectionRestaurantAllData, exportRawRestaurantCollection, exportRawOutletCollection, exportRestaurantFilterQueryCollection, exportRawRestaurantFilterQueryCollection, exportRestaurantFilterTypeCollection, exportRawRestaurantFilterTypeCollection, exportRestaurantReportCollection, filterQuery, filterQueryData, cityzenFilterQuery, cityzenFilterQueryData, importRestaurantCollection, importRestaurantOutletCollection } = require('./restaurant.export.internal.js');

module.exports = {
  createRestaurant,
  createOutletRestaurant,
  nearMeRestaurant,
  getAllRestaurant,
  getRestaurantById,
  updateStatus,
  getById,
  updateRestaurantById,
  updateOutletById,
  getByCityId,
  getByUserId,
  getByManagerId,
  getRestaurantLimitedDetails,
  getMyInfo,
  getByUserIdVendorLogin,
  getRestaurantByIdVendorLogin,
  getSlots,
  updateSlotByRestaurantId,
  updateSlotByRestaurantIdWeb,
  getRestaurantsByCuisine,
  getRestaurantsByCategory,
  getFoodsNearMeByCategory,
  getRestaurantsByBrands,
  getRestaurantsInfo,
  driverNearTrendingRestaurant,
  getRestaurantsByLocalities,
  globalSearch,
  globalSearchInitial,
  foodSearchInitial,
  foodSearch,
  getAllOutlet,
  getMyOutletList,
  getRestaurantsByCityIdLimitedDetailsForAdmin,
  getRestaurantByCityIdFromCollectCash,
  getRestaurantInfoForNewDriver,
  getRestaurantsByCityIdForTiffinPackagesAdmin,
  getDiningSupportedRestaurantByCityId,
  nearMeDiningRestaurant,
  nearMeDiningRestaurantOnMap,
  getVendorDiningInformation,
  getVendorDiningInformationWeb,
  updateDiningInformation,
  getDiningByCategory,
  globalDiningSearchInitial,
  globalDiningSearch,
  getRestaurantDetailInformation,
  getDiningBookingInformation,
  getDiningBookingConfirmInformation,
  fetchResturantPhoneNumber,
  getRestaurantInfoForDirectReview,
  globalRestaurantSearchForReview,
  getRestaurantLoginResponse,
  getRestaurantExtraInformation,
  updateMenuAndPhotoInformation,
  getRestaurantDetailForUpdateApp,
  updateRestaurantDetail,
  getOutletPermission,
  getOutletDetailForApp,
  closeTemporaryRestaurant,
  reOpenTemporaryRestaurant,
  addMoneyToWalletAfterDelivery,
  restaurantWalletDetail,
  getRestaurantManagerTypeAndCommission,
  getPosData,
  getPosDataWeb,
  getPosFoodDataWeb,
  posFoodSearchInitialData,
  posFoodSearch,
  checkPosPermissionOfRestaurant,
  waiterFoodList,
  waiterFoodSearchInitialData,
  waiterFoodSearch,
  checkTableOrderPermission,
  blockExpiredSubscriptionRestaurants,
  getExpiringSoonRestaurants,
  getVendorSubscriptionStatus,
  vendorSubscriptionInfo,
  restaurantReport,
  restauratReportInitialFilter,
  vendorOutletList,
  vendorInformation,
  posRestaurantListFromCity,
  posRestaurantData,
  cityMapDialogData,
  cityMapDialogRestaurants,
  filterRestaurantList,
  filterQueryData,
  filterQuery,
  supportTeamRestaurantList,
  supportTeamRestaurantDetail,
  getCityzenRestaurant,
  getCityzenOutlet,
  cityzenFilterQueryData,
  cityzenFilterQuery,
  cityzenDetail,
  cityzenUpdateRestaurantById,
  cityzenCreateRestaurant,
  cityzenRestaurantsLimitedDetails,
  vendorTableQrDetail,
  exportCollectionRestaurantAllData,
  exportRawRestaurantCollection,
  exportCollectionOutletAllData,
  exportRawOutletCollection,
  exportRestaurantFilterTypeCollection,
  exportRawRestaurantFilterTypeCollection,
  exportRestaurantFilterQueryCollection,
  exportRawRestaurantFilterQueryCollection,
  exportRestaurantReportCollection,
  importRestaurantCollection,
  importRestaurantOutletCollection,
  userTableQrMenu,
};
