# 🧬 SynthScope

> **AI-Powered Synthetic User Research Platform**

SynthScope is an innovative platform that helps product teams validate ideas rapidly by generating realistic virtual personas and simulating user research. By leveraging advanced AI, SynthScope allows you to conduct surveys and interviews with synthetic users, providing actionable insights in minutes rather than weeks.

---

## ✨ Key Features

- **🧠 Synthetic Persona Generation:** Create detailed, highly realistic virtual personas based on your target demographic, complete with backgrounds, pain points, and goals.
- **🗣️ AI-Simulated Interviews:** Conduct real-time, dynamic conversations with your synthetic personas to explore their thoughts on your product ideas.
- **📝 Automated Surveys:** Deploy surveys to multiple AI personas simultaneously and gather quantitative data instantly.
- **📊 Comprehensive Reporting:** Generate AI-driven insight reports aggregating data from interviews and surveys to support your product decisions.
- **🔐 Secure Authentication:** Full user authentication and secure workspaces to manage your experiments.

---

## 📸 Screenshots

| Dashboard | Persona Creation |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/cc236f50-b956-4f40-b9da-a8f4284a1efa" alt="Dashboard" width="100%"> | <img src="https://github.com/user-attachments/assets/8a3b604f-e8be-4e38-8aee-9c1ec41fae49" alt="Persona Creation" width="100%"> |

| AI Interview | Insight Report |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/f19da26f-d6a8-4022-b253-3c08b46cc27b" alt="AI Interview" width="100%"> | <img src="https://github.com/user-attachments/assets/322ab1d4-9e79-4193-8390-91e8a09bac5a" alt="Insight Report" width="100%"> |

---

## 🛠️ Tech Stack

**Frontend:**
- [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- [TanStack Start](https://tanstack.com/start/latest) & [TanStack Router](https://tanstack.com/router/latest)
- [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/) for styling and accessible components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Supabase](https://supabase.com/) for Client-Side Auth & BaaS

**Backend:**
- [Python](https://www.python.org/) & [FastAPI](https://fastapi.tiangolo.com/) for high-performance API endpoints
- [Google Gemini API](https://ai.google.dev/) for LLM integration & AI persona logic
- [SQLAlchemy](https://www.sqlalchemy.org/) & [Alembic](https://alembic.sqlalchemy.org/) for ORM and database migrations

**Database:**
- [PostgreSQL](https://www.postgresql.org/)

---

## 📁 Project Structure

```text
SynthScope/
├── Frontend/           # React + TanStack Start frontend application
│   ├── src/            # Source code (components, routes, lib, etc.)
│   ├── package.json    # Frontend dependencies and scripts
│   └── vite.config.ts  # Vite configuration
│
└── Backend/            # Python FastAPI backend application
    ├── app/            # FastAPI application (routes, models, services)
    └── requirements.txt# Python dependencies
```

---

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/)
- [Python 3.10+](https://www.python.org/)
- [PostgreSQL](https://www.postgresql.org/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/SynthScope.git
cd SynthScope
```

### 2. Backend Setup

Open a terminal and navigate to the `Backend` directory:

```bash
cd Backend
```

Create a virtual environment and install dependencies:

```bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
```

Set up your backend environment variables:
Create a `.env` file in the `Backend` directory and add the following:

```env
DATABASE_URL=postgresql://user:password@localhost/synthscope
GEMINI_API_KEY=your_google_gemini_api_key
# Add other necessary backend variables...
```

Run database migrations (if applicable) and start the server:

```bash
uvicorn app.main:app --reload
```
*The backend should now be running on `http://localhost:8000`.*

### 3. Frontend Setup

Open a new terminal and navigate to the `Frontend` directory:

```bash
cd Frontend
```

Install the dependencies:

```bash
npm install
# or if you use bun:
bun install
```

Set up your frontend environment variables:
Create a `.env` file in the `Frontend` directory (if needed for Supabase or API URL):

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:

```bash
npm run dev
# or
bun run dev
```
*The frontend should now be running on `http://localhost:5173` (or the port specified by Vite).*

---

## 📖 Usage

1. **Create an Account:** Sign up or log in to the SynthScope dashboard.
2. **Define a Persona:** Navigate to the Personas section and define your target user's demographics, background, and behavior.
3. **Design an Experiment:** Create a new experiment (Interview or Survey) and assign your synthetic personas to it.
4. **Conduct Research:** Let the AI simulate the interviews or surveys based on your questions and the personas' distinct characteristics.
5. **Analyze Results:** View the comprehensive insight reports generated from the simulated data to guide your product decisions.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is currently under development. Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

**Ayon Paul** - [ayonpaul8906@gmail.com](mailto:ayonpaul8906@gmail.com)

Project Link: [SynthScope](https://synthscope.vercel.app)

