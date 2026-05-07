# 🚗 Car Rental & Sales Platform

A modern, full-stack car rental and marketplace application built with React, Node.js, Express, and MongoDB. Users can list cars for sale, browse available listings, purchase vehicles, and communicate with car owners.

---

## ✨ Features

### **User Features**
- ✅ **User Authentication** - Sign up, login, and manage profiles
- ✅ **List Your Vehicle** - Multi-step form to list cars for sale with:
  - Vehicle details (make, model, year, mileage, condition)
  - Registration & identification numbers
  - Owner information and contact details
  - Vehicle description
  - Multiple image uploads via Cloudinary
- ✅ **Browse Listings** - View verified cars with filtering by:
  - Make (brand)
  - Year
  - Price range
- ✅ **Purchase Vehicles** - Buy cars with automatic commission handling:
  - 2% commission to admin
  - 98% payment to seller
- ✅ **Real-time Chat** - Communicate directly with car owners/buyers
- ✅ **My Listings** - Track submitted cars and their verification status

### **Admin Features**
- ✅ **Admin Dashboard** - Centralized control panel for vehicle verification
- ✅ **Review Submissions** - View pending car listings with detailed information
- ✅ **Approve Listings** - Move verified cars to public gallery
- ✅ **Reject with Reason** - Send rejection reasons to sellers
- ✅ **Dashboard Stats** - See counts of pending, approved, rejected, and sold vehicles

### **Seller Features** 
- ✅ **Seller Portal** - Track which cars are pending, approved, or rejected
- ✅ **Rejection Notifications** - Receive detailed reasons for rejection
- ✅ **Re-submission** - Edit and resubmit rejected listings
- ✅ **Transaction Tracking** - See commission and payment details

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router (navigation)

**Backend:**
- Node.js + Express 4.18
- MongoDB + Mongoose 7.5
- Cloudinary + Multer (image uploads)
- CORS (cross-origin requests)

**Deployment Ready:**
- Environment configuration via .env
- Jest/Testing setup ready
- Production-grade error handling

---

## 🚀 Project Setup

### **Prerequisites**
- Node.js 16+ and npm
- MongoDB connection string
- Cloudinary account with API credentials

### **1. Clone and Install Dependencies**

```bash
# Clone the repository
git clone <repo-url>
cd Car_Rental

# Install backend dependencies
cd server
npm install

# Install frontend dependencies  
cd ../client
npm install
```

### **2. Configure Environment Variables**

**Server** (`server/.env`):
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=Cluster0
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=admin@carhub.com
ADMIN_PASSWORD=admin123
ADMIN_COMMISSION_PERCENTAGE=2
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Cloudinary Setup:**
1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings
3. Copy Cloud Name, API Key, and API Secret
4. Paste into `.env` file

### **3. Start Development Servers**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

---

## 📋 API Endpoints

### **User Endpoints**
```
POST /api/users/signup           - Register new user
POST /api/users/login            - User login
GET  /api/users/:uid             - Get user profile
```

### **Listing Endpoints**
```
GET  /api/listings               - Get all verified listings
POST /api/listings               - Create new listing (with validation)
GET  /api/listings/user/:uid     - Get user's listings
PUT  /api/listings/:id           - Update listing
DELETE /api/listings/:id         - Delete listing
POST /api/listings/:id/purchase  - Purchase vehicle (2% commission calculated)
```

### **Image Upload**
```
POST /api/upload-images          - Upload up to 3 images to Cloudinary
                                   (returns imageUrls array)
```

### **Admin Endpoints**
```
POST /api/admin/login            - Admin authentication
GET  /api/admin/listings/pending - Get pending submissions
GET  /api/admin/stats            - Dashboard statistics
PUT  /api/admin/listings/:id/verify - Approve listing
PUT  /api/admin/listings/:id/reject - Reject with reason
```

### **Chat Endpoints**
```
POST /api/chat/threads           - Create chat thread
GET  /api/chat/threads/:uid      - Get all user threads
POST /api/chat/messages          - Send message
GET  /api/chat/messages/:threadId - Get thread messages
```

---

## 📊 Database Schema

### **User Model**
```javascript
{
  uid: String (unique),
  email: String (unique, required),
  password: String (required),
  isAdmin: Boolean (default: false),
  createdAt: Date
}
```

