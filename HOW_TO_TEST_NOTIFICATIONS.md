# 🧪 How to Test the Notification System

## Quick Start Testing Guide

### Prerequisites
✅ Backend is running on port 3000
✅ Frontend is open in browser (index.html)
✅ You have created an account or logged in

---

## Test 1: Like Notifications ❤️

### Steps:
1. **Open the app** in your browser
2. **Navigate to Home screen** (should be default)
3. **Create a test post** (click + button, add photo and caption)
4. **Like your own post** by clicking the heart icon

### Expected Results:
- ✅ Toast notification appears in top-right corner saying "❤️ [Your Name] liked your post"
- ✅ Notification badge on bell icon shows "1"
- ✅ Click bell icon to see notification in the modal
- ✅ Notification shows with red heart icon

### Screenshot Locations:
- Top-right corner: Toast notification
- Top-right header: Bell icon with badge
- Notification modal: Full notification list

---

## Test 2: Notification Badge 🔔

### Steps:
1. **Check the bell icon** in top-right corner
2. **Like a post** to create a notification
3. **Observe the badge** - should show "1"
4. **Like another post** - badge should show "2"
5. **Click the bell icon** to open notifications
6. **Wait 1 second** - badge should disappear (all marked as read)

### Expected Results:
- ✅ Badge appears when there are unread notifications
- ✅ Badge count increases with each new notification
- ✅ Badge disappears when all notifications are read
- ✅ Badge is red with white text

---

## Test 3: Notification Modal 📋

### Steps:
1. **Create some notifications** by liking posts
2. **Click the bell icon** in top-right corner
3. **View the notification list**
4. **Check the time stamps** (should show "Just now", "2m ago", etc.)
5. **Close and reopen** - notifications should be marked as read

### Expected Results:
- ✅ Modal opens with smooth animation
- ✅ All notifications are listed with icons
- ✅ Time stamps are accurate
- ✅ Unread notifications have a dot indicator
- ✅ After opening, all notifications are marked as read
- ✅ Empty state shows when no notifications

---

## Test 4: Nearby Issues Detection 🚨

### Steps:
1. **Allow location permission** when browser prompts
2. **Wait for automatic check** (runs every 5 minutes)
3. **Or refresh the page** to trigger initial check
4. **Check console** for location access logs

### Expected Results:
- ✅ Browser asks for location permission
- ✅ If there are nearby issues in backend, you get notified
- ✅ Notification shows "🚨 New environmental issue nearby: [Issue Title]"
- ✅ Toast notification appears with orange warning icon
- ✅ Notification appears in modal

### Note:
- This requires issues to be in the backend database
- Issues must be within 5km of your location
- Respects privacy settings (location sharing must be enabled)

---

## Test 5: Settings Integration ⚙️

### Steps:
1. **Go to Profile screen** (bottom navigation)
2. **Click Settings button**
3. **Click "Notification Settings"**
4. **Disable "Likes & Comments"**
5. **Go back to Home and like a post**
6. **No notification should appear**
7. **Re-enable "Likes & Comments"**
8. **Like another post**
9. **Notification should appear**

### Expected Results:
- ✅ When disabled, no like notifications appear
- ✅ When enabled, like notifications work
- ✅ Settings are saved to localStorage
- ✅ Settings persist across page refreshes

---

## Test 6: Toast Notification Behavior 🍞

### Steps:
1. **Like a post** to trigger a notification
2. **Observe the toast** in top-right corner
3. **Wait 5 seconds** - toast should auto-dismiss
4. **Like another post**
5. **Click the toast** - should dismiss immediately

### Expected Results:
- ✅ Toast appears with smooth slide-in animation
- ✅ Toast shows icon, message, and "Just now" time
- ✅ Toast auto-dismisses after 5 seconds
- ✅ Toast can be clicked to dismiss early
- ✅ Multiple toasts stack vertically

---

## Test 7: Empty State 📭

### Steps:
1. **Clear all notifications** (if any exist)
2. **Open notification modal**
3. **View empty state**

### Expected Results:
- ✅ Shows bell icon emoji 🔔
- ✅ Shows "No Notifications" heading
- ✅ Shows friendly message "You're all caught up!"
- ✅ No badge on bell icon

---

## Test 8: Privacy Settings Integration 🔒

### Steps:
1. **Go to Profile → Settings → Privacy Settings**
2. **Disable "Share Location"**
3. **Wait for nearby issues check** (won't run)
4. **Check console** - should see no location requests
5. **Re-enable "Share Location"**
6. **Refresh page** - location check should run

### Expected Results:
- ✅ When location sharing is disabled, no location requests
- ✅ When enabled, location checks run every 5 minutes
- ✅ Settings are respected by notification system

---

## Test 9: Notification Persistence 💾

### Steps:
1. **Create some notifications** by liking posts
2. **Close the browser tab**
3. **Reopen the app**
4. **Check notification badge** - should show unread count
5. **Open notification modal** - notifications should still be there

### Expected Results:
- ✅ Notifications persist across sessions
- ✅ Unread count is maintained
- ✅ Notification data is stored in localStorage
- ✅ Up to 50 most recent notifications are kept

---

## Test 10: Multiple Notification Types 🎨

### Steps:
1. **Like a post** - should see red heart icon
2. **Wait for nearby issue** - should see orange warning icon
3. **Check notification modal** - icons should be color-coded

### Expected Results:
- ✅ Like notifications: Red heart ❤️
- ✅ Comment notifications: Blue comment 💬
- ✅ Follow notifications: Green user 👤
- ✅ Issue notifications: Orange warning 🚨
- ✅ Event notifications: Purple calendar 📅
- ✅ Eco points notifications: Green leaf 🍃

---

## Troubleshooting

### No notifications appearing?
1. Check if notifications are enabled in Settings
2. Check browser console for errors
3. Verify backend is running on port 3000
4. Check if you're logged in

### Badge not updating?
1. Refresh the page
2. Check localStorage in browser DevTools
3. Clear localStorage and try again

### Toast not showing?
1. Check if "Enable Notifications" is on in settings
2. Check browser console for errors
3. Verify CSS is loaded correctly

### Nearby issues not working?
1. Allow location permission in browser
2. Check if "Share Location" is enabled in Privacy Settings
3. Check if "Issue Updates" is enabled in Notification Settings
4. Verify backend has issues in database
5. Check browser console for API errors

---

## Developer Tools

### View Notifications in localStorage:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Click "Local Storage"
4. Find "notifications" key
5. View JSON data

### View Notification Settings:
1. Same as above
2. Find "notificationSettings" key
3. View JSON data

### View Privacy Settings:
1. Same as above
2. Find "privacySettings" key
3. View JSON data

---

## Success Criteria ✅

Your notification system is working correctly if:
- ✅ Liking a post creates a notification
- ✅ Toast notification appears and auto-dismisses
- ✅ Badge shows correct unread count
- ✅ Notification modal displays all notifications
- ✅ Settings are respected (enable/disable works)
- ✅ Notifications persist across page refreshes
- ✅ Empty state shows when no notifications
- ✅ Icons are color-coded by type
- ✅ Time stamps are accurate
- ✅ Nearby issues check runs (if location enabled)

---

## Next Steps

Once testing is complete, you can:
1. **Create more posts** and test with real content
2. **Invite friends** to test cross-user notifications
3. **Report issues** to test nearby issue notifications
4. **Join events** to test event reminder notifications
5. **Earn eco points** to test eco points notifications

---

**Happy Testing! 🎉**

If you encounter any issues, check the browser console for error messages and verify all settings are configured correctly.
