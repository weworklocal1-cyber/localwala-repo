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

const { createOrder, getUserOrderCount, importCollection } = require('./orders.create.internal.js');
const { assignDriverOrderAdmin, assignDriverOrderVendor, fetchDriverNearToOrder, fetchDriverPhoneNumber, getDriverNewOrderList } = require('./orders.assign.internal.js');
const { updateOrderStatus, updateOrderPayment, prepareOrder, orderReady, acceptScheduleOrder, cancelOrderByUser, driverAcceptOrder, driverRejectOrder, driverPickupOrder, driverDeliverOrder, driverReachedCustomer, driverReachedRestaurant, restuarantOrderHandoverDriver, restaurantOrderHandoverCustomer, restaurantRejectOrder, getOrderMetaNotification, callCustomer, callDeliveryman } = require('./orders.status.internal.js');
const { getVendorOrder, getMyOrderList, getMyFavouriteOrders, getUserOrderDetail, getOrderDetailAdmin, getOrderDetailForReview, getOrderDetailForComplaints, getOrderDetailForRestaurantComplaint, supportTeamOrderDetail, getAdminOrderList, getAdminScheduleOrderList, getAdminSubscriptionOrderList, getAdminUnAssignedOrderList, vendorOrderList, vendorOrderListWeb, vendorOrderDetail, vendorOrderCountWeb, customerOrderList, cityzenOrderList, cityzenOrderCounts, cityzenSubscriptionOrderList, cityzenUnAssignedOrderList, driverOrderList, driverOrderDetails, driverActiveOrders, deliverymanOrderList, getOrderCounts } = require('./orders.query.internal.js');
const { adminDashboard, accountantDashboard, cityzenDashboard, deliverymanInsight, vendorOrderBusinessInsight, vendorOrderCustomDateBusinessInsight, vendorWebTodayDashboardBusinessInsight, vendorWebWeeklyDashboardBusinessInsight, vendorWebMonthlyDashboardBusinessInsight, vendorWebOverallDashboardBusinessInsight } = require('./orders.dashboard.internal.js');
const { customerAllRefundRequest, customerBookingRefundList, customerOrderRefundList, customerTiffinRefundList, vendorAllRefundRequest, vendorDiningRefundRequest, vendorOrderRefundRequest, vendorTiffinRefundRequest } = require('./orders.refund.internal.js');
const { exportQueryCollection, exportQueryRawCollection, exportRegularOrderReportCollection, exportSubscriptionOrderQueryCollection, exportSubscriptionOrderQueryRawCollection, exportUnAssignedOrderCollection, exportUnAssignedRawOrderCollection, orderReports, downloadOrderInvoice, downloadOrderSummary, downloadVendorOrderInvoice, downloadVendorOrderSummary, adminOrderInvoice, vendorOrderInvoice } = require('./orders.export.internal.js');
const { couponOrders } = require('./orders.pricing.internal.js');

module.exports = {
  createOrder,
  updateOrderStatus,
  getMyOrderList,
  getVendorOrder,
  prepareOrder,
  acceptScheduleOrder,
  orderReady,
  getUserOrderCount,
  getOrderMetaNotification,
  getDriverNewOrderList,
  driverAcceptOrder,
  driverRejectOrder,
  driverActiveOrders,
  driverOrderDetails,
  driverReachedRestaurant,
  restuarantOrderHandoverDriver,
  restaurantOrderHandoverCustomer,
  driverPickupOrder,
  driverReachedCustomer,
  driverDeliverOrder,
  getOrderCounts,
  getAdminOrderList,
  getAdminScheduleOrderList,
  restaurantRejectOrder,
  getUserOrderDetail,
  cancelOrderByUser,
  getOrderDetailForComplaints,
  getMyFavouriteOrders,
  getOrderDetailForReview,
  updateOrderPayment,
  getAdminSubscriptionOrderList,
  fetchDriverPhoneNumber,
  getAdminUnAssignedOrderList,
  fetchDriverNearToOrder,
  assignDriverOrderAdmin,
  assignDriverOrderVendor,
  vendorOrderCountWeb,
  vendorOrderListWeb,
  vendorOrderDetail,
  callCustomer,
  callDeliveryman,
  getOrderDetailAdmin,
  getOrderDetailForRestaurantComplaint,
  vendorOrderBusinessInsight,
  vendorOrderCustomDateBusinessInsight,
  vendorWebOverallDashboardBusinessInsight,
  vendorWebMonthlyDashboardBusinessInsight,
  vendorWebWeeklyDashboardBusinessInsight,
  vendorWebTodayDashboardBusinessInsight,
  deliverymanInsight,
  driverOrderList,
  downloadOrderSummary,
  downloadVendorOrderSummary,
  downloadOrderInvoice,
  downloadVendorOrderInvoice,
  orderReports,
  customerOrderList,
  customerAllRefundRequest,
  customerOrderRefundList,
  customerTiffinRefundList,
  customerBookingRefundList,
  vendorOrderList,
  vendorAllRefundRequest,
  deliverymanOrderList,
  adminDashboard,
  couponOrders,
  adminOrderInvoice,
  vendorOrderInvoice,
  supportTeamOrderDetail,
  accountantDashboard,
  cityzenDashboard,
  cityzenOrderCounts,
  cityzenOrderList,
  cityzenUnAssignedOrderList,
  cityzenSubscriptionOrderList,
  vendorOrderRefundRequest,
  vendorDiningRefundRequest,
  vendorTiffinRefundRequest,
  exportQueryCollection,
  exportQueryRawCollection,
  exportUnAssignedOrderCollection,
  exportUnAssignedRawOrderCollection,
  exportSubscriptionOrderQueryCollection,
  exportSubscriptionOrderQueryRawCollection,
  exportRegularOrderReportCollection,
  importCollection,
};

