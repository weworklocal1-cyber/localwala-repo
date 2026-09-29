/**
 * The orders lifecycle taxonomy, from Phase 3.3.
 *
 * `names` is the public surface - what orders.service.js still re-exports.
 * `privateNames` are defined in the module and published for other buckets or
 * kept local, but are not part of the 86-name public surface.
 *
 * The plan named six buckets. The measured surface does not fit six: there are
 * analytics dashboards, refunds and bulk reads with no home among them, and
 * inventing a "misc" bucket is how a 15k-line file stays a 15k-line file. So it
 * is eight. Review/rewards live in `query` rather than a `rating` bucket: the
 * only rating-shaped exports are getOrderDetailForReview and the two complaint
 * detail readers, which are reads, not a lifecycle stage.
 */
module.exports = {
  service: 'orders',
  shared: {
    file: 'orders.analytics.internal.js',
    note: 'the eight earning-breakdown queries behind the dashboards',
    // Published here, consumed by the dashboard bucket. The facade must not
    // re-import them, or they are unused imports there.
    privateNames: [
      'orderEarningBreakdown',
      'posOrderEarningBreakdown',
      'tableOrderEarningBreakdown',
      'diningBookingEarningBreakdown',
      'cityBasedOrderEarningBreakdown',
      'cityBasedPOSOrderEarningBreakdown',
      'cityBasedTableOrderEarningBreakdown',
      'cityBasedDiningBookingEarningBreakdown',
    ],
    names: [],
  },
  buckets: {
    create: {
      file: 'orders.create.internal.js',
      note: 'order creation, and the bulk import that creates orders',
      names: ['createOrder', 'getUserOrderCount', 'importCollection'],
    },
    assign: {
      file: 'orders.assign.internal.js',
      note: 'driver assignment: which driver, and who is near the order',
      names: [
        'assignDriverOrderAdmin',
        'assignDriverOrderVendor',
        'fetchDriverNearToOrder',
        'fetchDriverPhoneNumber',
        'getDriverNewOrderList',
      ],
    },
    'status-transition': {
      file: 'orders.status.internal.js',
      note: 'the order state machine, plus the five private helpers only it uses',
      names: [
        'updateOrderStatus',
        'updateOrderPayment',
        'prepareOrder',
        'orderReady',
        'acceptScheduleOrder',
        'cancelOrderByUser',
        'driverAcceptOrder',
        'driverRejectOrder',
        'driverPickupOrder',
        'driverDeliverOrder',
        'driverReachedCustomer',
        'driverReachedRestaurant',
        'restuarantOrderHandoverDriver',
        'restaurantOrderHandoverCustomer',
        'restaurantRejectOrder',
        'getOrderMetaNotification',
        'callCustomer',
        'callDeliveryman',
      ],
      // Every caller of these five is in this bucket (measured, not assumed),
      // so they are file-local. Exporting them and re-importing them into the
      // facade produced four unused-import warnings, because the facade's job
      // is to re-export the public names and these are not among them.
      privateNames: [
        'getOrderById',
        'getVendorOrderById',
        'getDriverNewOrderById',
        'haversineDistance',
        'getPercentageAmount',
      ],
    },
    query: {
      file: 'orders.query.internal.js',
      note: 'reads: lists and detail views, for every actor',
      names: [
        'getVendorOrder',
        'getMyOrderList',
        'getMyFavouriteOrders',
        'getUserOrderDetail',
        'getOrderDetailAdmin',
        'getOrderDetailForReview',
        'getOrderDetailForComplaints',
        'getOrderDetailForRestaurantComplaint',
        'supportTeamOrderDetail',
        'getAdminOrderList',
        'getAdminScheduleOrderList',
        'getAdminSubscriptionOrderList',
        'getAdminUnAssignedOrderList',
        'vendorOrderList',
        'vendorOrderListWeb',
        'vendorOrderDetail',
        'vendorOrderCountWeb',
        'customerOrderList',
        'cityzenOrderList',
        'cityzenOrderCounts',
        'cityzenSubscriptionOrderList',
        'cityzenUnAssignedOrderList',
        'driverOrderList',
        'driverOrderDetails',
        'driverActiveOrders',
        'deliverymanOrderList',
        'getOrderCounts',
      ],
    },
    dashboard: {
      file: 'orders.dashboard.internal.js',
      note: 'analytics and business insight, for admin, accountant, vendor and cityzen',
      names: [
        'adminDashboard',
        'accountantDashboard',
        'cityzenDashboard',
        'deliverymanInsight',
        'vendorOrderBusinessInsight',
        'vendorOrderCustomDateBusinessInsight',
        'vendorWebTodayDashboardBusinessInsight',
        'vendorWebWeeklyDashboardBusinessInsight',
        'vendorWebMonthlyDashboardBusinessInsight',
        'vendorWebOverallDashboardBusinessInsight',
      ],
    },
    refund: {
      file: 'orders.refund.internal.js',
      note: 'refund requests and refund lists, customer and vendor side',
      names: [
        'customerAllRefundRequest',
        'customerBookingRefundList',
        'customerOrderRefundList',
        'customerTiffinRefundList',
        'vendorAllRefundRequest',
        'vendorDiningRefundRequest',
        'vendorOrderRefundRequest',
        'vendorTiffinRefundRequest',
      ],
    },
    export: {
      file: 'orders.export.internal.js',
      note: 'reports, exports and invoice/summary downloads',
      names: [
        'exportQueryCollection',
        'exportQueryRawCollection',
        'exportRegularOrderReportCollection',
        'exportSubscriptionOrderQueryCollection',
        'exportSubscriptionOrderQueryRawCollection',
        'exportUnAssignedOrderCollection',
        'exportUnAssignedRawOrderCollection',
        'orderReports',
        'downloadOrderInvoice',
        'downloadOrderSummary',
        'downloadVendorOrderInvoice',
        'downloadVendorOrderSummary',
        'adminOrderInvoice',
        'vendorOrderInvoice',
      ],
    },
    pricing: {
      file: 'orders.pricing.internal.js',
      note: 'coupon and pricing reads',
      names: ['couponOrders'],
    },
  },
};
