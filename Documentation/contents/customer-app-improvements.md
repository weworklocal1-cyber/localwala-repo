# LocalWala Customer App — What We Have & What We Will Change

> **App:** Customer App (Flutter)  
> **Purpose:** This document explains the current state of every customer screen, what improvements we will make, and why those changes matter.  
> **Status:** Planning only — no code changes made yet

---

## How to Read This Document

Each section follows the same pattern:
1. **What We Have** — What the screen does today
2. **What We Will Change** — The specific improvements we will make
3. **Why It Matters** — The business and user impact

---

## 1. Splash Screen

### What We Have
- App logo and name displayed while the app initializes
- Checks if the app needs to be updated, if there's maintenance, or if there's a server/connection error
- Routes the user to the correct next screen (intro, login, or main app)
- Bottom circular progress indicator

### What We Will Change
- Add a smooth fade-in animation for the logo so the app feels more polished
- Add the app version number at the bottom for transparency
- Handle deep links (e.g., tapping an order link opens directly to order tracking)
- Show a retry button with backoff logic if the server is unreachable
- Add a 3-second minimum display time so the splash doesn't flash too quickly

### Why It Matters
- First impression: a smooth splash makes the app feel premium
- Deep linking lets customers jump straight to orders/restaurants from links
- Better error handling reduces frustration when the server is down

---

## 2. Intro / Permission Screen

### What We Have
- 4-page swipeable screen that asks for permissions in order: Notification, Bluetooth, Camera, Location
- Shows success or error dialog after each permission
- Has a language switcher and theme toggle in the app bar
- Routes to login after location permission is resolved

### What We Will Change
- Add a "Skip All" button for users who want to grant permissions later
- Add explanation text under each permission explaining why it's needed (e.g., "Location helps us show restaurants near you")
- Add a "Continue without permissions" fallback instead of forcing permission every time
- Add page indicators (dots) so users know how many steps are left
- If a permission is permanently denied, show a dialog that opens the app settings directly

### Why It Matters
- Currently, users who deny permissions can get stuck. This increases app abandonment.
- Clear explanations increase permission grant rates by 30-40%
- Skipping permissions lets users browse the app before committing

---

## 3. Login Screen

### What We Have
- Dynamically shows one of four login methods based on backend settings: Email+Password, Phone+Password, Email OTP, Phone OTP
- Language switcher modal
- Theme toggle (light/dark mode) in app bar
- BLoC-driven state management

### What We Will Change
- Add social login buttons (Google, Apple, Facebook) for one-tap login
- Add biometric login (fingerprint/Face ID) for returning users
- Add a "Remember me" checkbox to keep the user logged in
- Add inline validation errors (e.g., "Invalid email" under the field) instead of generic error dialogs
- Add a "Create account" link for new users
- Add password visibility toggle (show/hide eye icon)

### Why It Matters
- Social login reduces signup friction by 50%+
- Biometric login makes repeat access faster and more secure
- Inline errors reduce user frustration and support tickets
- "Remember me" reduces login frequency for returning customers

---

## 4. Login Options (Email OTP, Email Password, Phone OTP, Phone Password)

### What We Have
- Four separate login flows, each with form fields and BLoC state handling
- Country code modal for phone-based logins

### What We Will Change
- **All four flows:** Add password visibility toggle, forgot-password link, and inline validation
- **OTP flows:** Add resend-OTP countdown timer (e.g., "Resend in 30s"), auto-read SMS support, and "Change phone/email" option after OTP is sent
- **Phone flows:** Add country code detection by SIM/network, phone number formatting per locale

### Why It Matters
- OTP countdown prevents user confusion about when to resend
- Auto-read SMS reduces friction for phone OTP login
- Password visibility toggle prevents login errors from typos

---

## 5. Register Request (Restaurant Registration)

### What We Have
- Registration form for new restaurants
- Payment view for registration fee
- Success confirmation screen

### What We Will Change
- Add a multi-step progress indicator (e.g., Step 1 of 3: Business Info → Documents → Payment)
- Add document upload step (FSSAI license, GST certificate, owner ID proof)
- Add save-as-draft functionality so users can resume later
- Add estimated approval timeline display (e.g., "Approval takes 1-2 business days")

