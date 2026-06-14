# DispatchHub — Hyper-Local Delivery Dispatcher

An internal MERN-stack tool for local stores (pharmacies, groceries, etc.) to manage their own delivery riders — real-time GPS tracking, order dispatching, and a rider earnings dashboard. Built with a clean, elegant Tailwind CSS interface.

## Features

- **Authentication** — Register/login for two roles: **Store Admin** and **Delivery Rider** (JWT-based).
- **Order Management** — Admins create orders with items, customer details, and delivery address.
- **Dispatching** — Assign orders to available riders; status flow: `Pending → Dispatched → Delivered`.
- **Real-Time Location Tracking** — Riders share live GPS location via browser geolocation + Socket.IO; admins view all riders on a Google Map.
- **Rider Earnings Dashboard** — Riders see total, weekly, and monthly earnings plus delivery history.
- **Online/Offline Toggle** — Riders can mark themselves active/inactive.
- **Responsive, Elegant UI** — Built with Tailwind CSS, Inter font, soft shadows, and rounded cards.

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, React Router, Tailwind CSS, Axios, Socket.IO client, @react-google-maps/api, lucide-react |
| Backend  | Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT, bcryptjs |

## Project Structure

```
dispatcher/
├── server/                  # Express backend
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js           # Admin & Rider model
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js     # register/login/me
│   │   ├── userRoutes.js     # riders, location, earnings
│   │   └── orderRoutes.js    # CRUD + assign + status
│   ├── server.js             # entry point + Socket.IO
│   ├── .env.example
│   └── package.json
│
├── client/                  # React frontend
│   ├── public/index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── StatusBadge.js
│   │   ├── context/AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── Orders.js
│   │   │   ├── LiveTracking.js
│   │   │   ├── RiderDashboard.js
│   │   │   └── Earnings.js
│   │   ├── utils/api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
│
└── .gitignore
```

## Setup Instructions

### Prerequisites
- Node.js v16+
- MongoDB (local install or MongoDB Atlas)
- A Google Maps API key with **Maps JavaScript API** enabled (for live tracking)

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/dispatcher
JWT_SECRET=replace_with_a_strong_random_secret
CLIENT_URL=http://localhost:3000
```

Run the server:
```bash
npm run dev      # nodemon (development)
# or
npm start        # production
```

Server runs on **http://localhost:5000**.

### 2. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Run the client:
```bash
npm start
```

App runs on **http://localhost:3000**.

> Note: The app works fully without a Google Maps key, except the Live Tracking map will show a setup prompt instead of the map.

## How It Works

### Roles
- **Store Admin** — registers with `role: admin`, can optionally provide `storeName`. Can create orders, assign riders, and view the live tracking map.
- **Delivery Rider** — registers with `role: rider`, can optionally provide `vehicleNumber`. Can view assigned deliveries, mark as delivered, share live location, and view earnings.

### Order Lifecycle
1. Admin creates an order (`Pending`).
2. Admin assigns a rider → order becomes `Dispatched`, rider sees it on their dashboard.
3. Rider completes delivery → marks `Delivered`. Delivery fee is automatically added to the rider's earnings (total, weekly, monthly).

### Real-Time Tracking
- Rider clicks **"Share Live Location"** → browser's `navigator.geolocation.watchPosition` sends updates to:
  - Backend (`PUT /api/users/location`) — persisted in MongoDB.
  - Socket.IO (`riderLocationUpdate` event) — broadcast instantly to all connected admins.
- Admin's **Live Tracking** page listens for `riderLocationBroadcast` and updates markers on the Google Map in real time, also polling `/api/users/locations` every 20s as a fallback.

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register admin or rider |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/riders` | List all riders (admin only) |
| PUT | `/api/users/location` | Update rider's GPS location |
| GET | `/api/users/locations` | Get all active riders' locations (admin only) |
| GET | `/api/users/earnings` | Get logged-in rider's earnings & history |
| PUT | `/api/users/toggle-status` | Toggle rider online/offline |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (admin only) |
| GET | `/api/orders` | List orders (all for admin, own for rider) |
| GET | `/api/orders/:id` | Get single order |
| PUT | `/api/orders/:id/assign` | Assign a rider to an order (admin only) |
| PUT | `/api/orders/:id/status` | Update order status |

All protected routes require header: `Authorization: Bearer <token>`.

## Notes & Customization

- **Delivery Fee**: Defaults to ₹30 per order, configurable per order at creation time.
- **Map Default Center**: `LiveTracking.js` defaults to Mumbai coordinates — change `defaultCenter` to your store's location.
- **Styling**: Tailwind theme (colors, fonts, shadows) is configured in `client/tailwind.config.js` — primary color is indigo, accent is emerald.
- **Production Build**: Run `npm run build` in `client/`, then serve the `build/` folder via Express or a static host (e.g., Nginx).

## License

Internal tool — for use by the requesting organization. Customize freely.
