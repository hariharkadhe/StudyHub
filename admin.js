// admin.js - Handles Admin Dashboard and Material Deletion

document.addEventListener('DOMContentLoaded', () => {
    // 1. Ensure User is Authenticated AND has Admin Role
    requireAuth(async user => {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().role === 'admin') {
                setupAdminDashboard(user);
            } else {
                // Not an admin, redirect
                window.location.href = '/dashboard.html';
            }
        } catch (e) {
            console.error("Admin verification failed", e);
            window.location.href = '/dashboard.html';
        }
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

    async function setupAdminDashboard(user) {
        fetchAdminStats();
        fetchMaterialsForAdmin();
    }

    async function fetchAdminStats() {
        try {
            // Get total users
            const usersSnapshot = await db.collection('users').get();
            document.getElementById('statTotalUsers').textContent = usersSnapshot.size;

            // Get total materials
            const matsSnapshot = await db.collection('materials').get();
            document.getElementById('statTotalMaterials').textContent = matsSnapshot.size;
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }

    async function fetchMaterialsForAdmin() {
        const container = document.getElementById('adminMaterialsContainer');
        container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Loading materials...</p>';

        try {
            const snapshot = await db.collection('materials').orderBy('timestamp', 'desc').get();
            const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (materials.length === 0) {
                container.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: var(--text-muted);">No study materials to manage.</p>';
                return;
            }

            container.innerHTML = '';
            materials.forEach(material => {
                const card = document.createElement('div');
                card.className = 'material-card';
                card.style.border = '1px solid var(--danger-color)'; // Highlight admin cards

                const dateStr = material.timestamp ? material.timestamp.toDate().toLocaleDateString() : 'Unknown date';

                card.innerHTML = `
                    <div class="material-header">
                        <h3 class="material-title">${material.title}</h3>
                        <span class="material-subject">${material.subject}</span>
                    </div>
                    <div class="material-desc">${material.description}</div>
                    
                    <div class="material-meta">
                        <span><i class="fas fa-user"></i> ${material.uploadedByName}</span>
                        <span>UID: ${material.uploadedById.substring(0, 8)}...</span>
                    </div>
                    
                    <div class="material-meta" style="border-top: none; padding-top: 0;">
                        <span>Uploaded: ${dateStr}</span>
                        <span>File: ${material.fileName || 'Legacy'}</span>
                    </div>

                    <div class="material-actions mt-2" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
                        <button class="btn btn-danger delete-btn" 
                            data-id="${material.id}" 
                            data-filename="${material.fileName}"
                            data-uid="${material.uploadedById}">
                            <i class="fas fa-trash-alt"></i> Delete Material
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });

            // Attach Delete Listeners
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', handleDeleteMaterial);
            });

        } catch (error) {
            console.error("Error fetching admin materials:", error);
            container.innerHTML = `<p class="text-center" style="grid-column: 1/-1; color: var(--danger-color);">Error loading materials.<br/>${error.message}</p>`;
        }
    }

    async function handleDeleteMaterial(e) {
        const btn = e.currentTarget;
        const id = btn.getAttribute('data-id');
        const filename = btn.getAttribute('data-filename');
        const uid = btn.getAttribute('data-uid');

        if (!confirm("Are you sure you want to delete this material? This action cannot be undone.")) {
            return;
        }

        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        btn.disabled = true;

        try {
            // 1. Delete File from Firebase Storage (if filename and uid exist)
            if (filename && uid) {
                const fileRef = storage.ref(`materials/${uid}/${filename}`);
                try {
                    await fileRef.delete();
                    console.log("File deleted from storage");
                } catch (storageErr) {
                    console.warn("Storage deletion failed (might be missing):", storageErr);
                }
            }

            // 2. Delete Document from Firestore
            await db.collection('materials').doc(id).delete();

            // Refresh Dashboard
            fetchAdminStats();
            fetchMaterialsForAdmin();

        } catch (error) {
            console.error("Error deleting material:", error);
            alert("Failed to delete material: " + error.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
});