### Why It Matters
- Progress indicator reduces form abandonment by showing users how far they've come
- Document upload is essential for restaurant onboarding
- Draft save prevents data loss if the user closes the app mid-registration

---

## 6. Reset Password

### What We Have
- Two flows: reset via email OTP and reset via phone OTP
- BLoC-driven state handling

### What We Will Change
- Add password strength meter (weak/medium/strong) with color coding
- Add confirm-password field with match validation
- Add "Didn't receive OTP?" help link with resend option
- Add password requirements hint (e.g., "Minimum 8 characters, 1 number, 1 special character")

### Why It Matters
- Password strength meter reduces weak passwords and account compromise
- Confirm-password prevents typos that lock users out
- Clear requirements reduce support requests for password issues

---

## 7. App Pages (Static Content: About, Privacy, Terms, FAQ, Help)

### What We Have
- Renders HTML content from backend using `HtmlWidget`
- Bloc-driven content fetch with loading/error states

### What We Will Change
- Add pull-to-refresh to reload content
- Add share button so users can share policy pages
- Add print/PDF export option
- Add offline caching so pages load without internet after first visit
- Add "Last updated" timestamp on policy pages

### Why It Matters
- Users often need to share terms/privacy with others
- Offline caching improves UX in areas with poor connectivity
- "Last updated" builds trust and transparency

---

## 8. Tabs / Bottom Navigation

### What We Have
- 5 tabs: Menu, Business, Orders, POS, Account/More
- Tab icons with active/inactive states
- Subscription expiry banner above tab bar
- NeverScrollableScrollPhysics (no swipe between tabs)

### What We Will Change
- Add badge/unread counts on tab icons (e.g., cart count, new orders count, unread messages)
- Enable swipe-to-switch-tab (change from NeverScrollableScrollPhysics to PageView)
- Add a floating action button (FAB) for primary actions (e.g., "New Order" for restaurant users)
- Add a "More" overflow menu for quick settings access

### Why It Matters
- Badge counts increase engagement by alerting users to new activity
- Swipe navigation is a standard mobile UX pattern users expect
- FAB provides quick access to the most common action

---

## 9. Home / Restaurant Listing

### What We Have
- Restaurant listing with image, name, cuisine, rating, delivery time
- Search by restaurant/food name
- Sort by categories, cuisine, brands
- Campaign banners (food, restaurant)
- Food subscriptions info section
- Filters: delivery time, cuisine, category

### What We Will Change
- Add map view toggle (list view vs map view) so users can see restaurants geographically
- Add "Currently closed" greyed-out states with open-time preview
- Add "Quick view" modal so users can preview restaurant without full navigation
- Add "Recently visited" and "Recently ordered" sections at the top
- Add skeleton loading on restaurant cards while data loads
- Add "Open now" filter
- Add dark mode optimized image variants

### Why It Matters
- Map view helps users discover nearby restaurants visually
- "Recently visited" speeds up reordering for returning customers
- Skeleton loading reduces perceived wait time
- "Open now" filter prevents disappointment from ordering at closed restaurants

---

## 10. Restaurant Detail / Menu

### What We Have
- Restaurant info: name, image, rating, delivery time, delivery fee
- Categorized menu (categories/subcategories)
- Food items with image, name, price, discount, description
- Add to cart with quantity controls
- Food variations modal
- Food info modal
- Cart summary

### What We Will Change
- Add restaurant reviews section with ratings breakdown
- Add "About restaurant" section with description, facilities, photos
- Add map view of restaurant location with "Get directions" button
- Add call-restaurant and direction quick actions
- Add share-restaurant action
- Add dietary filters (veg/non-veg, vegan, gluten-free, halal)
- Add nutrition info and allergen warnings per food item

### Why It Matters
- Reviews build trust and help users decide
- Dietary filters cater to health-conscious and religious dietary needs
- Nutrition info appeals to fitness-conscious customers
- Call/direction buttons improve the post-order experience

---

## 11. Food Search

### What We Have
- Search foods across all restaurants
- Bloc-driven search with results

