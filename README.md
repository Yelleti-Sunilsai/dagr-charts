# Analytics Workspace Builder

A modern, enterprise-grade drag-and-drop analytics workspace builder built from scratch. This platform allows users to dynamically create and customize their own analytics dashboards by dragging charts from a sidebar library onto a free-form canvas.

## 🚀 Features

- **Drag-and-Drop Interface**: Built with `dnd-kit`, allowing seamless drag-and-drop from the sidebar into the main canvas.
- **Dynamic Resizing & Positioning**: Uses `react-rnd` to allow users to move and resize widgets anywhere on the workspace.
- **Centralized State Management**: Powered by `Zustand` to track widget positions, sizes, and configurations efficiently.
- **Dynamic Chart Rendering**: Reusable visualization widgets powered by `Recharts` that are loaded dynamically based on workspace configurations.
- **FastAPI Backend**: A lightweight Python backend serving dynamic dataset generation.
- **Enterprise Dark UI**: A sleek, dark-themed user interface utilizing TailwindCSS and glassmorphism design principles.

---

## 🏗️ Architecture

The project is strictly modular with separated frontend and backend environments:

```
dagr-chart/
├── frontend/ (Next.js 15, React 19, TailwindCSS, Zustand)
│   ├── src/
│   │   ├── app/                 # Next.js App Router (Layout & Page)
│   │   ├── components/          
│   │   │   ├── charts/          # Pure visual chart components (Recharts)
│   │   │   ├── renderer/        # Dynamically injects charts into widgets
│   │   │   ├── sidebar/         # Draggable chart library
│   │   │   ├── widgets/         # Draggable & Resizable wrapper logic (react-rnd)
│   │   │   └── workspace/       # Canvas Droppable zone
│   │   └── store/               # Zustand Workspace Store
│   └── package.json
│
└── backend/ (Python, FastAPI, Uvicorn)
    ├── app/
    │   ├── api/
    │   ├── models/
    │   ├── schemas/
    │   ├── services/
    │   ├── utils/
    │   └── main.py              # API routes & Mock endpoints
    ├── data/
    └── requirements.txt
```

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js (App Router)
- React 19 & TypeScript
- TailwindCSS (v4)
- Zustand (State Management)
- dnd-kit (Drag & Drop functionality)
- react-rnd (Resizable & Draggable components)
- Recharts (Data Visualization)
- Lucide React (Icons)

**Backend:**
- Python 3
- FastAPI
- Uvicorn
- Pydantic

---

## 🏃‍♂️ Getting Started

### 1. Start the Backend (FastAPI)

Navigate to the `backend` directory, install requirements, and start the development server.

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
> The API will be available at: http://localhost:8000

### 2. Start the Frontend (Next.js)

Open a new terminal, navigate to the `frontend` directory, install dependencies, and start the development server.

```bash
cd frontend
npm install
npm run dev
```
> The application will be available at: http://localhost:3000 (or 3001 if 3000 is occupied).

---

## 📖 Usage

1. Open the web app in your browser.
2. In the left **Analytics Builder** sidebar, grab any chart (e.g., Line Chart, Bar Chart).
3. Drag and drop the chart onto the gridded canvas area.
4. Drag the chart's top title bar to move it around the canvas.
5. Grab the edges or corners of the chart widget to resize it.
6. The widget will automatically fetch its specific data from the FastAPI backend.
7. Click the `Trash` icon on any widget to remove it from the workspace.

---

## 🔮 Future Scalability

This architecture is prepared to be scaled up with:
- Persistent Layouts (Saving workspace layouts to PostgreSQL)
- User Authentication
- Real-time WebSocket Data Updates
- Customizable Chart Data Sources (SQL integrations)
- Export Functionality (PDF/PNG)
