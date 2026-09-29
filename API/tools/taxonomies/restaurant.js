/**
 * The restaurant lifecycle taxonomy, from Phase 3.4.
 *
 * Measured first: 15,215 lines, 111 exported names, 3 private helpers, no
 * module-level mutable state, and - unlike orders - 14 exported functions that
 * call another exported function. So this split is not a pure move, and the
 * buckets below are chosen to keep the coupled clusters together.
 *
 * `getRestaurantById` is the hub: twelve functions call it, and it lives in
 * `identity` alongside all of them. `getById` is called by updateRestaurantById,
 * cityzenUpdateRestaurantById and importRestaurantCollection, so it is public and
 * the export bucket imports it across.
 *
 * `updateUserCityLocation` is the one genuinely shared helper: identity and
 * discovery both call it, so it goes in the shared kernel and both import it.
 * Copying it into two buckets would have been a silent behaviour fork.
 */
module.exports = {
  service: 'restaurant',
  shared: {
    file: 'restaurant.shared.internal.js',
    note: 'the city/location update every writer shares',
    names: [],
    privateNames: ['updateUserCityLocation'],
  },
  buckets: {
    identity: {
      file: 'restaurant.identity.internal.js',
      note: 'the restaurant/outlet entity: create, read primitives, and every update',
      names: [
        // read primitives - getRestaurantById is the hub twelve callers reach
        'getRestaurantById',
        'getById',
        'getByUserId',
        'getByManagerId',
        'getByCityId',
        'getSlots',
        'getMyInfo',
        'getRestaurantManagerTypeAndCommission',
        'getRestaurantByIdVendorLogin',
        'getOutletPermission',
        'getRestaurantLoginResponse',
        'getRestaurantExtraInformation',
        // create
        'createRestaurant',
        'cityzenCreateRestaurant',
        'createOutletRestaurant',
        // update / lifecycle
        'updateStatus',
        'updateRestaurantById',
        'cityzenUpdateRestaurantById',
        'updateOutletById',
        'updateSlotByRestaurantId',
        'updateSlotByRestaurantIdWeb',
        'updateDiningInformation',
        'updateRestaurantDetail',
        'updateMenuAndPhotoInformation',
        'closeTemporaryRestaurant',
        'reOpenTemporaryRestaurant',
      ],
    },
    discovery: {
      file: 'restaurant.discovery.internal.js',
      note: 'customer-facing browse, search and near-me discovery',
      names: [
        'getAllRestaurant',
        'getCityzenRestaurant',
        'getCityzenOutlet',
        'getAllOutlet',
        'getMyOutletList',
        'getRestaurantsInfo',
        'getRestaurantsByLocalities',
        'getRestaurantsByCategory',
        'getRestaurantsByCuisine',
        'getRestaurantsByBrands',
        'getFoodsNearMeByCategory',
        'getRestaurantLimitedDetails',
        'cityzenRestaurantsLimitedDetails',
        'getRestaurantsByCityIdLimitedDetailsForAdmin',
        'getRestaurantsByCityIdForTiffinPackagesAdmin',
        'getDiningSupportedRestaurantByCityId',
        'getRestaurantByCityIdFromCollectCash',
        'getRestaurantInfoForNewDriver',
        'getRestaurantDetailForUpdateApp',
        'getOutletDetailForApp',
        'driverNearTrendingRestaurant',
        'fetchResturantPhoneNumber',
        'nearMeRestaurant',
        'nearMeDiningRestaurant',
        'nearMeDiningRestaurantOnMap',
        'cityMapDialogData',
        'cityMapDialogRestaurants',
        'filterRestaurantList',
        'globalSearch',
        'globalSearchInitial',
        'globalDiningSearch',
        'globalDiningSearchInitial',
        'foodSearch',
        'foodSearchInitial',
        'globalRestaurantSearchForReview',
        'getRestaurantInfoForDirectReview',
        'cityzenDetail',
      ],
    },
    pos: {
      file: 'restaurant.pos.internal.js',
      note: 'point of sale, table orders and the waiter view',
      names: [
        'getPosData',
        'getPosDataWeb',
        'getPosFoodDataWeb',
        'posRestaurantData',
        'posRestaurantListFromCity',
        'posFoodSearch',
        'posFoodSearchInitialData',
        'checkPosPermissionOfRestaurant',
        'checkTableOrderPermission',
        'waiterFoodList',
        'waiterFoodSearch',
        'waiterFoodSearchInitialData',
        'userTableQrMenu',
        'vendorTableQrDetail',
      ],
    },
    dining: {
      file: 'restaurant.dining.internal.js',
      note: 'dining booking and dining information',
      names: [
        'getDiningByCategory',
        'getDiningBookingInformation',
        'getDiningBookingConfirmInformation',
        'getVendorDiningInformation',
        'getVendorDiningInformationWeb',
      ],
    },
    wallet: {
      file: 'restaurant.wallet.internal.js',
      note: 'restaurant wallet and the delivery top-up',
      names: [
        'vendorInformation',
        'restaurantWalletDetail',
        'addMoneyToWalletAfterDelivery',
      ],
    },
    vendor: {
      file: 'restaurant.vendor.internal.js',
      note: 'vendor, admin and support-team views, subscriptions and reports',
      names: [
        'getByUserIdVendorLogin',
        'vendorOutletList',
        'getRestaurantDetailInformation',
        'vendorSubscriptionInfo',
        'getVendorSubscriptionStatus',
        'blockExpiredSubscriptionRestaurants',
        'getExpiringSoonRestaurants',
        'restaurantReport',
        'restauratReportInitialFilter',
        'supportTeamRestaurantList',
        'supportTeamRestaurantDetail',
      ],
    },
    export: {
      file: 'restaurant.export.internal.js',
      note: 'bulk exports, filtered exports and the two bulk imports',
      names: [
        'exportCollectionOutletAllData',
        'exportCollectionRestaurantAllData',
        'exportRawRestaurantCollection',
        'exportRawOutletCollection',
        'exportRestaurantFilterQueryCollection',
        'exportRawRestaurantFilterQueryCollection',
        'exportRestaurantFilterTypeCollection',
        'exportRawRestaurantFilterTypeCollection',
        'exportRestaurantReportCollection',
        'filterQuery',
        'filterQueryData',
        'cityzenFilterQuery',
        'cityzenFilterQueryData',
        'importRestaurantCollection',
        'importRestaurantOutletCollection',
      ],
      // Used only by the two imports in this bucket, so file-local.
      privateNames: ['generateSecurePassword', 'checkOutletPermissionOfRestaurant'],
    },
  },
};