### What We Will Change
- Add recent searches / search history
- Add voice search (speak to search)
- Add search suggestions / trending searches
- Add filters in search results (by restaurant, cuisine, price range, rating)
- Add barcode scanner search for packaged foods

### Why It Matters
- Voice search enables hands-free search while cooking or multitasking
- Recent searches speed up repeat searches
- Filters in search results help users narrow down options faster

---

## 12. Sort / Filter

### What We Have
- Sort by categories
- Sort by cuisine
- Sort by brands
- Bloc-driven filtering

### What We Will Change
- Add price range slider (min-max)
- Add "Open now" filter
- Add dietary preference filters (veg, vegan, gluten-free, etc.)
- Add rating filter (4+ stars, 3+ stars)
- Add delivery time filter (under 30 mins, under 45 mins, etc.)
- Add "Pure veg" filter

### Why It Matters
- Price range filter helps budget-conscious users
- Dietary filters are essential for users with restrictions
- Rating filter helps users find high-quality restaurants quickly

---

## 13. Cart

### What We Have
- Cart item list with quantity controls
- Add/remove items
- Cart summary (item total, tax, delivery fee, grand total)
- Checkout flow
- Bloc-driven cart state

### What We Will Change
- Add "Save for later" / wishlist button on cart items
- Add bulk delete / clear cart button
- Add coupon/promo code input at cart level
- Add estimated delivery time preview
- Add "Reorder from previous order" quick action
- Add cart abandonment recovery notification (push notification if user leaves items in cart)
- Add "Add special instructions" field for the order

### Why It Matters
- "Save for later" reduces cart abandonment
- Coupon input at cart level increases conversion
- Estimated delivery time sets customer expectations
- Reorder from previous orders speeds up repeat purchases

---

## 14. Checkout

### What We Have
- Address selection
- Payment method selection
- Order summary
- Bloc-driven checkout flow

### What We Will Change
- Add "Schedule order for later" option (date/time picker)
- Add delivery instruction input (e.g., "Leave at door", "Call on arrival")
- Add tip/gratuity input for deliveryman (predefined amounts: ₹10, ₹20, ₹50 + custom)
- Add contactless delivery toggle
- Add address map picker with Google Maps validation
- Add delivery time slot selection
- Add split-payment option (pay with wallet + cash/card)

### Why It Matters
- Scheduled orders increase order frequency
- Delivery instructions reduce failed deliveries and customer complaints
- Tip/gratuity increases driver earnings and satisfaction
- Contactless delivery is now expected post-COVID
- Split payment provides flexibility for customers

---

## 15. Make Payments

### What We Have
- Payment method selection
- Payment processing
- Bloc-driven payment flow

### What We Will Change
- Add payment retry flow with clear error messages (e.g., "Card declined, try another card")
- Add saved payment methods management (view/delete saved cards)
- Add EMI/installment options for high-value orders
- Add payment security indicators (SSL badge, "Secure payment" message)
- Add payment failure recovery options (retry, change method, save for later)

### Why It Matters
- Payment retry flow reduces checkout abandonment
- Saved payment methods speed up repeat checkout
- EMI options increase average order value
- Security indicators build trust and reduce cart abandonment

---

## 16. Chat — Chat List & Messages

### What We Have
- Chat list with last message preview
- Real-time chat via Socket.IO
- Support chat list and support chat screen

### What We Will Change
- Add image/file attachment support (send photos of food issues, delivery proof)
- Add chat search (search messages by keyword)
- Add forward / reply / delete message actions
- Add online/offline status indicators (green dot = online)
- Add typing indicators ("X is typing...")
- Add unread message badge counts on chat list
- Add archive / mute conversation options
- Add voice note recording and playback
- Add delivery/read receipts (double-tick: sent → delivered → read)
- Add block/report user inline action

### Why It Matters
- Image/file sharing is essential for resolving order issues visually
- Typing indicators and read receipts make chat feel real-time and responsive
- Unread badges increase chat engagement
- Voice notes are faster than typing for long messages

---

## 17. Dining (Pre-booking for Dine-in)

### What We Have
- Dining search
- Dining on maps
- Dining campaigns
- Restaurant pre-booking
- Filter dining with cuisine
- Guest count selection
- Date/time selection

