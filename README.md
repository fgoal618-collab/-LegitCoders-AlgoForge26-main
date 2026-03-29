# 🚇 TransitTwin – Smart Multi-Modal Transit Planning for Mumbai

> **A real-time, data-driven transit planning web application that helps Mumbai commuters discover, compare, and navigate the best multi-modal routes across buses, trains, metro, auto-rickshaws, and cabs.**

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.x-purple?logo=vite)
![Google Maps](https://img.shields.io/badge/Google%20Maps-API-green?logo=googlemaps)
![GTFS](https://img.shields.io/badge/Data-GTFS--Mumbai-orange)

---

## 📋 Problem Statement

Mumbai is one of the world's most densely populated cities, with over **20 million daily commuters** relying on a fragmented transit network spanning:

- **BEST Buses** – 530+ routes, 3,100+ stops across the city
- **Suburban Railways** – Central Line, Western Line (60+ stations)
- **Metro** – Line 1 (Versova–Ghatkopar) with 12 stations
- **Auto-Rickshaws & Cabs** – Last-mile connectivity

### The Core Problem

**There is no single unified platform** that:

1. **Integrates all transit modes** – Commuters must switch between multiple apps (Google Maps, m-Indicator, Ola/Uber) to plan a single journey.
2. **Uses real Mumbai transit data** – Most solutions rely on generic data that doesn't reflect actual BEST bus routes, stops, or schedules.
3. **Provides location-aware transit discovery** – Commuters often don't know which bus routes or train stations are nearest to them.
4. **Compares multi-modal routes with cost analysis** – No tool helps users compare the cost, time, and comfort tradeoffs between bus, train, auto, and cab for the same trip.
5. **Offers a modern, interactive UI** – Existing transit tools for Mumbai are outdated and not user-friendly.

### Impact

- Commuters waste **30–45 minutes daily** planning routes across apps
- They frequently overpay by not knowing cheaper bus/train alternatives
- Tourists and new residents have no way to discover nearby transit options
- The lack of a unified solution results in **higher auto/cab dependency**, increasing traffic congestion

---

## 💡 Solution – TransitTwin

TransitTwin is a **web-based smart transit planner** that solves this by integrating **real Mumbai GTFS bus data**, train/metro station data, and Google Maps navigation into a single, beautiful, interactive platform.

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   TransitTwin App                    │
│                   (React + Vite)                     │
├─────────────┬─────────────┬─────────────────────────┤
│  Data Layer │  UI Layer   │    Services Layer        │
│             │             │                          │
│ busData.ts  │ 8 Pages     │ Google Maps JS API       │
│ (GTFS Bus)  │ 6 Components│ Places Autocomplete      │
│             │             │ DirectionsService        │
│transitData  │ Framer      │ Geocoding API            │
│ (Train/     │ Motion      │                          │
│  Metro)     │ Animations  │ Haversine Distance       │
│             │             │ Calculator               │
│ GTFS Dataset│ Glassmorphi-│                          │
│ (4 files)   │ sm UI       │                          │
└─────────────┴─────────────┴─────────────────────────┘
```

### Key Features

#### 1. 🗺️ Google Maps Navigation
- **Auto-detect user location** via browser GPS with reverse geocoding
- **Places Autocomplete** biased to Mumbai for start/destination search
- **Route calculation** with Drive, Transit, and Walk modes
- **Alternate route display** with click-to-select
- **Step-by-step directions** with expandable instruction panel
- **Deep link to Google Maps** for live turn-by-turn navigation

#### 2. 🚌 Real BEST Bus Data Integration (GTFS)
- Parsed and integrated **530+ BEST bus routes** from `routes.txt`
- **3,100+ bus stops** with GPS coordinates from `stops.txt`
- **3,243 trips** with schedule data from `trips.txt`
- **114,000+ stop times** from `stop_times.txt`
- Location-based **nearby bus stop discovery** (within 1.5 km radius)
- Shows **available bus routes** passing through nearby stops

#### 3. 🚆 Train & Metro Station Finder
- **Central Line** – 23 stations (CSMT to Kalyan)
- **Western Line** – 19 stations (Churchgate to Malad)
- **Metro Line 1** – 12 stations (Versova to Ghatkopar)
- Distance-based station discovery (up to 3 km for trains, 5 km for metro)
- Color-coded line indicators

#### 4. 🛺 Multi-Modal Nearby Transit Panel
When a user sets their location, TransitTwin instantly analyzes and shows:

| Tab | What It Shows |
|-----|--------------|
| **Bus** 🚌 | Nearest BEST bus stops (distance in meters) + available bus routes |
| **Train** 🚆 | Nearby Central/Western Line stations with line color coding |
| **Metro** 🚇 | Nearby Metro Line 1 stations with distance |
| **Auto/Cab** 🛺 | Auto-rickshaw, Ola/Uber, Rapido options with fare estimates |

#### 5. 🔄 Multi-Modal Route Comparison
- Compare **Train Direct**, **Bus**, **Auto + Train Combo**, and **Cab** routes side-by-side
- Each route shows: time, distance, cost, and CO₂ savings
- Smart recommendation engine marks the best option

#### 6. 📍 Live Tracking & Vehicle Selection
- Live vehicle tracking simulation on map
- Vehicle selection page for different transit types
- Trip history and management

---

## 🗂️ Project Structure

```
TransitTwin UI Design/
├── dataset/                          # GTFS Mumbai Transit Data
│   ├── routes.txt                    # 530+ BEST bus routes
│   ├── stops.txt                     # 3,100+ bus stops with lat/lng
│   ├── trips.txt                     # 3,243 trip definitions
│   ├── stop_times.txt                # 114,000+ stop time entries
│   ├── mumbai_train_stations_coords.csv
│   └── mumbai_metro_stations_coords.csv
├── src/
│   └── app/
│       ├── pages/
│       │   ├── HomePage.tsx           # Landing page with hero & features
│       │   ├── NavigationPage.tsx      # Google Maps navigation + nearby transit
│       │   ├── RouteComparisonPage.tsx # Multi-modal route comparison
│       │   ├── LiveTrackingPage.tsx    # Real-time vehicle tracking
│       │   ├── VehicleSelectionPage.tsx# Vehicle type selection
│       │   ├── TripsPage.tsx          # Trip history & management
│       │   ├── PaymentPage.tsx        # Payment processing
│       │   └── ProfilePage.tsx        # User profile management
│       ├── components/
│       │   ├── Header.tsx             # Navigation bar
│       │   ├── Footer.tsx             # Site footer
│       │   ├── Layout.tsx             # Page layout wrapper
│       │   ├── GoogleMap.tsx          # Reusable map component
│       │   ├── PlacesAutocomplete.tsx # Google Places search
│       │   └── BottomNav.tsx          # Mobile bottom navigation
│       ├── data/
│       │   ├── transitData.ts         # Train & Metro station data + routing
│       │   └── busData.ts            # BEST bus stops & routes (from GTFS)
│       ├── services/                  # API services & mock data
│       ├── context/                   # React context providers
│       ├── routes.ts                  # App routing configuration
│       └── App.tsx                    # Root component
├── index.html                         # Entry point (Google Maps API loader)
├── package.json
└── vite.config.ts
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework with hooks & functional components |
| **TypeScript** | Type-safe development |
| **Vite 6** | Lightning-fast dev server & build tool |
| **Google Maps JavaScript API** | Interactive maps, directions, geocoding |
| **Google Places API** | Location search & autocomplete |
| **Google Routes API** | Route calculation with alternatives |
| **Framer Motion** | Smooth animations & transitions |
| **Lucide React** | Beautiful, consistent icon set |
| **GTFS Data Format** | Standard transit data (routes, stops, trips, stop_times) |
| **Haversine Formula** | GPS-based distance calculation for nearby transit |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Google Maps API Key** with these APIs enabled:
  - Maps JavaScript API
  - Places API (New)
  - Routes API
  - Geocoding API

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "TransitTwin UI Design"

# Install dependencies
npm install

# Start the development server
npm run dev
```

### API Key Setup

Add your Google Maps API key to `index.html`:

```html
<script>
  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",...
  })({key: "YOUR_API_KEY", v: "weekly", libraries: "places"});
