# StudyHub - Study Material Sharing Platform 📚☁️
StudyHub is a modern, responsive web application designed for students to share and access study materials (PDFs, DOCXs) easily. It features a professional dark/light mode UI, secure authentication, and cloud-persistent storage.
## ✨ Features
- **Cloud Storage:** Powered by Supabase for reliable, permanent file hosting.
- **Dynamic Dashboard:** Search and filter materials by dynamically generated categories.
- **Secure Auth:** Integrated with Firebase Authentication for user sessions.
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **Manual Categories:** Ability to type custom subjects during upload.
## 🚀 Tech Stack
- **Frontend:** HTML5, Vanilla CSS, JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database & Storage:** Supabase (PostgreSQL & Storage Buckets)
- **Authentication:** Firebase Auth
- **Deployment:** Render.com
## 🛠️ Installation & Local Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/StudyHub.git
   cd StudyHub
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   PORT=3000
   ```
4. **Run the server:**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`.
## 📂 Project Structure
- `public/`: Contains all frontend assets (HTML, CSS, JS).
- `routes/`: Express route handlers for upload and material logic.
- `server.js`: Main entry point for the Node.js server.
## 🛡️ Security
This project uses `.gitignore` to protect sensitive files like `.env` and `serviceAccountKey.json`. Always ensure these are not committed to public repositories.
---
Built with ❤️ for Students.
