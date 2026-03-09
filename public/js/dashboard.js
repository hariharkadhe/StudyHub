// dashboard.js - Handles fetching materials from Supabase

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Auth (Using Firebase Auth for login, but data from Supabase)
    checkAuth(user => {
        setupDashboard(user);
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut().then(() => {
                window.location.href = '/';
            });
        });
    }

    // 2. Setup Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            htmlEl.setAttribute('data-theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    async function setupDashboard(user) {
        // Welcome message
        const welcomeEl = document.getElementById('welcomeMessage');
        if (user) {
            welcomeEl.textContent = `Welcome, ${user.displayName || user.email}`;
        } else {
            welcomeEl.textContent = `Welcome, Guest! (Log in to like or upload)`;
            document.getElementById('logoutBtn').innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            document.getElementById('logoutBtn').href = '/';
        }

        // Fetch materials
        fetchMaterials();

        // Setup Search and Filter
        document.getElementById('searchBtn').addEventListener('click', () => fetchMaterials());
        document.getElementById('categoryFilter').addEventListener('change', () => fetchMaterials());
        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') fetchMaterials();
        });
    }

    async function fetchMaterials() {
        const container = document.getElementById('materialsContainer');
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;
        const totalStatsElement = document.getElementById('statTotalMaterials');
        const myUploadsElement = document.getElementById('statMyUploads');

        container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Loading materials...</p>';

        try {
            // Fetch from OUR API (which talks to Supabase)
            const response = await fetch('/api/materials');
            const materials = await response.json();

            if (!Array.isArray(materials)) throw new Error("Invalid data format");

            // --- Dynamic Category Population ---
            const filterDropdown = document.getElementById('categoryFilter');
            const currentSelection = filterDropdown.value; // Remember what was selected

            // Get unique subjects
            const uniqueSubjects = [...new Set(materials.map(m => m.subject).filter(s => s))].sort();

            // Rebuild options
            filterDropdown.innerHTML = '<option value="">All Categories</option>';
            uniqueSubjects.forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub;
                opt.textContent = sub;
                if (sub === currentSelection) opt.selected = true;
                filterDropdown.appendChild(opt);
            });
            // ------------------------------------

            let filteredMats = materials;

            // Apply strict category filter
            if (category) {
                filteredMats = filteredMats.filter(m => m.subject === category);
            }

            // Apply soft search filter
            if (searchTerm) {
                filteredMats = filteredMats.filter(m =>
                    m.title.toLowerCase().includes(searchTerm) ||
                    (m.description && m.description.toLowerCase().includes(searchTerm))
                );
            }

            // Update Stats
            if (totalStatsElement) totalStatsElement.textContent = materials.length;
            if (myUploadsElement) {
                const currentUser = auth.currentUser;
                const myUploads = currentUser ? materials.filter(m => m.uploaded_by_id === currentUser.uid).length : 0;
                myUploadsElement.textContent = myUploads;
            }

            // Render
            renderMaterials(filteredMats);

        } catch (error) {
            console.error("Error fetching materials:", error);
            container.innerHTML = `<p class="text-center" style="grid-column: 1/-1; color: var(--danger-color);">Error loading materials.<br/>${error.message}</p>`;
        }
    }

    function renderMaterials(materials) {
        const container = document.getElementById('materialsContainer');
        container.innerHTML = '';

        if (materials.length === 0) {
            container.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: var(--text-muted);">No study materials found.</p>';
            return;
        }

        materials.forEach(material => {
            const card = document.createElement('div');
            card.className = 'material-card';

            const userLiked = material.likes && material.likes.includes(auth.currentUser?.uid);
            const likeIconClass = userLiked ? 'fas' : 'far';
            const isOwner = auth.currentUser && material.uploaded_by_id === auth.currentUser.uid;

            // Format date
            const dateStr = material.created_at ? new Date(material.created_at).toLocaleDateString() : 'Recent';

            card.innerHTML = `
                <div class="material-header">
                    <h3 class="material-title">${material.title}</h3>
                    <span class="material-subject">${material.subject}</span>
                </div>
                <div class="material-desc">${material.description || ''}</div>
                
                <div class="material-meta">
                    <span><i class="fas fa-user"></i> ${material.uploaded_by_name}</span>
                    <span><i class="far fa-calendar-alt"></i> ${dateStr}</span>
                </div>
                
                <div class="material-meta" style="border-top: none; padding-top: 0;">
                    <span>Semester: ${material.semester}</span>
                    <span><i class="fas fa-download"></i> ${material.downloads || 0}</span>
                </div>

                <div class="material-actions">
                    <a href="${material.file_url}" target="_blank" class="btn download-btn">
                        <i class="fas fa-file-download"></i> Get File
                    </a>
                    <button class="btn like-btn" disabled>
                        <i class="${likeIconClass} fa-heart"></i> ${material.likes ? material.likes.length : 0}
                    </button>
                    ${isOwner ? `
                    <button class="btn delete-btn" style="background-color: var(--danger-color);" data-id="${material.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }

    async function handleDelete(e) {
        const btn = e.currentTarget;
        const id = btn.getAttribute('data-id');

        if (!confirm('Are you sure you want to delete this material?')) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            const response = await fetch(`/api/materials/${id}?userId=${auth.currentUser.uid}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Material deleted from Cloud!');
                fetchMaterials();
            } else {
                const err = await response.json();
                throw new Error(err.error || 'Delete failed');
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed: " + error.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-trash"></i>';
        }
    }
});