### **Listing Model**
```javascript
{
  // Basic Info
  make: String (required),
  model: String (required),
  year: Number (required),
  price: Number (required),
  mileage: Number (required),
  condition: String (enum: Excellent|Good|Fair|Poor),
  description: String,
  
  // Vehicle Identification
  vehicleNumber: String (registration number, required),
  chassisNumber: String (optional),
  
  // Owner Info
  ownerName: String (required),
  ownerContactNumber: String (required),
  
  // Images
  imageUrls: [String],
  isFeatured: Boolean,
  
  // Status
  sellerUid: String (required),
  buyerUid: String (when sold),
  verificationStatus: String (enum: pending|verified|rejected),
  rejectionReason: String (when rejected),
  status: String (enum: available|sold),
  
  // Transaction
  sellerAmount: Number (98% of price),
  adminCommission: Number (2% of price),
  purchaseDate: Date,
  
  timestamps: true
}
```

### **Thread Model** (Chat)
```javascript
{
  listingId: String,
  listingTitle: String,
  buyerUid: String,
  sellerUid: String,
  buyerEmail: String,
  sellerEmail: String,
  lastMessage: String,
  lastTimestamp: Date,
  timestamps: true
}
```

---

## 🎯 User Workflows

### **Selling a Car**
1. User clicks "Sell Your Car"
2. Fills 5-step form:
   - Step 1: Car make & model
   - Step 2: Year, mileage, condition
   - Step 3: Registration number, price
   - Step 4: Owner details & description
   - Step 5: Upload 1-3 images
3. System uploads images to Cloudinary
4. Listing created with "pending" status
5. Admin reviews and approves/rejects
6. If approved → appears in gallery
7. If rejected → seller see reason & can re-submit

### **Buying a Car**
1. User browses verified listings
2. Clicks "Buy" on desired vehicle
3. System calculates:
   - Admin Commission: 2% of price
   - Seller Receives: 98% of price
4. Purchase processed
5. Car status changed to "sold"
6. Both parties can chat about transaction

### **Admin Workflow**
1. Admin logs in with credentials
2. Views dashboard with stats
3. Reviews pending listings with all details
4. For each listing: Approve OR Reject with reason
5. Approved listings go live immediately
6. Rejected sellers get notification with reason

### **Chat/Messaging**
1. Buyer initiates chat on listing page
2. Creates thread for buyer ↔ seller communication
3. Real-time message updates
4. Thread history preserved for future reference

---

## 🔐 Admin Credentials

Default admin account (from `.env`):
```
Email:    admin@carhub.com
Password: admin123
```

⚠️ **Change these in production!**

---

## 📸 Image Upload (Cloudinary)

The system supports uploading up to 3 images per listing:
- **Image 1 (Exterior)** - Required
- **Image 2 (Interior)** - Optional  
- **Image 3 (Other)** - Optional

Images are automatically:
- Uploaded to Cloudinary
- Optimized for web
- Returned as secure URLs
- Displayed in listing galleries

---

## 💰 Commission Structure

When a car is purchased:
```
Sale Price = ₹500,000

Admin Commission (2%)   = ₹10,000
Seller Amount (98%)     = ₹490,000
```

Both parties receive transaction details in the API response.

---

## 🐛 Debugging & Troubleshooting

### **Common Issues**

**Images not uploading:**
- Verify Cloudinary credentials in `.env`
- Check file size < 10MB
- Ensure CORS is configured

**Admin login fails:**
- Double-check email/password in `.env`
- Verify admin credentials match exactly
- Clear browser cache

**MongoDB connection error:**
- Verify connection string in `.env`
- Check database is running
- Confirm IP whitelist in MongoDB Atlas

**Listings not showing:**
- Only verified listings appear in gallery
- Check listing `verificationStatus` in admin panel
- Make sure `status` is "available"

---

## 📈 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications for status changes
- [ ] Advanced search filters (transmission, fuel type)
- [ ] Vehicle inspection reports
- [ ] Seller ratings and reviews
- [ ] Document verification workflow
- [ ] Insurance integration
- [ ] Service history tracking
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

---

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review API documentation
3. Check MongoDB connection
4. Verify Cloudinary configuration

Happy selling! 🎉
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
])
```

# DriveHub