</script>
```

---

## 📊 Dataset Details (GTFS - Mumbai BEST)

The app uses **real-world transit data** in GTFS (General Transit Feed Specification) format:

| File | Records | Description |
|------|---------|-------------|
| `routes.txt` | 531 | All BEST bus routes with IDs, names, and endpoints |
| `stops.txt` | 3,100+ | Bus stop locations with lat/lng, area, and road names |
| `trips.txt` | 3,243 | Trip definitions linking routes to schedules |
| `stop_times.txt` | 114,000+ | Arrival/departure times for every stop on every trip |
| `mumbai_train_stations_coords.csv` | 42 | Central + Western Line station coordinates |
| `mumbai_metro_stations_coords.csv` | 12 | Metro Line 1 station coordinates |

---

## 🎨 UI/UX Design

- **Light theme** with indigo/violet accent colors
- **Glassmorphism** effects (frosted glass panels with backdrop blur)
- **Smooth micro-animations** using Framer Motion
- **Responsive design** – works on desktop and mobile
- **Accessible** – proper ARIA labels, keyboard navigation
- **Premium feel** – gradient headers, shadow effects, hover transitions

---

## 👥 Team

| Name | Role |
|------|------|
| Sarang Gole | Full-Stack Developer & Project Lead |

---

## 📄 License

This project is developed as part of an academic/research initiative for smart urban transit solutions.

---

<p align="center">
  <b>TransitTwin</b> – Making Mumbai's Transit Smarter, One Route at a Time 🚆🚌🛺
</p>