// upload.js - Handles local server uploads

document.addEventListener('DOMContentLoaded', () => {
    // 1. Ensure User is Authenticated (Firebase Auth still works)
    requireAuth(user => {
        setupUploadForm(user);
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

    function setupUploadForm(user) {
        const form = document.getElementById('uploadForm');
        const uploadBtn = document.getElementById('uploadBtn');
        const msgDiv = document.getElementById('uploadMessage');
        const progressContainer = document.getElementById('uploadProgressContainer');
        const progressBar = document.getElementById('uploadProgressBar');
        const progressText = document.getElementById('uploadStatusText');

        const subjectSelect = document.getElementById('materialSubject');
        const manualSubjectGroup = document.getElementById('manualSubjectGroup');
        const manualSubjectInput = document.getElementById('manualSubject');

        subjectSelect.addEventListener('change', () => {
            if (subjectSelect.value === 'Other') {
                manualSubjectGroup.classList.remove('hidden');
                manualSubjectInput.required = true;
            } else {
                manualSubjectGroup.classList.add('hidden');
                manualSubjectInput.required = false;
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Reset UI
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Processing...';
            msgDiv.classList.add('hidden');
            progressContainer.classList.remove('hidden');
            progressBar.style.width = '10%';
            progressText.textContent = 'Preparing file...';

            const title = document.getElementById('materialTitle').value;
            let subject = subjectSelect.value;
            if (subject === 'Other') {
                subject = manualSubjectInput.value;
            }
            const semester = document.getElementById('materialSemester').value;
            const desc = document.getElementById('materialDesc').value;
            const fileObj = document.getElementById('materialFile').files[0];

            if (!fileObj) {
                showError("Please select a file to upload.");
                return;
            }

            console.log("Starting LOCAL upload for:", fileObj.name);
            progressText.textContent = 'Sending to local server...';
            progressBar.style.width = '40%';

            const formData = new FormData();
            formData.append('file', fileObj);
            formData.append('title', title);
            formData.append('subject', subject);
            formData.append('semester', semester);
            formData.append('description', desc);
            formData.append('uploadedById', user.uid);
            formData.append('uploadedByName', user.displayName || user.email || 'Anonymous User');

            try {
                // Send to LOCAL API
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                progressBar.style.width = '90%';
                const result = await response.json();

                if (response.ok) {
                    console.log("Local upload successful:", result);
                    progressBar.style.width = '100%';
                    progressText.textContent = 'Finished!';
                    showSuccess("Study material uploaded successfully to Cloud Storage!");
                    form.reset();
                    manualSubjectGroup.classList.add('hidden');
                    setTimeout(() => {
                        window.location.href = '/dashboard.html';
                    }, 2000);
                } else {
                    throw new Error(result.error || 'Server upload failed');
                }

            } catch (error) {
                console.error("Local Upload Error:", error);
                showError("Upload failed: " + error.message);
            }
        });

        function showError(msg) {
            msgDiv.textContent = msg;
            msgDiv.style.backgroundColor = 'var(--danger-color)';
            msgDiv.style.color = 'white';
            msgDiv.classList.remove('hidden');
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Material';
            progressContainer.classList.add('hidden');
        }

        function showSuccess(msg) {
            msgDiv.textContent = msg;
            msgDiv.style.backgroundColor = 'var(--success-color)';
            msgDiv.style.color = 'white';
            msgDiv.classList.remove('hidden');
            uploadBtn.textContent = 'Success!';
        }
    }
});