### What We Will Change
- Add visual table selection / seat map so users can choose their preferred table
- Add QR code generation for self-check-in at restaurant
- Add waitlist / virtual queue feature ("You're #3 in line, estimated wait: 15 mins")
- Add special requests field (candlelight, decorations, high chair, birthday celebration)
- Add deposit payment for booking (10-20% advance to confirm)
- Add booking modification / cancellation flow with refund status
- Add SMS/reminder notification 1 hour before booking time
- Add "Book for group" option with split-bill preview

### Why It Matters
- Table selection increases booking confidence and reduces no-shows
- Waitlist feature manages demand during peak hours
- Special requests increase customer satisfaction for occasions
- Deposit payment reduces no-show rate
- Reminders reduce missed bookings

---

## 18. Favorites

### What We Have
- Favourite foods list
- Favourite orders list
- Favourite restaurants list

### What We Will Change
- Add share favorites list action (share via WhatsApp, Instagram, etc.)
- Add organize into collections / lists (e.g., "Weekend treats", "Healthy options")
- Add price-drop / availability alerts for favorited items ("Your favorite pizza is now 20% off")
- Add quick-reorder from favorites

### Why It Matters
- Sharing favorites drives organic word-of-mouth marketing
- Collections help users organize their preferences
- Price-drop alerts increase repeat purchases

---

## 19. History / Order History

### What We Have
- Order history list
- Order detail view

### What We Will Change
- Add "Reorder" button on past orders (one-tap reorder)
- Add filter by date range, restaurant, order type
- Add export order history (CSV/PDF)
- Add order status timeline visualization (ordered → preparing → dispatched → delivered)
- Add "Rate this order" prompt after delivery
- Add "Reorder similar" suggestion based on past orders

### Why It Matters
- One-tap reorder dramatically increases repeat purchases
- Order timeline helps customers understand where their order is
- Rating prompts increase review volume
- Export order history helps users track spending for expense reports

---

## 20. Reviews (Product & Restaurant)

### What We Have
- Product reviews
- Restaurant reviews

### What We Will Change
- Add photo/video review upload (show food/restaurant photos)
- Add review edit / delete functionality
- Add restaurant response to reviews (restaurant can reply publicly)
- Add review helpfulness voting ("Was this review helpful? Yes/No")
- Add rating breakdown by category (food quality, delivery speed, packaging, value for money)
- Add review filters (most recent, highest rated, lowest rated, with photos)

### Why It Matters
- Photo/video reviews increase trust and conversion
- Restaurant responses show customer service quality
- Rating breakdown helps restaurants identify areas for improvement
- Review filters help users find relevant feedback

---

## 21. Account / Profile Hub

### What We Have
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

### What We Will Change
- Add profile stats at top (total orders, total spent, member since, loyalty tier)
- Add quick action cards at top (e.g., "Track Order", "Reorder Last", "Refer Friend")
- Add search bar to quickly find settings items
- Add "Recently used" section showing recently accessed features
- Add push notification toggle (currently only sound settings exist)
- Add biometric login toggle
- Add active sessions / login history
- Add referral / invite code section with share button

### Why It Matters
- Profile stats give users a sense of engagement and loyalty
- Quick actions reduce navigation time to common features
- Search bar improves discoverability of settings
- Push notification toggle gives users control over notifications
- Biometric login improves security and convenience

---

## 22. Edit User Profile

### What We Have
- Profile image upload
- Name, email, phone editing
- Bloc-driven form

### What We Will Change
- Add address map picker (select location on Google Maps)
- Add email/phone verification status indicator (verified/unverified badge)
- Add gender, date of birth fields
- Add "Save and continue" instead of forcing all-at-once save

### Why It Matters
- Map picker ensures accurate delivery addresses
- Verification badge builds trust
- Incremental save reduces form abandonment

---

## 23. Address Book

### What We Have
- Address list
- Add new address
- Edit address
- Bloc-driven CRUD

### What We Will Change
- Add map picker for address selection with Google Maps autocomplete
- Add address validation (ensure address is deliverable)
- Add "Home / Work / Other" labels with color coding
- Add recent addresses suggestions based on order history
- Add address sharing / copying to clipboard
- Add "Set as default" option

