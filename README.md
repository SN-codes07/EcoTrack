# 🌱 EcoTrack — Personal Carbon Footprint & Environmental Health Tracker

**EcoTrack** is a full-stack environmental intelligence SaaS application that empowers individuals to track daily activities across 6 environmental pillars, calculate estimated $\text{CO}_2$, $\text{PM}_{2.5}$, $\text{NO}_x$, and $\text{CO}$ emissions, simulate habit changes, visualize route emissions on an interactive map, and gamify carbon reduction.

---

## ✨ Key Product Features

1. **🌱 Personal Carbon Score (0–100 Circular Gauge):**
   - Evaluates rolling 30-day emissions, sustainable actions, and Eco Points into an overall score and status (`🟢 Eco Champion`, `🟡 Improving`, `🟠 High Impact`, `🔴 Critical Impact`) with 5 category sub-scores.
2. **🌫 Personal Pollution Profile (*Estimated Values*):**
   - Animated counters tracking Today's and Monthly **$\text{CO}_2$ (kg)**, **Distance Travelled (km)**, **Fuel Consumed (L/kWh eq.)**, **$\text{PM}_{2.5}$ (g)**, **$\text{NO}_x$ (g)**, **$\text{CO}$ (g)**, and **Mature Trees Required to Offset**.
3. **🚗 Smart Transportation Tracker & Mode Comparison:**
   - Multi-modal logging (`Walking`, `Cycling`, `E-Bike`, `Two-Wheeler`, `Petrol/Diesel/CNG/Hybrid/EV Car`, `Bus`, `Metro`, `Train`, `Flight`) factoring in distance, passenger count, and custom vehicle efficiency.
   - Interactive **“What if I change my transport?”** comparison table with **`🥇 Lowest Emission`**, **`🥈 Lowest Cost`**, and **`🥉 Fastest`** badges.
4. **🗺 Interactive Leaflet Eco Map & Smart Route Planner:**
   - Color-codes logged travel corridors by emission severity (`🟢 Low`, `🟡 Medium`, `🔴 High`) using `react-leaflet` and OpenStreetMap.
   - Includes a **Smart Route Estimator (A → B)** highlighting the lowest-carbon option with 1-click trip logging.
5. **⚡ 6-Pillar Daily Activity Logger & Garage Manager:**
   - Log activities across `🚗 Transportation`, `⚡ Electricity`, `🍱 Food`, `🗑 Waste`, `💧 Water`, and `🛍 Lifestyle`.
   - Manage personal vehicles (`Make`, `Model`, `Fuel Type`, `Efficiency`, `Cost/Unit`, `Primary Vehicle`).
6. **🎛 “If I Change My Habit” Simulator (Stateless Engine):**
   - Interactive sliders for weekly commute switches, AC usage hours, solar adoption, and plant-based meals — dynamically computing Before/After monthly & yearly $\text{CO}_2$ reductions without altering database records.
7. **🏆 Gamification Hub, Eco Journal, Goals & Monthly PDF Report:**
   - Earn Eco Points for sustainable habits, complete **Today’s Eco Challenge**, unlock achievement badges (`7-Day Eco Streak`, `Low-Carbon Commuter`, `Forest Guardian`, `Zero-Waste Champion`, `Planet Protector`), compete on the **Anonymized Community Leaderboard**, and export a printable **Monthly Environmental Report (PDF)**.
8. **🌤 Ambient City AQI vs. Personal Emissions Separation:**
   - Real-time regional air quality (`AQI`, `PM2.5`, `PM10`, `Temperature`, `Humidity`, `Weather`) for the user's city, kept architecturally and visually distinct from calculated personal emissions.

---

## 🛠 Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18 (Vite), Tailwind CSS (Dark/Light Class Strategy + Glassmorphism), Recharts, Leaflet + React-Leaflet, Lucide React Icons, Axios |
| **Backend** | Java 21, Spring Boot 3.3.4 (Web, Data JPA, Security, Validation), Lombok |
| **Security** | Stateless JWT Authentication (`io.jsonwebtoken` JJWT 0.12.5) + `BCryptPasswordEncoder` |
| **Database** | MySQL 8.0+ (`users`, `vehicles`, `trips`, `activities`, `emissions`, `eco_goals`, `eco_points`, `achievements`) |
| **Calculation Engine** | Centralized `EmissionCalculationEngineService` reading strictly from `@ConfigurationProperties(prefix = "ecotrack")` in `application.yml` |

