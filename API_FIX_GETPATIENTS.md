# 🔧 API Fix - getPatients Function Added

## ❌ **Error:**
```
TypeError: userService.getPatients is not a function
```

## 🔍 **Root Cause:**
The `NursePatients` component was calling `userService.getPatients()` but this function didn't exist in the API service.

## ✅ **Solution:**
Added `getPatients()` method to `userService` in `src/services/api.js`

### **Implementation:**
```javascript
async getPatients() {
  try {
    const res = await axios.get(`${API_URL}/users?role=PATIENT`, { 
      headers: getAuthHeader() 
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}
```

## 🎯 **Features:**
- **Fetches all patients** from the backend using the `/api/users?role=PATIENT` endpoint
- **Proper authentication** with Bearer token headers
- **Error handling** returns empty array on failure
- **Consistent with existing API patterns**

## 📊 **Backend Endpoint:**
- **Route**: `GET /api/users?role=PATIENT`
- **Authentication**: Required (Bearer token)
- **Returns**: Array of user objects with role='PATIENT'

## ✅ **Status:**
The NursePatients component should now load patient data successfully!

**Test it:**
1. Refresh your browser
2. Navigate to `/nurse-patients`
3. Patient list should load without errors