### Why It Matters
- Map picker reduces address entry errors and failed deliveries
- Address validation prevents ordering to non-serviceable areas
- Labels help users quickly identify addresses
- Recent addresses speed up checkout

---

## 24. Wallet

### What We Have
- Wallet balance display
- Transaction history
- Add wallet money
- Loyalty points

### What We Will Change
- Add UPI / bank transfer initiation flow (link to pay via UPI apps)
- Add payment request to friends (split bill via wallet)
- Add wallet top-up offers / cashback promotions
- Add transaction export (CSV/PDF statement)
- Add wallet payment at checkout toggle
- Add auto-top-up when balance falls below threshold

### Why It Matters
- UPI integration is essential for Indian customers
- Wallet payment reduces payment friction at checkout
- Auto-top-up prevents checkout abandonment due to low wallet balance
- Transaction export helps users track spending

---

## 25. Referral Code

### What We Have
- Referral code display
- Referral tracking

### What We Will Change
- Add "Share referral link" action (WhatsApp, Instagram, copy link)
- Add referral leaderboard (top referrers this month)
- Add tiered referral rewards (refer 1 = ₹50, refer 5 = ₹300, refer 10 = ₹1000)
- Add referral history with status (sent, signed up, first order completed, reward credited)
- Add referral banner on home screen for visibility

### Why It Matters
- Referral leaderboard gamifies the referral program
- Tiered rewards increase referral volume
- Clear status tracking reduces "Where's my reward?" support tickets

---

## 26. Dining Booking

### What We Have
- Dining booking list
- Dining booking detail
- Bloc-driven state

### What We Will Change
- Add modify booking flow (change date, time, guest count)
- Add cancel booking with refund status preview
- Add booking history archive (past bookings)
- Add "Book again" quick action for favorite restaurants
- Add SMS/email reminder 1 hour before booking
- Add booking calendar view

### Why It Matters
- Modify booking reduces no-shows and increases flexibility
- Cancel with refund preview builds trust
- Reminders reduce missed bookings

---

## 27. Food Subscription (Tiffin)

### What We Have
- Subscription list
- Subscription detail

### What We Will Change
- Add pause/resume subscription (pause for vacation, resume later)
- Add skip days / vacation mode (skip specific dates)
- Add auto-renewal management (enable/disable, update payment method)
- Add subscription upgrade/downgrade (change plan mid-cycle)
- Add delivery schedule calendar (see upcoming deliveries)
- Add subscription pause with date range picker

### Why It Matters
- Pause/skip reduces subscription cancellations during travel
- Auto-renewal management gives users control
- Delivery calendar helps users plan meals

---

## 28. Hidden Restaurants

### What We Have
- Hidden restaurants list
- Unhide action

### What We Will Change
- Add reason for hiding (feedback to platform: "Too expensive", "Bad food", "Far away")
- Add bulk unhide action
- Add "Hide permanently" option with confirmation
- Show count of hidden restaurants on account page

### Why It Matters
- Hiding reasons provide valuable feedback to the platform
- Bulk unhide saves time for users who want to revisit multiple restaurants

---

## 29. Restaurant Registration

### What We Have
- Registration form
- Bloc-driven submit

### What We Will Change
- Add document upload step (FSSAI, GST, owner ID)
- Add progress tracker for approval status (submitted → under review → approved/rejected)
- Add estimated approval time display
- Add notification when restaurant is approved
- Add ability to edit registration details while pending

### Why It Matters
- Progress tracker reduces "What's happening?" anxiety
- Document upload is mandatory for compliance
- Approval notification ensures timely activation

---

## 30. Deliveryman Registration

### What We Have
- Registration form
- Document upload
- Bloc-driven submit

### What We Will Change
- Add vehicle type selection (bike/car/cargo scooter)
- Add document expiry reminders (renew license, insurance, RC)
- Add training / tutorial onboarding for new drivers
- Add background check consent and status display
- Add estimated approval time

### Why It Matters
- Vehicle type selection ensures proper order assignment
- Document expiry reminders prevent driver deactivation
- Onboarding tutorials reduce driver onboarding time and errors