```text
React Frontend (Port 5173)  ──►  Spring Boot REST API (Port 8080)  ──►  MySQL Database (Port 3306)
```

---

## 🚀 Step-by-Step Local Setup Instructions

### Prerequisites
- **Java 21+**
- **Maven 3.9+** (to run the Spring Boot backend)
- **MySQL Server 8.0+** (running on `localhost:3306`)
- **Node.js 18+ & npm** (to run the React frontend)

---

### Step 1: Set Up the MySQL Database

1. Start your local MySQL server:
   ```bash
   brew services start mysql
   ```
2. Run the SQL schema script located at `database/schema.sql` to create `ecotrack_db` and all 8 tables:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *(Note: Spring Boot is also configured with `createDatabaseIfNotExist=true` and `hibernate.ddl-auto: update`, so it will automatically verify and synchronize the schema on startup.)*

---

### Step 2: Configure & Run the Spring Boot Backend

1. Check database credentials in `backend/src/main/resources/application.yml` (or pass environment variables `DB_USERNAME` and `DB_PASSWORD`, default is `root` with empty password):
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/ecotrack_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
       username: ${DB_USERNAME:root}
       password: ${DB_PASSWORD:}
   ```
2. Navigate to the `backend` folder and start the Spring Boot server:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The REST API will start at **`http://localhost:8080`**.

---

### Step 3: Install & Run the Vite React Frontend

1. Open a new terminal in the `frontend` folder, install dependencies, and start the development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open **`http://localhost:5173`** in your browser.

---

## 🎓 How to Use "Demo Mode" for Your College Presentation

EcoTrack includes built-in presentation features so you can demonstrate a fully populated 30-day account in one click:

1. **From the Landing Page (`/`) or Login Screen (`/login`):**
   - Click the **"Explore Demo (Instant Seed)"** or **"One-Click Demo Login (Pre-Seeded)"** button.
   - This triggers `POST /api/auth/demo-login`, automatically authenticates the demo account (`demo@ecotrack.io`), seeds 30 days of realistic Pune commute trips, multi-category activities, 3 vehicles, 2 active Eco Goals, and unlocked Achievements, and redirects straight to the Dashboard.
2. **From Inside Any Logged-In Account (Top Navbar):**
   - Click the **"✨ Load Demo Data"** button in the top navigation bar at any time.
   - This calls `POST /api/demo/seed` for the currently logged-in user and refreshes all charts, maps, and counters in real time.
3. **Recommended Presentation Walkthrough Flow:**
   - **Landing Page:** Showcase the glassmorphic UI, live Carbon Score preview, and Privacy/Methodology section → Click **Explore Demo**.
   - **Dashboard:** Highlight the animated **Carbon Score Gauge (82/100)**, **Today's Pollution Profile** (*Estimated* $\text{CO}_2$, $\text{PM}_{2.5}$, $\text{NO}_x$, $\text{CO}$, Trees), **Monthly Carbon Budget Bar**, **Recharts Trends (Daily/Weekly/Monthly)**, **Donut Drill-Down**, **Ambient City AQI separation**, and click **"I Completed It"** on Today's Eco Challenge.
   - **Transport & Eco Map:** Compare Petrol Car vs. Metro/EV in the interactive table, then open the **Leaflet Eco Map** to show color-coded severity corridors (`🟢 Low`, `🟡 Medium`, `🔴 High`) and the **Smart Route Estimator**.
   - **Habit Simulator:** Drag the sliders (commute switch %, AC hours, solar %, plant-based meals) to show real-time Before/After $\text{CO}_2$ bar charts and cost/tree savings.
   - **Journal & Monthly Report:** Show the **Eco Journal**, **Achievements**, **Anonymized Leaderboard toggle**, and click **"Monthly Environmental Report (PDF)"** → **"Download My Eco Report"** to demonstrate PDF print export.
