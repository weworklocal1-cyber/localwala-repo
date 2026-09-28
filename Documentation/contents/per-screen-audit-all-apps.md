# LocalWala / FoodBite — Per-Screen Audit & Proposed Improvements (All 5 Apps)

> **Generated:** 2026-08-08  
> **Scope:** Customer App, Restaurant App, Deliveryman App, Kitchen App, Waiter App  
> **Status:** Analysis only — no code changes made

---

## Table of Contents

1. [Customer App — Flutter](#1-customer-app--flutter)
2. [Restaurant App — Flutter](#2-restaurant-app--flutter)
3. [Deliveryman App — Flutter](#3-deliveryman-app--flutter)
4. [Kitchen App — Flutter](#4-kitchen-app--flutter)
5. [Waiter App — Flutter](#5-waiter-app--flutter)
6. [Cross-Platform Quick Wins](#6-cross-platform-quick-wins)

---

## 1. Customer App — Flutter

### 1.1 Splash Screen
**Path:** `lib/app/presentation/pages/splash/splash_view.dart`  
**Purpose:** Entry point; initializes locale, checks auth/update/maintenance/connection status, routes accordingly.  
**Current Features:**
- App logo + name with centered splash icon
- Bottom circular progress indicator
- `SplashBloc`-driven routing (intro, login, tabs, force update, maintenance, connection error, server error)
- Locale initialization via `AppLocalizationBloc`

**Missing / Proposed Improvements:**
- No onboarding animation or brand storytelling
- No configurable splash duration or asset branding toggle
- No deep-link or notification payload handling at splash level
- No retry-with-backoff UX for transient failures

---

### 1.2 Intro / Permission Screen
**Path:** `lib/app/presentation/pages/intro/intro_view.dart`  
**Purpose:** Sequential permission request (Notification, Bluetooth, Camera, Location) before first login.  
**Current Features:**
- 4-page `PageView` with locked scroll
- Per-permission success/error dialogs
- Language switcher + theme toggle in app bar
- Routes to login after location permission resolved

**Missing / Proposed Improvements:**
- No "Skip All" / "Continue without permissions" button
- No rationale text per permission explaining why it is needed
- No retry logic for permanently denied permissions (should open app settings)
- No slide indicators or intro content beyond permissions

---

### 1.3 Auth — Login Hub
**Path:** `lib/app/presentation/pages/auth/@core/login_view.dart`  
**Purpose:** Dynamically renders one of four login strategies based on backend config.  
**Current Features:**
- Dynamic login method rendering: `email_password`, `phone_password`, `phone_otp`, `email_otp`
- Language switcher modal
- Theme toggle in app bar
- `LoginBloc`-driven state handling

**Missing / Proposed Improvements:**
- No social login (Google, Apple, Facebook)
- No biometric / fingerprint login option
- No "Remember me" or persistent session toggle
- No inline validation feedback or error banners

---

### 1.4 Auth — Login Options: Email OTP
**Path:** `lib/app/presentation/pages/auth/login_options/email_otp/`  
**Purpose:** Email-based OTP login flow.  
**Current Features:**
- OTP input and email entry
- Bloc events/states for OTP flow

**Missing / Proposed Improvements:**
- No resend-OTP countdown timer
- No email format validation feedback in UI layer

---

### 1.5 Auth — Login Options: Email Password
**Path:** `lib/app/presentation/pages/auth/login_options/email_password/`  
**Purpose:** Traditional email + password login.  
**Current Features:**
- Email and password fields
- Bloc events/states

**Missing / Proposed Improvements:**
- No "Show/Hide password" toggle
- No "Forgot password?" link routing visible

---

### 1.6 Auth — Login Options: Phone OTP
**Path:** `lib/app/presentation/pages/auth/login_options/phone_otp/`  
**Purpose:** Phone-number-based OTP login.  
**Current Features:**
- Phone number entry + OTP verification
- Bloc events/states

**Missing / Proposed Improvements:**
- No country code picker visible in this folder (though `country_modal` exists under modals)
- No auto-read SMS / auto-fill OTP support visible

---

### 1.7 Auth — Login Options: Phone Password
**Path:** `lib/app/presentation/pages/auth/login_options/phone_password/`  
**Purpose:** Phone number + password login.  
**Current Features:**
- Phone + password entry
- Bloc events/states

**Missing / Proposed Improvements:**
- No show/hide password toggle
- No forgot-password inline link

---

### 1.8 Auth — Register Request
**Path:** `lib/app/presentation/pages/auth/register_request/`  
**Purpose:** Restaurant registration request submission.  
**Current Features:**
- `@core` bloc and view
- Registration form screens
- Payment view for registration fee
- Success view

**Missing / Proposed Improvements:**
- No document upload step visible
- No multi-step wizard indicator (progress stepper)
- No draft/save-and-continue-later capability

---

### 1.9 Auth — Reset Password
**Path:** `lib/app/presentation/pages/auth/reset_password/`  
**Purpose:** Password reset flow.  
**Current Features:**
- Reset via email OTP
- Reset via phone OTP
- Core bloc and view

**Missing / Proposed Improvements:**
- No password strength meter
- No confirm-password field visible

---

### 1.10 App Pages (Generic Web Content)
**Path:** `lib/app/presentation/pages/app_pages/app_pages_view.dart`  
**Purpose:** Renders static web content (about, privacy policy, terms, FAQ, help, etc.) via HTML.  
**Current Features:**
- `HtmlWidget` rendering of rich text
- Bloc-driven content fetch (`AppPagesBloc`)
- Error handling via `showErrorDialog`
- Dynamic page title via `kAppPageName`

**Missing / Proposed Improvements:**
- No pull-to-refresh
- No share button for policy pages
- No print / PDF export
- No offline caching of static pages

---

### 1.11 Tabs / Bottom Navigation
**Path:** `lib/app/presentation/pages/tabs/tabs_view.dart`  
**Purpose:** Main app shell with 5-tab bottom navigation.  
**Current Features:**
- 5 tabs: Menu, Business, Orders, POS, Account/More
- Tab icons and labels with active state color
- Subscription expiry banner above tab bar when expired
- `TabController` with `NeverScrollableScrollPhysics`
- `BottomTabNavigationBloc` for tab state
- `AutomaticKeepAliveClientMixin` on children

**Missing / Proposed Improvements:**
- No badge/unread count indicators on tab icons (e.g., new orders, messages)
- No swipe-to-switch-tab gesture (physics is `NeverScrollableScrollPhysics`)
- No floating action button at tab level
- No "More" tab overflow menu or quick settings

---

### 1.12 Home / Restaurant Listing
**Path:** `lib/app/presentation/pages/home/`  
**Purpose:** Browse restaurants, search, sort, view campaigns.  
**Current Features:**
- Restaurant listing with image, name, cuisine, rating, delivery time
- Search by restaurant/food name
- Sort by categories, cuisine, brands
- Campaign banners (food campaign, restaurant campaign)
- Food subscriptions info section
- Notification list navigation
- Filters: delivery time, cuisine, category

**Missing / Proposed Improvements:**
- No map view toggle (list vs map)
- No "Currently closed" greyed-out states with open-time preview
- No quick-view modal for restaurant without full navigation
- No recently visited / recently ordered section
- No dark mode optimized images
- No skeleton loading on restaurant cards
- No "Open now" filter

---

### 1.13 Restaurant Detail / Menu
**Path:** `lib/app/presentation/pages/home/restaurant/`  
**Purpose:** View restaurant details and menu items.  
**Current Features:**
- Restaurant info (name, image, rating, delivery time, delivery fee)
- Menu categorized by categories/subcategories
- Food items with image, name, price, discount, description
- Add to cart with quantity controls
- Food variations modal
- Food info modal
- Cart summary

**Missing / Proposed Improvements:**
- No restaurant reviews section visible in this folder
- No "About restaurant" section with description, facilities
- No map view of restaurant location
- No call-restaurant / direction quick actions
- No share-restaurant action
- No "Bookmark / favourite" toggle visible in this folder
- No dietary filters (veg/non-veg, vegan, gluten-free)
- No nutrition info / allergen warnings

---

### 1.14 Food Search
**Path:** `lib/app/presentation/pages/home/search/`  
**Purpose:** Search foods across all restaurants.  
**Current Features:**
- Bloc-driven search
- Search results with food items

**Missing / Proposed Improvements:**
- No recent searches / search history
- No voice search
- No search suggestions / trending searches
- No filter by restaurant, cuisine, price range in search results

---

### 1.15 Sort / Filter
**Path:** `lib/app/presentation/pages/home/sort/`  
**Purpose:** Filter and sort restaurants/foods.  
**Current Features:**
- Sort by categories
- Sort by cuisine
- Sort by brands
- Bloc-driven filtering

**Missing / Proposed Improvements:**
- No price range slider
- No "Open now" filter
- No dietary preference filters
- No rating filter (4+ stars, 3+ stars)
- No delivery time filter

---

### 1.16 Cart
**Path:** `lib/app/presentation/pages/cart/`  
**Purpose:** Shopping cart management and checkout.  
**Current Features:**
- Cart item list with quantity controls
- Add/remove items
- Cart summary (item total, tax, delivery fee, grand total)
- Checkout flow
- Bloc-driven cart state

**Missing / Proposed Improvements:**
- No save-for-later / wishlist from cart
- No bulk delete / clear cart
- No coupon/promo code input at cart level
- No estimated delivery time preview
- No "Reorder from previous order" quick action
- No cart abandonment recovery notification

---

### 1.17 Checkout
**Path:** `lib/app/presentation/pages/cart/checkout/`  
**Purpose:** Delivery address, payment method, order summary before placing order.  
**Current Features:**
- Bloc-driven checkout flow
- Address selection
- Payment method selection
- Order summary

**Missing / Proposed Improvements:**
- No schedule-order-for-later option
- No delivery instruction input
- No tip/gratuity input for deliveryman
- No order note / special instructions
- No contactless delivery toggle
- No address map picker / validation
- No delivery time slot selection
- No split-payment option

---

### 1.18 Make Payments
**Path:** `lib/app/presentation/pages/cart/make_payments/`  
**Purpose:** Payment processing screen.  
**Current Features:**
- Bloc-driven payment flow
- Payment method selection
- Payment processing

**Missing / Proposed Improvements:**
- No payment retry flow
- No payment failure explanation + recovery options
- No save-card / saved-payment-methods management
- No EMI / installment options
- No payment security indicators (SSL, secure badge)

---

### 1.19 Chat — Chat Card / List
**Path:** `lib/app/presentation/pages/chats/`  
**Purpose:** Direct messaging with restaurants and deliverymen.  
**Current Features:**
- Chat list with last message preview
- Chat messages screen with Socket.IO real-time
- Support chat list
- Support chat screen

**Missing / Proposed Improvements:**
- No image/file attachment in chat
- No chat search
- No forward / reply / delete messages
- No online/offline status indicators
- No typing indicators
- No unread message badge counts
- No archive / mute conversations
- No voice note recording
- No delivery/read receipts (double-tick)

---

### 1.20 Dining
**Path:** `lib/app/presentation/pages/dining/`  
**Purpose:** Restaurant pre-booking for dine-in.  
**Current Features:**
- Dining search
- Dining on maps
- Dining campaigns
- Restaurant pre-booking
- Filter dining with cuisine
- Guest count selection
- Date/time selection

**Missing / Proposed Improvements:**
- No table selection / seat map
- No QR code for self-checkin
- No waitlist / virtual queue
- No special requests (candlelight, decorations, high chair)
- No deposit payment for booking
- No booking modification / cancellation flow
- No SMS reminder before booking time

---

### 1.21 Favorites
**Path:** `lib/app/presentation/pages/favourite/`  
**Purpose:** Saved favorite foods, orders, restaurants.  
**Current Features:**
- Favourite foods list
- Favourite orders list
- Favourite restaurants list

**Missing / Proposed Improvements:**
- No share favorites list
- No organize into collections / lists
- No price-drop / availability alert for favorited items

---

### 1.22 History / Order History
**Path:** `lib/app/presentation/pages/history/`  
**Purpose:** Past orders list and details.  
**Current Features:**
- Order history list
- Order detail view

**Missing / Proposed Improvements:**
- No reorder button on past orders
- No filter by date range, restaurant, order type
- No export order history
- No order status timeline visualization

---

### 1.23 Reviews
**Path:** `lib/app/presentation/pages/reviews/`  
**Purpose:** Submit and view reviews for restaurants and foods.  
**Current Features:**
- Product reviews
- Restaurant reviews

**Missing / Proposed Improvements:**
- No photo/video review upload
- No review edit / delete
- No restaurant response to reviews
- No review helpfulness voting
- No rating breakdown by category (food, service, ambiance)

---

### 1.24 Account — Profile
**Path:** `lib/app/presentation/pages/account/`  
**Purpose:** User profile hub with all settings and feature shortcuts.  
**Current Features:**
- Edit user profile
- Address book
- Wallet
- Loyalty points
- Referral code
- Dining booking list
- Food subscription list
- Hidden restaurants
- Restaurant registration
- Deliveryman registration
- Feedback form
- Report emergency
- Settings

**Missing / Proposed Improvements:**
- No profile stats (total orders, total spent, member since)
- No quick action cards at top
- No search bar for settings items
- No "Recently used" section

---

### 1.25 Account — Edit User Profile
**Path:** `lib/app/presentation/pages/account/edit_user_profile/`  
**Purpose:** Update customer profile info.  
**Current Features:**
- Bloc-driven form
- Profile image upload
- Name, email, phone editing

**Missing / Proposed Improvements:**
- No address map picker
- No email/phone verification status indicator

---

### 1.26 Account — Address Book
**Path:** `lib/app/presentation/pages/account/address_book/`  
**Purpose:** Manage saved delivery addresses.  
**Current Features:**
- Address list
- Add new address
- Edit address
- Bloc-driven CRUD

**Missing / Proposed Improvements:**
- No map picker for address selection
- No address validation via Google Maps API
- No "Home / Work / Other" labels
- No recent addresses suggestions
- No address sharing / copying

---

### 1.27 Account — Wallet
**Path:** `lib/app/presentation/pages/account/wallet/`  
**Purpose:** Wallet balance, transactions, add money.  
**Current Features:**
- Wallet balance display
- Transaction history
- Add wallet money
- Loyalty points

**Missing / Proposed Improvements:**
- No UPI / bank transfer initiation
- No payment request to friends
- No wallet top-up offers / cashback
- No transaction export

---

### 1.28 Account — Referral Code
**Path:** `lib/app/presentation/pages/account/referral_code/`  
**Purpose:** Referral program participation.  
**Current Features:**
- Bloc-driven referral code display
- Referral tracking

**Missing / Proposed Improvements:**
- No share-referral-link action
- No referral leaderboard
- No tiered referral rewards
- No referral history with status

---

### 1.29 Account — Dining Booking
**Path:** `lib/app/presentation/pages/account/dining_booking/`  
**Purpose:** View and manage dining reservations.  
**Current Features:**
- Dining booking list
- Dining booking detail
- Bloc-driven state

**Missing / Proposed Improvements:**
- No modify booking flow
- No cancel booking with refund status
- No booking history archive

---

### 1.30 Account — Food Subscription
**Path:** `lib/app/presentation/account/food_subscription_list/`  
**Purpose:** Manage tiffin / meal subscriptions.  
**Current Features:**
- Subscription list
- Subscription detail

**Missing / Proposed Improvements:**
- No pause/resume subscription
- No skip days / vacation mode
- No auto-renewal management
- No subscription upgrade/downgrade
- No delivery schedule calendar

---

### 1.31 Account — Hidden Restaurants
**Path:** `lib/app/presentation/pages/account/hidden_restaurants/`  
**Purpose:** Manage hidden/blocked restaurants.  
**Current Features:**
- Hidden restaurants list
- Unhide action

**Missing / Proposed Improvements:**
- No reason for hiding (feedback to platform)
- No bulk unhide

---

### 1.32 Account — Restaurant Registration
**Path:** `lib/app/presentation/pages/account/restaurant_register_request/`  
**Purpose:** Register a new restaurant on the platform.  
**Current Features:**
- Registration form
- Bloc-driven submit

**Missing / Proposed Improvements:**
- No document upload step
- No progress tracker for approval
- No estimated approval time

---

### 1.33 Account — Deliveryman Registration
**Path:** `lib/app/presentation/pages/account/deliveryman_registration/`  
**Purpose:** Register as a delivery partner.  
**Current Features:**
- Registration form
- Document upload
- Bloc-driven submit

**Missing / Proposed Improvements:**
- No vehicle type selection
- No document expiry reminders
- No training / tutorial onboarding

---

### 1.34 Account — Feedback Form
**Path:** `lib/app/presentation/pages/account/feedback_form/`  
**Purpose:** Submit feedback to platform.  
**Current Features:**
- Feedback form with fields
- Bloc-driven submit

**Missing / Proposed Improvements:**
- No category selector (bug/feature/complaint)
- No rating stars
- No screenshot/attachment upload

---

### 1.35 Account — Report Emergency
**Path:** `lib/app/presentation/pages/account/report_emergency/`  
**Purpose:** Emergency/safety incident reporting.  
**Current Features:**
- Report form
- Bloc-driven submit

**Missing / Proposed Improvements:**
- No auto-capture of current location
- No photo/video evidence upload
- No emergency contact escalation
- No urgency/priority selector

---

### 1.36 Account — Settings
**Path:** `lib/app/presentation/pages/account/setting_section/`  
**Purpose:** App-level settings.  
**Current Features:**
- Theme toggle
- Language selection
- Notification settings
- Account settings (change email, mobile, password, delete account)

**Missing / Proposed Improvements:**
- No two-factor authentication toggle
- No active sessions / login history
- No biometric login toggle
- No cache clear / data usage info

---

### 1.37 Modals — Cart Summary
**Path:** `lib/app/presentation/pages/modals/cart_summary_modal/`  
**Purpose:** Quick view of cart items and totals.  
**Current Features:**
- Bloc-driven cart summary

**Missing / Proposed Improvements:**
- No edit quantities inline
- No apply coupon from modal

---

### 1.38 Modals — Payment
**Path:** `lib/app/presentation/pages/modals/payment_modal/`  
**Purpose:** Select payment method.  
**Current Features:**
- Bloc-driven payment method list

**Missing / Proposed Improvements:**
- No saved payment methods display
- No payment method search

---

### 1.39 Modals — OTP
**Path:** `lib/app/presentation/pages/modals/otp_modal/`  
**Purpose:** Generic OTP verification.  
**Current Features:**
- OTP text field
- Resend OTP
- Verify action

**Missing / Proposed Improvements:**
- No countdown timer for resend
- No auto-fill / SMS autofill integration

---

### 1.40 Modals — Dining Booking
**Path:** `lib/app/presentation/pages/modals/dining_booking_*/`  
**Purpose:** Dining reservation flow modals.  
**Current Features:**
- Dining booking info
- Dining booking request
- Dining booking user info
- Dining charge summary
- Dining coupon info
- Dining date list
- Dining guest list
- Dining cancellation
- Dining refund request

**Missing / Proposed Improvements:**
- No table selection visual
- No deposit payment
- No special requests field

---

### 1.41 Modals — Tiffin Subscription
**Path:** `lib/app/presentation/pages/modals/tiffin_subscription_*/`  
**Purpose:** Tiffin/meal subscription configuration.  
**Current Features:**
- Food selection
- Instruction modal
- Off-days selection
- Time slot selection

**Missing / Proposed Improvements:**
- No auto-rotation of menu
- No skip/pause days

---

### 1.42 Modals — Refund Request
**Path:** `lib/app/presentation/pages/modals/refund_request_reason_modal/`  
**Purpose:** Select reason for refund request.  
**Current Features:**
- Bloc-driven reason list

**Missing / Proposed Improvements:**
- No custom reason input
- No photo evidence upload

---

### 1.43 Modals — Other
**Path:** Various under `lib/app/presentation/pages/modals/`  
**Purpose:** Various supporting modals.  
**Current Features:**
- Billing summary, cancellation reason, change receiver info, complaints, country modal, coupon info/list, delivery address list, delivery instructions, food info/instructions/variations, hide restaurant reason, image gallery, language translation, order help/review/ratings, permission denied, referral, report issue restaurant, restaurants by locality, restaurant info/menu, select cuisine/delivery time/restaurant type, single food from banned, social account verification, subscription food info, user avatar list, web OTP

**Missing / Proposed Improvements:**
- No unified modal theming
- No modal transition animations
- No swipe-to-dismiss on bottom sheets

---

## 2. Restaurant App — Flutter

### 2.1 Splash Screen
**Path:** `lib/app/presentation/pages/splash/splash_view.dart`  
**Purpose:** Entry point; checks auth, update, maintenance, connection status.  
**Current Features:**
- Logo + app name
- Bloc-driven routing
- Locale initialization

**Missing / Proposed Improvements:**
- Same as Customer App splash gaps

---

### 2.2 Auth — Login Hub
**Path:** `lib/app/presentation/pages/auth/@core/login_view.dart`  
**Purpose:** Dynamic login based on backend config.  
**Current Features:**
- Dynamic sub-screen rendering
- Theme toggle
- Language switcher

**Missing / Proposed Improvements:**
- No social login
- No biometric login
- No "Remember me"

---

### 2.3 Auth — Login Options
**Path:** `lib/app/presentation/pages/auth/login_options/`  
**Purpose:** Email/password, email OTP, phone/password, phone OTP login.  
**Current Features:**
- All four login modes
- Bloc-driven validation

**Missing / Proposed Improvements:**
- Same as Customer App login gaps

---

### 2.4 Auth — Register Request
**Path:** `lib/app/presentation/pages/auth/register_request/`  
**Purpose:** Restaurant registration request.  
**Current Features:**
- Registration form
- Payment view
- Success view

**Missing / Proposed Improvements:**
- No document upload
- No progress stepper

---

### 2.5 Auth — Reset Password
**Path:** `lib/app/presentation/pages/auth/reset_password/`  
**Purpose:** Password reset via email/phone OTP.  
**Current Features:**
- Email OTP and phone OTP flows

**Missing / Proposed Improvements:**
- No password strength meter
- No confirm password

---

### 2.6 Dashboard / Business Insights
**Path:** `lib/app/presentation/pages/business/`  
**Purpose:** Restaurant analytics and insights.  
**Current Features:**
- 3-tab structure: Order Insight, POS Insight, Table Order Insight
- Custom date insight
- Sub-screens for each insight type
- Bloc-driven (`BusinessBloc`)

**Missing / Proposed Improvements:**
- No chart/graph visualization evident
- No export-to-PDF / share report
- No comparison with previous periods
- No real-time data streaming

---

### 2.7 Orders — Order List
**Path:** `lib/app/presentation/pages/orders/@core/orders_view.dart`  
**Purpose:** Incoming order management with status actions.  
**Current Features:**
- Online/offline/blocked status toggle
- Horizontal tab chips for status filtering
- Pull-to-refresh + infinite scroll
- Order tiles with rich info (order number, time, customer, items, total, payment mode)
- Action buttons: Reject, Accept, Prepare Schedule, Order Ready, Find Deliveryman
- Driver assignment via `SelectDriverModalScreen`
- Billing summary modal
- Cancellation reason modal
- Order help modal
- Skeleton loading, empty, error states

**Missing / Proposed Improvements:**
- No bulk actions (accept/reject multiple)
- No order priority / VIP flagging
- No audio/voice alert for new orders
- No split-screen / kitchen display mode
- No order notes / special instructions expand

---

### 2.8 Orders — Order Detail
**Path:** `lib/app/presentation/pages/orders/order_detail/`  
**Purpose:** Detailed single order view with full lifecycle actions.  
**Current Features:**
- 1264-line comprehensive view
- Modals: cancellation reasons, find driver, complaints, help, verification, select driver
- Success dialogs for reject, accept, ready, handover
- Bloc-driven (`OrderDetailBloc`)

**Missing / Proposed Improvements:**
- No print invoice inline action
- No map/live-tracking integration
- No customer info section (name, mobile, table)

---

### 2.9 POS Management
**Path:** `lib/app/presentation/pages/pos_management/`  
**Purpose:** Point-of-Sale order creation and cart.  
**Current Features:**
- Category-wise menu with expand/collapse
- Food blocks with image, name, price, discount
- Add-to-cart with quantity controls
- Variations/addons modal
- Food info modal
- Repeat quantity modal
- Bottom sticky category scroll bar
- Cart summary bar with total and "Place Order" CTA
- Search food navigation
- POS order list navigation
- Loading, empty, error, unauthorized states

**Missing / Proposed Improvements:**
- No customer selection / walk-in customer flow
- No split-payment / multiple payment modes
- No discount / coupon application at POS
- No kitchen order ticket (KOT) printing
- No barcode scanner

---

### 2.10 Menu — Categories
**Path:** `lib/app/presentation/pages/menu/categories/`  
**Purpose:** Manage main food categories.  
**Current Features:**
- Category list view
- Add/edit category action
- Bloc-driven CRUD

**Missing / Proposed Improvements:**
- No category icon/image assignment
- No drag-and-drop reorder

---

### 2.11 Menu — Sub Categories
**Path:** `lib/app/presentation/pages/menu/sub_categories/`  
**Purpose:** Manage sub-categories.  
**Current Features:**
- Sub-category list view
- Add/edit action

**Missing / Proposed Improvements:**
- No image/icon assignment
- No reorder

---

### 2.12 Menu — Foods
**Path:** `lib/app/presentation/pages/menu/foods/`  
**Purpose:** Manage food items.  
**Current Features:**
- Food list with search
- Add/edit food action
- Variations management
- Bloc-driven

**Missing / Proposed Improvements:**
- No barcode/QR generation
- No bulk import via CSV
- No nutrition info fields

---

### 2.13 Menu — Addons
**Path:** `lib/app/presentation/pages/menu/addons/`  
**Purpose:** Manage addon items.  
**Current Features:**
- Addon list
- Add/edit action

**Missing / Proposed Improvements:**
- No addon grouping / combo builder

---

### 2.14 Menu — Search Menu
**Path:** `lib/app/presentation/pages/menu/search_menu/`  
**Purpose:** Search across menu items.  
**Current Features:**
- Cupertino-style search field
- Real-time search

**Missing / Proposed Improvements:**
- No voice search
- No recent searches
- No barcode scan

---

### 2.15 Menu — Media File List
**Path:** `lib/app/presentation/pages/menu/media_file_list/`  
**Purpose:** Browse uploaded media for menu.  
**Current Features:**
- Media list view

**Missing / Proposed Improvements:**
- No folder/album organization

---

### 2.16 Campaigns
**Path:** `lib/app/presentation/pages/campaign/`  
**Purpose:** Marketing campaign management.  
**Current Features:**
- 3 tabs: Restaurant Campaign, Dining Campaign, Food Campaign
- Create/edit campaign actions

**Missing / Proposed Improvements:**
- No campaign performance metrics / ROI
- No A/B testing
- No draft/scheduling state
- No campaign calendar

---

### 2.17 Account — Edit Profile
**Path:** `lib/app/presentation/pages/account/edit_profile/`  
**Purpose:** Update restaurant owner profile.  
**Current Features:**
- Profile image, name, email, phone editing

**Missing / Proposed Improvements:**
- No timezone / currency / GSTIN fields

---

### 2.18 Account — Edit Restaurant
**Path:** `lib/app/presentation/pages/account/edit_restaurant/`  
**Purpose:** Update restaurant business details.  
**Current Features:**
- Restaurant info update form

**Missing / Proposed Improvements:**
- No cuisine tags, opening hours, delivery radius

---

### 2.19 Account — Chats
**Path:** `lib/app/presentation/pages/account/chats/`  
**Purpose:** Messaging for restaurant admin.  
**Current Features:**
- Chat list
- Chat messages
- Support chat

**Missing / Proposed Improvements:**
- No unread badge
- No file attachment
- No chat search

---

### 2.20 Account — Coupons
**Path:** `lib/app/presentation/pages/account/coupons/`  
**Purpose:** Coupon management for orders and dining.  
**Current Features:**
- Order coupon list
- Dining coupon list

**Missing / Proposed Improvements:**
- No coupon analytics (usage, redemption rate)
- No bulk import/export

---

### 2.21 Account — Deliveryman List
**Path:** `lib/app/presentation/pages/account/deliveryman_list/`  
**Purpose:** Manage delivery personnel.  
**Current Features:**
- Deliveryman list
- Manage deliveryman

**Missing / Proposed Improvements:**
- No map view of deliverymen
- No real-time location tracking

---

### 2.22 Account — Dining Management
**Path:** `lib/app/presentation/pages/account/dining_management/`  
**Purpose:** Dining / table booking management.  
**Current Features:**
- Dining pre-bookings
- Dining booking detail
- Dining guest count
- Dining schedules
- Dining setting

**Missing / Proposed Improvements:**
- No table layout / floor plan visual editor
- No QR code generator for tables

---

### 2.23 Account — Expense Reports
**Path:** `lib/app/presentation/pages/account/expense_reports/`  
**Purpose:** Track restaurant expenses.  
**Current Features:**
- Expense reports list

**Missing / Proposed Improvements:**
- No category-wise breakdown
- No export to CSV/PDF

---

### 2.24 Account — Feedback Form
**Path:** `lib/app/presentation/pages/account/feedback_form/`  
**Purpose:** Submit feedback.  
**Current Features:**
- Feedback form

**Missing / Proposed Improvements:**
- No rating stars
- No attachment upload

---

### 2.25 Account — Food Taxation
**Path:** `lib/app/presentation/pages/account/food_taxation/`  
**Purpose:** Configure tax slabs.  
**Current Features:**
- Food taxation list
- Tax configuration dialog

**Missing / Proposed Improvements:**
- No tax report / summary
- No GSTIN management

---

### 2.26 Account — Kitchen Credentials
**Path:** `lib/app/presentation/pages/account/kitchen_credentials/`  
**Purpose:** Manage kitchen staff credentials.  
**Current Features:**
- Kitchen credentials list
- Manage credentials

**Missing / Proposed Improvements:**
- No role-based access control matrix

---

### 2.27 Account — Menu & Photos
**Path:** `lib/app/presentation/pages/account/menu_and_photos/`  
**Purpose:** Manage menu display and photo gallery.  
**Current Features:**
- Menu and photos view

**Missing / Proposed Improvements:**
- No drag-and-drop reorder for photos

---

### 2.28 Account — Notification List
**Path:** `lib/app/presentation/pages/account/notification_list/`  
**Purpose:** View in-app notifications.  
**Current Features:**
- Notification list

**Missing / Proposed Improvements:**
- No mark-all-as-read button
- No notification categories/filters

---

### 2.29 Account — Outlets
**Path:** `lib/app/presentation/pages/account/outlets/`  
**Purpose:** Manage multiple restaurant outlets.  
**Current Features:**
- Outlet list
- Manage outlet

**Missing / Proposed Improvements:**
- No map view of outlets
- No outlet-wise performance comparison

---

### 2.30 Account — Report Emergency
**Path:** `lib/app/presentation/pages/account/report_emergency/`  
**Purpose:** Emergency incident reporting.  
**Current Features:**
- Report form

**Missing / Proposed Improvements:**
- No photo/video attachment
- No emergency contact escalation

---

### 2.31 Account — Review List
**Path:** `lib/app/presentation/pages/account/review_list/`  
**Purpose:** View customer reviews.  
**Current Features:**
- Review list

**Missing / Proposed Improvements:**
- No reply-to-review feature
- No rating analytics

---

### 2.32 Account — Schedules
**Path:** `lib/app/presentation/pages/account/schedules/`  
**Purpose:** Manage opening/closing schedules.  
**Current Features:**
- Schedules view
- Schedule time picker modal
- Dining schedule modal

**Missing / Proposed Improvements:**
- No holiday calendar
- No recurring schedule templates

---

### 2.33 Account — Setting Section
**Path:** `lib/app/presentation/pages/account/setting_section/`  
**Purpose:** Account security and preferences.  
**Current Features:**
- Account settings
- Change email/mobile/password
- Delete account flow

**Missing / Proposed Improvements:**
- No two-factor authentication toggle
- No active sessions / login history

---

### 2.34 Account — Sounds
**Path:** `lib/app/presentation/pages/account/sounds/`  
**Purpose:** Configure notification sounds.  
**Current Features:**
- Sound selection list

**Missing / Proposed Improvements:**
- No per-event sound selection
- No volume control per sound type

---

### 2.35 Account — Subscription Packages
**Path:** `lib/app/presentation/pages/account/subscription_package/`  
**Purpose:** View and purchase subscription packages.  
**Current Features:**
- Subscription package list
- Payment view

**Missing / Proposed Improvements:**
- No auto-renewal toggle
- No plan comparison matrix

---

### 2.36 Account — Table Orders
**Path:** `lib/app/presentation/pages/account/table_orders/`  
**Purpose:** Dine-in / table-order management.  
**Current Features:**
- Table order list
- Table list
- Table order detail
- Print table QR

**Missing / Proposed Improvements:**
- No real-time table status board
- No split-bill / multiple payment support

---

### 2.37 Account — Tiffin Subscriptions
**Path:** `lib/app/presentation/pages/account/tiffin_subscription/`  
**Purpose:** Manage tiffin/meal subscription plans.  
**Current Features:**
- Tiffin subscription list
- Tiffin subscription dialog
- Tiffin subscription purchaser
- Purchase history detail

**Missing / Proposed Improvements:**
- No auto-renewal management
- No delivery schedule calendar

---

### 2.38 Account — Waiter List
**Path:** `lib/app/presentation/pages/account/waiter_list/`  
**Purpose:** Manage waiter staff.  
**Current Features:**
- Waiter list
- Manage waiter

**Missing / Proposed Improvements:**
- No shift scheduling
- No performance tracking

---

### 2.39 Account — Wallet
**Path:** `lib/app/presentation/pages/account/wallet/`  
**Purpose:** Financial wallet for restaurant earnings and payouts.  
**Current Features:**
- Cash in hand view
- Cash in hand history
- POS and table order commission
- Wallet detail
- Payout method
- Transaction history
- Withdrawal history
- Withdrawal request

**Missing / Proposed Improvements:**
- No UPI / bank transfer initiation flow
- No invoice generation for payouts

---

### 2.40 Modals — Order Verification
**Path:** `lib/app/presentation/pages/modals/order_verification_modal/`  
**Purpose:** Verify OTP for order delivery/pickup.  
**Current Features:**
- OTP input
- Verify action

**Missing / Proposed Improvements:**
- No resend-OTP countdown
- No call-customer fallback

---

### 2.41 Modals — Payment
**Path:** `lib/app/presentation/pages/modals/payment_modal/`  
**Purpose:** Select payment method.  
**Current Features:**
- Payment method list

**Missing / Proposed Improvements:**
- No saved payment methods display

---

### 2.42 Modals — Print Invoice
**Path:** `lib/app/presentation/pages/modals/print_order_invoice/`  
**Purpose:** Print / preview order invoice.  
**Current Features:**
- Print view for orders

**Missing / Proposed Improvements:**
- No share-to-PDF / email

---

### 2.43 Modals — Tiffin Subscription
**Path:** `lib/app/presentation/pages/modals/tiffin_subscription_*/`  
**Purpose:** Configure tiffin subscription details.  
**Current Features:**
- Food selection
- Instruction modal
- Off-days selection
- Time slot selection

**Missing / Proposed Improvements:**
- No auto-rotation of menu

---

### 2.44 Modals — Other
**Path:** Various under `lib/app/presentation/pages/modals/`  
**Purpose:** Various supporting modals.  
**Current Features:**
- Addons checklist, add expense, billing summary, cancellation reasons, complete dining booking, country modal, custom categories/sub-categories, deliveryman offline message, dining cancellation/category/help, find driver, Firebase verification, food info/taxation/variations, language translation, main categories/sub-categories, manage table, new menu, order complaints/help/verification, OTP, payment, POS menu, print invoices, select cuisine/delivery time/driver/restaurant facilities/type, tiffin subscription, web OTP, withdrawal history detail

**Missing / Proposed Improvements:**
- Same as Customer App modal gaps

---

### 2.45 Extra Pages
**Path:** `lib/app/presentation/pages/extra_pages/`  
**Purpose:** Error and edge-case screens.  
**Current Features:**
- Connection, maintenance, not found, server error views

**Missing / Proposed Improvements:**
- No offline-mode cached dashboard
- No retry-with-backoff UX

---

### 2.46 Media Modal
**Path:** `lib/app/presentation/pages/media/`  
**Purpose:** Image/media picker and upload.  
**Current Features:**
- 2-tab: Upload Files, Image Gallery
- Camera and gallery picker
- Upload progress loader
- Grid gallery with selectable images

**Missing / Proposed Improvements:**
- No multi-select
- No crop/rotate/preview
- No video support

---

## 3. Deliveryman App — Flutter

### 3.1 Splash Screen
**Path:** `lib/app/presentation/pages/splash/splash_view.dart`  
**Purpose:** Entry point; initializes app, checks auth/update/maintenance/connection.  
**Current Features:**
- Logo + app name
- Bloc-driven routing
- Locale initialization

**Missing / Proposed Improvements:**
- No splash animation
- No deep-link handling
- No retry UX

---

### 3.2 Intro / Onboarding
**Path:** `lib/app/presentation/pages/intro/intro_view.dart`  
**Purpose:** Permission request sequence (notification, camera, location).  
**Current Features:**
- Sequential permission requests
- Success/decline dialogs
- Persistent denied-forever dialog with Settings redirect

**Missing / Proposed Improvements:**
- No skip button
- No rationale text per permission
- No "Ask me later" option

---

### 3.3 Auth — Login Hub
**Path:** `lib/app/presentation/pages/auth/@core/login_view.dart`  
**Purpose:** Multi-modal login hub.  
**Current Features:**
- Language switcher
- Four login sub-screens: email/password, email OTP, phone/password, phone OTP

**Missing / Proposed Improvements:**
- No social login
- No biometric login
- No "Remember me"

---

### 3.4 Auth — Login Options
**Path:** `lib/app/presentation/pages/auth/login_options/`  
**Purpose:** Individual login flows.  
**Current Features:**
- Email password: form validation, password visibility toggle
- Email OTP: OTP entry flow
- Phone password: country code modal, digit-only formatter
- Phone OTP: country code, three verification paths (native, web, Firebase)

**Missing / Proposed Improvements:**
- No SMS auto-retrieve
- No OTP countdown timer
- No phone number formatting

---

### 3.5 Auth — Reset Password
**Path:** `lib/app/presentation/pages/auth/reset_password/`  
**Purpose:** Password recovery.  
**Current Features:**
- Email OTP and phone OTP reset flows

**Missing / Proposed Improvements:**
- No password strength meter
- No confirm password

---

### 3.6 Auth — Register Request
**Path:** `lib/app/presentation/pages/auth/register_request/`  
**Purpose:** Deliveryman registration/onboarding.  
**Current Features:**
- Extensive form: name, mobile, email, password, DOB, age, identity number
- Country code modal
- City/locality selection
- Image uploads: cover image, identity proof, driving license
- Bloc-managed validation and submit
- Success dialog

**Missing / Proposed Improvements:**
- No vehicle-type selection (bike/car/cargo)
- No real-time field validation feedback
- No progress indicator for document upload
- No draft-save / resume registration

---

### 3.7 Tabs / Bottom Navigation
**Path:** `lib/app/presentation/pages/tabs/tabs_view.dart`  
**Purpose:** Main authenticated shell with 5 tabs.  
**Current Features:**
- 5 tabs: Feeds, Payout, Deposite, Analytics, Account
- `TabController` with BLoC state
- Auto-logout if `canActivate == false`
- `AutomaticKeepAliveClientMixin` per tab

**Missing / Proposed Improvements:**
- No floating action button
- No badge indicators on tabs
- No middle tab shortcut

---

### 3.8 Feed Screen (Home / Map)
**Path:** `lib/app/presentation/pages/feeds/@core/feeds_view.dart`  
**Purpose:** Driver home screen with map, online/offline status, incoming orders.  
**Current Features:**
- Google Map with custom style
- Online/Offline/Blocked status chip
- Notification bell → notification list
- Refresh button
- New order modal when `isNewOrder`
- Offline reasons modal
- Go online confirmation modal
- Location-permission-denied dialog
- Account-blocked detection with forced logout

**Missing / Proposed Improvements:**
- No traffic/ETA overlay or route line
- No quick-settings toggle
- No offline banner
- No nearby restaurants / trending places overlay

---

### 3.9 New Order Modal
**Path:** `lib/app/presentation/pages/modals/new_order/`  
**Purpose:** Incoming order bottom sheet.  
**Current Features:**
- Full-screen bottom sheet
- Google Map of pickup/delivery
- Sound playback for online order alerts
- Accept/reject with cancellation-reason fallback
- Bloc state for loading/failure

**Missing / Proposed Improvements:**
- No timer/countdown for acceptance
- No estimated payout / distance preview
- No "Schedule for later" option
- No quick-block / auto-reject for categories

---

### 3.10 Go Online Modal
**Path:** `lib/app/presentation/pages/modals/go_online/`  
**Purpose:** Confirmation when switching from offline to online.  
**Current Features:**
- Yes/No confirmation buttons

**Missing / Proposed Improvements:**
- No zone/area availability check
- No reminder about required documents

---

### 3.11 Offline Reasons Modal
**Path:** `lib/app/presentation/pages/modals/offline_reasons/`  
**Purpose:** Driver selects reason for going offline.  
**Current Features:**
- List of predefined offline reasons

**Missing / Proposed Improvements:**
- No "Other" free-text option
- No duration selector (30 min / 1 hour / rest of day)

---

### 3.12 Cancellation Reasons Modal
**Path:** `lib/app/presentation/pages/modals/cancellation_reasons/`  
**Purpose:** Driver selects reason when cancelling an order.  
**Current Features:**
- Loading / error / empty states
- Bloc-managed reason list

**Missing / Proposed Improvements:**
- No "Other" text input
- No impact warning (cancellation rate / penalty)

---

### 3.13 Order List Screen
**Path:** `lib/app/presentation/pages/feeds/order_list/`  
**Purpose:** Historical/pending order list for the driver.  
**Current Features:**
- Pull-to-refresh
- Infinite scroll
- Loading, error, empty states

**Missing / Proposed Improvements:**
- No filter/search by date, status, order ID
- No tab separation (Active / Completed / Cancelled)

---

### 3.14 Order Detail Screen
**Path:** `lib/app/presentation/pages/feeds/order_details/`  
**Purpose:** Detailed view of a single active order.  
**Current Features:**
- Google Map integration for pickup/delivery route
- Order-number header
- Support chat button
- Background location permission dialog
- Pickup proof modal trigger
- Delivery proof modal trigger
- OTP verification trigger

**Missing / Proposed Improvements:**
- No live ETA / distance-to-pickup widget
- No customer contact quick-dial
- No order notes / special instructions
- No in-app navigation / turn-by-turn

---

### 3.15 Completed Order Detail
**Path:** `lib/app/presentation/pages/feeds/completed_order_detail/`  
**Purpose:** View details of a past/completed order.  
**Current Features:**
- Bloc state loading/error/empty

**Missing / Proposed Improvements:**
- No rebook action
- No breakdown of earnings/tips

---

### 3.16 Notification List
**Path:** `lib/app/presentation/pages/feeds/notification_list/`  
**Purpose:** List of push notifications.  
**Current Features:**
- Pull-to-refresh
- Infinite scroll

**Missing / Proposed Improvements:**
- No deep link to specific order
- No mark-as-read / delete actions

---

### 3.17 Analytics Screen
**Path:** `lib/app/presentation/pages/analytics/`  
**Purpose:** Deliveryman performance insights and charts.  
**Current Features:**
- Syncfusion charts
- Tooltip behavior
- Pull-to-refresh
- Skeleton UI

**Missing / Proposed Improvements:**
- No date-range selector
- No export / share report
- No comparison with previous period

---

### 3.18 Deposite (Cash in Hand)
**Path:** `lib/app/presentation/pages/deposite/`  
**Purpose:** Displays cash collected that needs settlement.  
**Current Features:**
- Cash-in-hand card
- Bloc-driven fetch
- Skeleton UI

**Missing / Proposed Improvements:**
- No deposit history list
- No "Request Deposit" action button
- No filter by date range

---

### 3.19 Payouts Screen
**Path:** `lib/app/presentation/pages/payouts/@core/payouts_view.dart`  
**Purpose:** Wallet and payout management hub with 4 sub-tabs.  
**Current Features:**
- Tabs: Withdrawal, Withdrawal History, Transaction History, Payout Accounts
- `TabController` with keep-alive

**Missing / Proposed Improvements:**
- No total balance / available balance summary header
- No quick-action FAB for new withdrawal

---

### 3.20 Wallet Withdrawal Request
**Path:** `lib/app/presentation/pages/payouts/wallet_withdrawal_request/`  
**Purpose:** Form to request payout.  
**Current Features:**
- Form fields
- Success dialog
- Skeleton loading

**Missing / Proposed Improvements:**
- No available balance / min-max limits display
- No instant-vs-scheduled toggle

---

### 3.21 Wallet Withdrawal History
**Path:** `lib/app/presentation/pages/payouts/wallet_withdrawal_history/`  
**Purpose:** List of past withdrawal requests.  
**Current Features:**
- Bloc state loading/error/empty
- Infinite scroll

**Missing / Proposed Improvements:**
- No filter by date or status

---

### 3.22 Wallet Transaction History
**Path:** `lib/app/presentation/pages/payouts/wallet_transaction_history/`  
**Purpose:** Chronological wallet transactions.  
**Current Features:**
- Bloc-managed list

**Missing / Proposed Improvements:**
- No filter/search
- No CSV/statement export

---

### 3.23 Payout Method Screen
**Path:** `lib/app/presentation/pages/payouts/payout_method/`  
**Purpose:** List saved payout methods.  
**Current Features:**
- Bloc state management

**Missing / Proposed Improvements:**
- No add-new-method inline CTA
- No default-method indicator

---

### 3.24 Manage Payout Method
**Path:** `lib/app/presentation/pages/payouts/payout_method/manage_payout_method/`  
**Purpose:** Add/edit payout method.  
**Current Features:**
- Form with validation
- Bloc submit flow

**Missing / Proposed Improvements:**
- No document upload for bank proof (KYC)
- No verification status display

---

### 3.25 Account Screen
**Path:** `lib/app/presentation/pages/account/@core/account_view.dart`  
**Purpose:** Profile hub with settings shortcuts.  
**Current Features:**
- Driver avatar, name, email, cover image
- Edit profile link
- Reviews, Chat Messages, Dark/Light mode toggle, Notification Sound
- More: Language, About, Privacy, Terms, Refund, Shipping, Cancellation, Help, FAQs, Send Feedback, Report Emergency, Settings, Logout

**Missing / Proposed Improvements:**
- No referral / invite code section
- No total earnings / pending payout summary card
- No quick stats (orders completed, rating, hours online)
- No push-notification toggle

---

### 3.26 Edit Profile
**Path:** `lib/app/presentation/pages/account/edit_profile/`  
**Purpose:** Update driver personal details and documents.  
**Current Features:**
- Fields: first/last name, email, mobile, DOB, city, locality, identity number
- Image picker for profile/cover and documents
- Country code modal
- Form validation on unfocus

**Missing / Proposed Improvements:**
- No address map picker
- No vehicle/document expiry reminders

---

### 3.27 Review List
**Path:** `lib/app/presentation/pages/account/reviews/`  
**Purpose:** Display customer reviews and ratings.  
**Current Features:**
- Bloc state loading/error/empty
- Skeleton UI

**Missing / Proposed Improvements:**
- No filter by star rating or date
- No reply-to-review action
- No average-rating summary card

---

### 3.28 Chat Card Screen
**Path:** `lib/app/presentation/pages/chats/@core/chat_card_view.dart`  
**Purpose:** Tabbed container for Chat List and Support Chat List.  
**Current Features:**
- 2 tabs: chats vs support chats

**Missing / Proposed Improvements:**
- No search bar for chats
- No unread-message badge count

---

### 3.29 Chat List Screen
**Path:** `lib/app/presentation/pages/chats/chat_list/`  
**Purpose:** List of user/customer chats.  
**Current Features:**
- Infinite scroll
- Chat info tiles with last message preview

**Missing / Proposed Improvements:**
- No archived / muted filters
- No swipe-to-archive or mute

---

### 3.30 Message Screen (Chat Conversation)
**Path:** `lib/app/presentation/pages/chats/messages/`  
**Purpose:** Real-time 1:1 chat via Socket.IO.  
**Current Features:**
- Socket.IO chat service
- Scroll-to-top load-more pagination
- Message input controller
- UUID-based message ID generation

**Missing / Proposed Improvements:**
- No image/file attachment picker
- No message search within conversation
- No delivery/read receipts
- No voice note recording
- No block/report user inline action

---

### 3.31 Support Chat List
**Path:** `lib/app/presentation/pages/chats/support_chat_list/`  
**Purpose:** List of support/admin chat threads.  
**Current Features:**
- Bloc state loading/error/empty

**Missing / Proposed Improvements:**
- No priority / ticket-ID column
- No filter by resolved/unresolved

---

### 3.32 Support Chat Screen
**Path:** `lib/app/presentation/pages/chats/support_chat/`  
**Purpose:** Live support conversation via Socket.IO.  
**Current Features:**
- Socket.IO real-time messaging
- Load-more pagination
- Message input

**Missing / Proposed Improvements:**
- No attachment/upload support
- No "Mark as resolved" button
- No canned/quick replies

---

### 3.33 Feedback Form
**Path:** `lib/app/presentation/pages/account/feedback_form/`  
**Purpose:** Submit feedback/bug reports.  
**Current Features:**
- Fields: name, country code, number, email, description

**Missing / Proposed Improvements:**
- No category selector
- No screenshot/attachment upload
- No ticket ID returned

---

### 3.34 Report Emergency
**Path:** `lib/app/presentation/pages/account/report_emergency/`  
**Purpose:** Emergency incident reporting.  
**Current Features:**
- Fields: name, country code, number, email, description
- Report type dropdown

**Missing / Proposed Improvements:**
- No auto-capture of current location
- No photo/video evidence upload
- No emergency contact escalation

---

### 3.35 Setting Section
**Path:** `lib/app/presentation/pages/account/setting_section/`  
**Purpose:** App-level settings.  
**Current Features:**
- Version display
- Edit profile shortcut
- App settings sub-screen
- Dark/light mode toggle

**Missing / Proposed Improvements:**
- No cache-clear option
- No logout-all-devices option

---

### 3.36 Notification Sound
**Path:** `lib/app/presentation/pages/account/sounds/`  
**Purpose:** Select notification sounds.  
**Current Features:**
- Sound list with play/pause
- Radio-button selection

**Missing / Proposed Improvements:**
- No vibration pattern selection
- No per-notification-type sound

---

### 3.37 Order Pickup Proof Modal
**Path:** `lib/app/presentation/pages/modals/order_pickup_proof/`  
**Purpose:** Capture photo proof at restaurant pickup.  
**Current Features:**
- Image picker (camera/gallery)
- Upload loader

**Missing / Proposed Improvements:**
- No camera preview with overlay guides
- No auto-capture timer

---

### 3.38 Order Delivery Proof Modal
**Path:** `lib/app/presentation/pages/modals/order_delivery_proof/`  
**Purpose:** Capture photo proof at customer delivery.  
**Current Features:**
- Image picker + upload

**Missing / Proposed Improvements:**
- No GPS stamp / timestamp metadata display

---

### 3.39 Order Verify OTP Modal
**Path:** `lib/app/presentation/pages/modals/order_verify_otp/`  
**Purpose:** Verify customer-provided OTP for order hand-off.  
**Current Features:**
- Dynamic OTP length
- OTP text field with box style

**Missing / Proposed Improvements:**
- No resend-OTP countdown
- No call-customer fallback button

---

### 3.40 Firebase Verification Modal
**Path:** `lib/app/presentation/pages/modals/firebase_verification_modal/`  
**Purpose:** Firebase phone-number OTP verification.  
**Current Features:**
- Send OTP via Firebase
- Auto-retrieve / manual OTP entry

**Missing / Proposed Improvements:**
- No resend-OTP timer/countdown
- No auto-retrieval indication

---

### 3.41 OTP Modal
**Path:** `lib/app/presentation/pages/modals/otp_modal/`  
**Purpose:** Generic reusable OTP entry modal.  
**Current Features:**
- Configurable OTP length
- Resend OTP button
- Verify button

**Missing / Proposed Improvements:**
- No timer for resend
- No auto-fill / SMS autofill

---

### 3.42 Web OTP Modal
**Path:** `lib/app/presentation/pages/modals/web_otp_modal/`  
**Purpose:** Web-specific OTP input.  
**Current Features:**
- Bloc state machine

**Missing / Proposed Improvements:**
- No cross-platform parity check

---

### 3.43 Language Translation Modal
**Path:** `lib/app/presentation/pages/modals/language_translation_modal/`  
**Purpose:** Bottom-sheet language selector.  
**Current Features:**
- List of supported languages
- Radio-button selection
- Active/inactive flag image display

**Missing / Proposed Improvements:**
- No search/filter for languages
- No "System default" option

---

### 3.44 Country Modal
**Path:** `lib/app/presentation/pages/modals/country_modal/`  
**Purpose:** Country/code picker for phone numbers.  
**Current Features:**
- Search field
- Country list with flag, dial code, name

**Missing / Proposed Improvements:**
- No recent/recently-used countries section
- No alphabetical index / fast scroll

---

### 3.45 Permission Denied Modal
**Path:** `lib/app/presentation/pages/modals/permission_denied/`  
**Purpose:** Persistent dialog when location permission is permanently denied.  
**Current Features:**
- Icon + explanatory text
- Cancel and Settings actions

**Missing / Proposed Improvements:**
- No rationale text before redirecting to settings
- No "Never ask again" awareness messaging

---

### 3.46 Connection / Maintenance / NotFound / ServerError Screens
**Path:** `lib/app/presentation/pages/extra_pages/`  
**Purpose:** Error and system-state fallback screens.  
**Current Features:**
- Illustrated error states
- Localized title and subtitle
- Try Again button

**Missing / Proposed Improvements:**
- No retry logic / actual connectivity check
- No contact support action
- No error code / support reference ID

---

### 3.47 App Pages Screen
**Path:** `lib/app/presentation/pages/app_pages/`  
**Purpose:** Render static CMS pages.  
**Current Features:**
- `HtmlWidget` rendering
- Slug-based routing

**Missing / Proposed Improvements:**
- No offline caching
- No share / print action

---

## 4. Kitchen App — Flutter

### 4.1 Splash Screen
**Path:** `lib/app/presentation/pages/splash/`  
**Purpose:** Entry point.  
**Current Features:**
- Logo + app name
- Bloc-driven routing

**Missing / Proposed Improvements:**
- Same as other apps

---

### 4.2 Auth — Login Hub
**Path:** `lib/app/presentation/pages/auth/@core/login_view.dart`  
**Purpose:** Dynamic login rendering.  
**Current Features:**
- Dynamic sub-screen rendering
- Theme toggle
- Language switcher

**Missing / Proposed Improvements:**
- Same as other apps

---

### 4.3 Auth — Login Options
**Path:** `lib/app/presentation/pages/auth/login_options/`  
**Purpose:** Email/password, email OTP, phone/password, phone OTP.  
**Current Features:**
- All four login modes
- Bloc-driven validation

**Missing / Proposed Improvements:**
- Same as other apps

---

### 4.4 Auth — Reset Password
**Path:** `lib/app/presentation/pages/auth/reset_password/`  
**Purpose:** Password reset.  
**Current Features:**
- Email OTP and phone OTP flows

**Missing / Proposed Improvements:**
- No password strength meter
- No confirm password

---

### 4.5 Food List Screen
**Path:** `lib/app/presentation/pages/food_list/@core/food_list_view.dart`  
**Purpose:** Display categorized food menu with stock management.  
**Current Features:**
- Expandable/collapsible category sections (custom + main)
- Food item tiles with name, description, price, image
- In-stock / out-of-stock toggle switch per item
- Navigate to FoodDetailScreen for full update
- Loading skeletons, empty state, error state
- Keep-alive state

**Missing / Proposed Improvements:**
- No search or filter functionality
- No category creation/editing/deletion UI
- No barcode/QR scan to find food
- No batch stock update
- No "Mark all in stock / out of stock" action
- No category reordering

---

### 4.6 Food Detail Screen
**Path:** `lib/app/presentation/pages/food_list/food_detail/`  
**Purpose:** Edit food item details.  
**Current Features:**
- Read-only name and description fields
- Addons selector via AddonsChecklistModal
- Stock type dropdown (unlimited, limited, daily)
- Stock number input (conditional on stock type)
- Variation list with add/edit/delete actions
- Image display with error border indicator

**Missing / Proposed Improvements:**
- No image upload/change from this screen
- No category assignment editor
- No cooking time / preparation time field
- No visibility/availability toggle beyond stock
- No pricing tier or discount field

---

### 4.7 Variation Modal Screen
**Path:** `lib/app/presentation/pages/food_list/food_detail/variations_modal/`  
**Purpose:** Create or edit food variations.  
**Current Features:**
- Required dropdown
- Selection type dropdown (single/multi)
- Variation title input
- Min/max options-to-select inputs
- Add new variation option via nested dialog

**Missing / Proposed Improvements:**
- No drag-to-reorder options
- No duplicate option prevention
- No option image support

---

### 4.8 Order List Screen
**Path:** `lib/app/presentation/pages/orders/@core/order_list_view.dart`  
**Purpose:** Displays incoming orders grouped by tab status.  
**Current Features:**
- Horizontal tab bar for order statuses (new, preparing, etc.) with count chips
- RefreshIndicator for pull-to-refresh
- Infinite scroll / load-more on scroll
- Order tiles showing order type, order number, timestamp
- Cooking instruction highlight
- Cart items with quantity, name, options, instructions, price
- Action buttons: "Prepare Order" (new), "Complete Order" (preparing)
- Loading skeletons, empty state, error state

**Missing / Proposed Improvements:**
- No order search or advanced filter (by date, customer, item)
- No bulk actions (accept multiple orders)
- No order cancellation/rejection UI from kitchen side
- No priority/express order indicator
- No estimated preparation time display or setting
- No customer note / special instruction expand/collapse
- No print / kitchen ticket generation (KOT)
- No audio alert for new orders

---

### 4.9 Order Detail Screen
**Path:** `lib/app/presentation/pages/orders/order_detail/`  
**Purpose:** Detailed view of a single order.  
**Current Features:**
- Order number display
- Order reference ID and date/time
- Cart item list with quantity, name, options, instructions, price
- Global cooking instruction display
- Prepare Order / Complete Order buttons based on status

**Missing / Proposed Improvements:**
- No order timeline / status history
- No customer information (name, mobile, table number detail)
- No payment method display
- No delivery partner / table assignment details
- No print / KOT button
- No note to customer field
- No refund/void option

---

### 4.10 Account Screen
**Path:** `lib/app/presentation/pages/account/@core/account_view.dart`  
**Purpose:** Main profile/account hub.  
**Current Features:**
- Profile header with avatar, name, email
- Settings sections: Profile (theme toggle, notifications, notification sound), More (language, about, privacy, terms, refund, shipping, cancellation, help, FAQs, feedback, emergency, settings, logout)
- App logo and version footer

**Missing / Proposed Improvements:**
- No dashboard stats (today's orders, revenue, pending items)
- No quick action cards
- No wallet / earnings summary
- No subscription / plan info
- No in-app support chat

---

### 4.11 Edit Profile
**Path:** `lib/app/presentation/pages/account/edit_profile/`  
**Purpose:** Update kitchen owner profile.  
**Current Features:**
- Avatar upload
- First name, last name
- Email (read-only), mobile (read-only)
- Gender dropdown

**Missing / Proposed Improvements:**
- No address / restaurant details edit
- No business name / shop name field
- No FSSAI / license number field
- No operational hours edit
- No bank details / payout info

---

### 4.12 Notification List
**Path:** `lib/app/presentation/pages/account/notification_list/`  
**Purpose:** Display notifications.  
**Current Features:**
- Notification list with mark-all-read
- Pull-to-refresh
- Infinite scroll

**Missing / Proposed Improvements:**
- No notification categorization
- No swipe-to-delete
- No filter (read/unread)

---

### 4.13 Feedback Form
**Path:** `lib/app/presentation/pages/account/feedback_form/`  
**Purpose:** Submit feedback.  
**Current Features:**
- Email, name, country code + mobile, description

**Missing / Proposed Improvements:**
- No category selector
- No screenshot/attachment
- No ticket ID returned

---

### 4.14 Report Emergency
**Path:** `lib/app/presentation/pages/account/report_emergency/`  
**Purpose:** Emergency reporting.  
**Current Features:**
- Report type dropdown
- Email, name, country code + mobile, description

**Missing / Proposed Improvements:**
- No image/evidence attachment
- No urgency/priority selector
- No location auto-fill

---

### 4.15 Notification Sound
**Path:** `lib/app/presentation/pages/account/sounds/`  
**Purpose:** Select notification bell sounds.  
**Current Features:**
- Sound list with play/pause toggle
- Radio-button selection

**Missing / Proposed Improvements:**
- No volume control slider
- No custom sound upload

---

### 4.16 App Pages Screen
**Path:** `lib/app/presentation/pages/account/app_pages/`  
**Purpose:** Render static CMS pages.  
**Current Features:**
- Slug-based routing
- HtmlWidget rendering

**Missing / Proposed Improvements:**
- No offline caching
- No share / print

---

### 4.17 Setting Section
**Path:** `lib/app/presentation/pages/account/setting_section/`  
**Purpose:** Settings hub.  
**Current Features:**
- Profile info shortcut
- Alert preferences shortcut
- Account settings shortcut
- Device access / app settings shortcut

**Missing / Proposed Improvements:**
- No theme mode selection (light/dark/system)
- No cache clear

---

### 4.18 Account Setting
**Path:** `lib/app/presentation/pages/account/setting_section/account_setting/`  
**Purpose:** Account credential management.  
**Current Features:**
- Change Email, Change Mobile, Change Password, Delete Account

**Missing / Proposed Improvements:**
- No two-factor authentication toggle
- No active sessions / login history

---

### 4.19 Alert Preferences
**Path:** `lib/app/presentation/pages/account/setting_section/account_setting/account_setting_alert_setting/`  
**Purpose:** Granular notification toggles.  
**Current Features:**
- Grouped sections: Newsletters, Promo Offers, Social Alerts, Order Purchases, Account Updates
- Per-channel toggles for email, push, WhatsApp

**Missing / Proposed Improvements:**
- No per-channel sound selection
- No quiet hours / DND schedule
- No "Turn off all" / "Turn on all" master switch

---

### 4.20 Change Mobile
**Path:** `lib/app/presentation/pages/account/setting_section/account_setting/account_setting_change_mobile/`  
**Purpose:** Re-authenticate and change mobile.  
**Current Features:**
- Country code picker
- New mobile number input
- Three verification paths

**Missing / Proposed Improvements:**
- No OTP resend countdown
- No phone number formatting

---

### 4.21 Change Email
**Path:** `lib/app/presentation/pages/account/setting_section/account_setting/account_setting_change_email/`  
**Purpose:** Re-authenticate and change email.  
**Current Features:**
- Email input with validation
- OTP modal integration

**Missing / Proposed Improvements:**
- No confirm-email field
- No resend OTP timer

---

### 4.22 Update Password
**Path:** `lib/app/presentation/pages/account/setting_section/account_setting/account_setting_update_password/`  
**Purpose:** Change account password.  
**Current Features:**
- New password + confirm password
- Password validation

**Missing / Proposed Improvements:**
- No current password field
- No password strength indicator

---

### 4.23 Delete Account
**Path:** `lib/app/presentation/pages/account/setting_section/account_setting/account_setting_delete_account/`  
**Purpose:** Account deletion flow.  
**Current Features:**
- Reason list
- Submit confirmation with legal notices

**Missing / Proposed Improvements:**
- No "Cancel" button in submit screen
- No retention period notice
- No data export option

---

### 4.24 Modals — Addons Checklist
**Path:** `lib/app/presentation/pages/modals/addons_checklist/`  
**Purpose:** Multi-select addons for food items.  
**Current Features:**
- Checkbox list
- Pre-selected addons highlighting

**Missing / Proposed Improvements:**
- No search/filter within addons
- No category grouping
- No price display per addon
- No quantity selector per addon

---

### 4.25 Modals — OTP
**Path:** `lib/app/presentation/pages/modals/otp_modal/`  
**Purpose:** Generic OTP entry.  
**Current Features:**
- OTP text field
- Resend OTP button
- Verify button

**Missing / Proposed Improvements:**
- No countdown timer
- No auto-fill

---

### 4.26 Modals — Firebase Verification
**Path:** `lib/app/presentation/pages/modals/firebase_verification_modal/`  
**Purpose:** Firebase SMS verification.  
**Current Features:**
- Send OTP via Firebase
- Auto-retrieve / manual entry

**Missing / Proposed Improvements:**
- No resend / timeout handling

---

### 4.27 Modals — Language Translation
**Path:** `lib/app/presentation/pages/modals/language_translation_modal/`  
**Purpose:** Language selector.  
**Current Features:**
- List of supported languages
- Radio-button selection

**Missing / Proposed Improvements:**
- No search within language list
- No "System default" option

---

### 4.28 Modals — Country
**Path:** `lib/app/presentation/pages/modals/country_modal/`  
**Purpose:** Country/code picker.  
**Current Features:**
- Search field
- Country list with flag, dial code, name

**Missing / Proposed Improvements:**
- No recent countries section
- No alphabetical index

---

### 4.29 Modals — Web OTP
**Path:** `lib/app/presentation/pages/modals/web_otp_modal/`  
**Purpose:** WebView-based OTP input.  
**Current Features:**
- WebView loading backend endpoint
- JavaScript channel for toast messages
- URL callback parsing

**Missing / Proposed Improvements:**
- No fallback to native OTP if WebView fails

---

### 4.30 Extra Pages
**Path:** `lib/app/presentation/pages/extra_pages/`  
**Purpose:** Error screens.  
**Current Features:**
- Connection, maintenance, not found, server error views

**Missing / Proposed Improvements:**
- No retry logic
- No contact support action

---

## 5. Waiter App — Flutter

### 5.1 Splash Screen
**Path:** `lib/app/presentation/pages/splash/`  
**Purpose:** Entry point.  
**Current Features:**
- Logo + app name
- Bloc-driven routing

**Missing / Proposed Improvements:**
- Same as other apps

---

### 5.2 Auth — Login Hub
**Path:** `lib/app/presentation/pages/auth/@core/login_view.dart`  
**Purpose:** Dynamic login rendering.  
**Current Features:**
- Theme toggle
- Language switcher
- Four login sub-screens

**Missing / Proposed Improvements:**
- Same as other apps

---

### 5.3 Auth — Login Options
**Path:** `lib/app/presentation/pages/auth/login_options/`  
**Purpose:** Individual login flows.  
**Current Features:**
- Email/password, email OTP, phone/password, phone OTP
- Bloc-driven validation

**Missing / Proposed Improvements:**
- Same as other apps

---

### 5.4 Auth — Reset Password
**Path:** `lib/app/presentation/pages/auth/reset_password/`  
**Purpose:** Password recovery.  
**Current Features:**
- Email OTP and phone OTP flows

**Missing / Proposed Improvements:**
- No password strength meter
- No confirm password

---

### 5.5 Bottom Tabs
**Path:** `lib/app/presentation/pages/tabs/`  
**Purpose:** Main app shell.  
**Current Features:**
- Tab navigation
- Keep-alive state

**Missing / Proposed Improvements:**
- No badge indicators
- No FAB

---

### 5.6 Food List Screen
**Path:** `lib/app/presentation/pages/food_list/`  
**Purpose:** Display menu items for waiters.  
**Current Features:**
- Food list with bloc
- Bloc state loading/error/empty

**Missing / Proposed Improvements:**
- No category filter
- No search
- No stock status indicator

---

### 5.7 Table Orders — Dashboard
**Path:** `lib/app/presentation/pages/table_orders/table_order_dashboard/`  
**Purpose:** Overview of table orders.  
**Current Features:**
- Bloc state management

**Missing / Proposed Improvements:**
- No table status grid (occupied/vacant/reserved)
- No order count per table
- No quick actions per table

---

### 5.8 Table Orders — Confirmation
**Path:** `lib/app/presentation/pages/table_orders/table_order_confirmation/`  
**Purpose:** Confirm table orders.  
**Current Features:**
- Bloc-driven confirmation flow

**Missing / Proposed Improvements:**
- No order notes / special instructions
- No split-bill option

---

### 5.9 Table Orders — Ongoing Items
**Path:** `lib/app/presentation/pages/table_orders/table_ongoing_item/`  
**Purpose:** View ongoing order items for a table.  
**Current Features:**
- Bloc-driven list

**Missing / Proposed Improvements:**
- No item status (preparing / ready / served)
- No modify order / add items

---

### 5.10 Table Orders — Search
**Path:** `lib/app/presentation/pages/table_orders/table_order_search/`  
**Purpose:** Search table orders.  
**Current Features:**
- Bloc-driven search

**Missing / Proposed Improvements:**
- No advanced filters (date, status, table number)

---

### 5.11 Account Screen
**Path:** `lib/app/presentation/pages/account/@core/account_view.dart`  
**Purpose:** Profile hub.  
**Current Features:**
- Profile header
- Settings sections

**Missing / Proposed Improvements:**
- No quick stats (tables served, orders taken, tips earned)
- No wallet summary

---

### 5.12 Edit Profile
**Path:** `lib/app/presentation/pages/account/edit_profile/`  
**Purpose:** Update waiter profile.  
**Current Features:**
- Form fields
- Bloc-driven submit

**Missing / Proposed Improvements:**
- No shift schedule management
- No table assignment view

---

### 5.13 Feedback Form
**Path:** `lib/app/presentation/pages/account/feedback_form/`  
**Purpose:** Submit feedback.  
**Current Features:**
- Feedback form

**Missing / Proposed Improvements:**
- No category selector
- No attachment upload

---

### 5.14 Report Emergency
**Path:** `lib/app/presentation/pages/account/report_emergency/`  
**Purpose:** Emergency reporting.  
**Current Features:**
- Report form with type selector

**Missing / Proposed Improvements:**
- No location auto-capture
- No photo/video upload

---

### 5.15 Setting Section
**Path:** `lib/app/presentation/pages/account/setting_section/`  
**Purpose:** App settings.  
**Current Features:**
- Settings hub with navigation

**Missing / Proposed Improvements:**
- No theme toggle visible
- No notification preferences

---

### 5.16 Modals — Food Info
**Path:** `lib/app/presentation/pages/modals/food_info_modal/`  
**Purpose:** Show food details.  
**Current Features:**
- Bloc-driven food info display

**Missing / Proposed Improvements:**
- No nutrition info / allergen warnings

---

### 5.17 Modals — Food Variations
**Path:** `lib/app/presentation/pages/modals/food_variations_modal/`  
**Purpose:** Select food variations.  
**Current Features:**
- Variation options selection

**Missing / Proposed Improvements:**
- No quantity selector per variation

---

### 5.18 Modals — POS Menu
**Path:** `lib/app/presentation/pages/modals/pos_menu_modal/`  
**Purpose:** Quick category navigation.  
**Current Features:**
- Category list

**Missing / Proposed Improvements:**
- No search within categories

---

### 5.19 Modals — OTP / Firebase Verification / Language / Country / Web OTP
**Path:** Various under `lib/app/presentation/pages/modals/`  
**Purpose:** Standard modals.  
**Current Features:**
- Same patterns as other apps

**Missing / Proposed Improvements:**
- Same as other apps

---

### 5.20 Extra Pages
**Path:** `lib/app/presentation/pages/extra_pages/`  
**Purpose:** Error screens.  
**Current Features:**
- Connection, maintenance, not found, server error

**Missing / Proposed Improvements:**
- Same as other apps

---

## 6. Cross-Platform Quick Wins

| # | Quick Win | Effort | Impact |
|---|---|---|---|
| 1 | Add loading skeletons to all list screens | Low | High |
| 2 | Add pull-to-refresh to all Flutter list screens | Low | Medium |
| 3 | Add dark mode toggle (theme BLoC already exists) | Low | Medium |
| 4 | Add Hive for offline storage | Medium | High |
| 5 | Add error boundaries in Flutter apps | Low | Medium |
| 6 | Design consistent empty states for all screens | Low | Medium |
| 7 | Add confirmation dialogs for delete/cancel actions | Low | Low |
| 8 | Replace loading spinners with skeletons in Admin | Low | Medium |
| 9 | Use `ngx-toastr` everywhere in Admin panel | Low | Medium |
| 10 | Add confetti animation on order placement/payment success | Low | Delight |

---

*End of document. No code changes have been made.*