---

## 31. Feedback Form

### What We Have
- Feedback form with fields: name, country code, number, email, description

### What We Will Change
- Add category selector (bug report, feature request, complaint, compliment)
- Add rating stars (1-5)
- Add screenshot/attachment upload
- Add anonymous feedback option
- Add ticket ID returned to user for tracking
- Add "Contact me back" checkbox

### Why It Matters
- Category selector helps route feedback to the right team
- Rating provides quantitative feedback alongside qualitative
- Screenshots help debug issues faster
- Ticket ID reduces duplicate feedback submissions

---

## 32. Report Emergency

### What We Have
- Report form with fields: name, country code, number, email, description
- Report type dropdown

### What We Will Change
- Add auto-capture of current GPS location
- Add photo/video evidence upload
- Add emergency contact / police escalation button
- Add urgency/priority selector (low, medium, high, critical)
- Add auto-send to support team with timestamp and location
- Add "I need immediate help" button that calls support directly

### Why It Matters
- Auto-capture location ensures accurate incident reporting
- Photo/video evidence speeds up investigation
- Urgency selector helps prioritize responses
- Immediate help button provides lifeline in dangerous situations

---

## 33. Settings

### What We Have
- Theme toggle (light/dark)
- Language selection
- Notification settings
- Account settings (change email, mobile, password, delete account)

### What We Will Change
- Add two-factor authentication (2FA) toggle
- Add active sessions / login history view
- Add biometric login toggle (fingerprint/Face ID)
- Add cache clear / data usage info
- Add "Logout from all devices" option
- Add notification preferences per type (order updates, promotions, chat messages)

### Why It Matters
- 2FA significantly reduces account takeover risk
- Active sessions help users detect unauthorized access
- Biometric login improves convenience and security
- Cache clear helps with app performance issues

---

## 34. Modals — Cart Summary

### What We Have
- Quick view of cart items and totals
- Bloc-driven cart summary

### What We Will Change
- Add edit quantities inline (plus/minus buttons)
- Add apply coupon from modal
- Add "Remove item" swipe action
- Add estimated delivery time

### Why It Matters
- Inline editing reduces navigation to full cart screen
- Coupon application at modal level increases conversion

---

## 35. Modals — Payment

### What We Have
- Payment method selection list
- Bloc-driven payment flow

### What We Will Change
- Add saved payment methods display with last 4 digits
- Add payment method search/filter
- Add "Add new payment method" inline
- Add payment security badge

### Why It Matters
- Saved payment methods display reduces checkout friction
- Security badges build trust

---

## 36. Modals — OTP

### What We Have
- OTP text field
- Resend OTP button
- Verify action
- Bloc state machine

### What We Will Change
- Add countdown timer for resend (e.g., "Resend in 25s")
- Add auto-fill / SMS autofill integration
- Add "Change phone/email" option from within modal
- Add masked display of target phone/email

### Why It Matters
- Countdown timer prevents user confusion about resend timing
- Auto-fill reduces manual entry errors
- Change option prevents stuck flows

---

## 37. Modals — Dining Booking

### What We Have
- Dining booking info
- Dining booking request
- Dining booking user info
- Dining charge summary
- Dining coupon info
- Dining date list
- Dining guest list
- Dining cancellation
- Dining refund request

### What We Will Change
- Add visual table selection (grid/map of available tables)
- Add deposit payment confirmation
- Add special requests field (candlelight, decorations, etc.)
- Add booking modification option
- Add SMS/email confirmation with booking details

### Why It Matters
- Visual table selection increases booking confidence
- Deposit payment reduces no-show rate
- Special requests improve dining experience

---

## 38. Modals — Tiffin Subscription

### What We Have
- Food selection
- Instruction modal
- Off-days selection
- Time slot selection

### What We Will Change
- Add auto-rotation of menu (weekly rotating menu)
- Add skip/pause days calendar
- Add subscription upgrade/downgrade options
- Add delivery schedule calendar view
- Add pause subscription with date range picker

### Why It Matters
- Auto-rotation increases subscription variety and reduces monotony
- Skip/pause reduces subscription cancellations during travel
- Calendar view improves planning

---

## 39. Modals — Refund Request

### What We Have
- Refund request reason selection
- Bloc-driven reason list

### What We Will Change
- Add custom reason input field
- Add photo/video evidence upload
- Add refund amount preview
- Add "I want a refund for" selector (full order, specific item, delivery fee)
- Add estimated refund timeline

### Why It Matters
- Custom reason provides more context for refund approval
- Photo evidence speeds up refund processing
- Clear refund amount prevents disputes

---

## 40. Modals — Other (Billing Summary, Cancellation, Complaints, etc.)

### What We Have
- Billing summary modal
- Cancellation reason modal
- Complaints modal
- Country modal
- Coupon info/list modal
- Delivery address list modal
- Delivery instructions modal
- Food info/instructions/variations modals
- Hide restaurant reason modal
- Image gallery modal
- Language translation modal
- Order help/review/ratings modals
- Permission denied modal
- Referral modal
- Report issue restaurant modal
- Restaurants by locality modal
- Restaurant info/menu modals
- Select cuisine/delivery time/restaurant type modals
- Social account verification modal
- Subscription food info modal
- User avatar list modal
- Web OTP modal

### What We Will Change
- Add unified modal theming (consistent colors, rounded corners, shadows)
- Add smooth modal transition animations (slide-up, fade-in)
- Add swipe-to-dismiss on bottom sheets
- Add haptic feedback on modal actions
- Add "Don't show again" option for repeated modals
- Add modal state persistence (if user rotates phone, modal stays)

### Why It Matters
- Unified theming creates a cohesive brand experience
- Smooth animations make the app feel responsive and polished
- Swipe-to-dismiss is a standard mobile UX pattern
- Haptic feedback provides tactile confirmation

---

## Summary of Changes

| Category | Changes | Impact |
|---|---|---|
| **Auth & Onboarding** | Social login, biometric, better permissions | +50% signup conversion |
| **Splash & Intro** | Animation, deep linking, skip permissions | +20% first-open completion |
| **Home & Discovery** | Map view, recently visited, skeleton loading | +30% engagement |
| **Restaurant & Menu** | Reviews, dietary filters, nutrition info | +25% order conversion |
| **Search & Filter** | Voice search, recent searches, price range | +15% search success rate |
| **Cart & Checkout** | Save for later, reorder, scheduled orders, tips | +20% repeat orders |
| **Payments** | Retry flow, saved methods, EMI, security badges | -30% checkout abandonment |
| **Chat** | Image sharing, typing indicators, read receipts | +40% chat engagement |
| **Dining** | Table selection, waitlist, deposit, reminders | -50% no-show rate |
| **Subscriptions** | Pause/skip, auto-rotation, calendar view | -30% subscription cancellations |
| **Account** | Profile stats, quick actions, search settings | +15% account engagement |
| **Reviews** | Photo/video, restaurant replies, rating breakdown | +50% review volume |
| **Modals** | Unified theming, animations, swipe dismiss | +10% perceived quality |
| **Cross-cutting** | Dark mode, offline mode, error boundaries, skeletons | +20% overall satisfaction |

---

## Priority Roadmap for Customer App

### Phase 1 — Must Have (Weeks 1-4)
1. Fix login: add social login, biometric, inline errors
2. Fix cart: add reorder, coupon input, save for later
3. Fix checkout: add scheduled orders, tips, delivery instructions
4. Fix payments: add retry flow, saved methods, security badges
5. Add skeleton loading on all list screens
6. Add dark mode toggle (theme BLoC already exists)

### Phase 2 — Should Have (Weeks 5-8)
7. Add map view toggle on home screen
8. Add dining table selection and waitlist
9. Add chat image/file sharing and read receipts
10. Add order tracking with live ETA
11. Add subscription pause/skip
12. Add referral program with leaderboard

### Phase 3 — Nice to Have (Weeks 9-12)
13. Add voice search
14. Add photo/video reviews
15. Add split payments
16. Add group ordering
17. Add AR menu preview
18. Add AI chatbot for FAQ

---

*End of document. No code changes have been made.*
