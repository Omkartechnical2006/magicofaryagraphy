// Login Modal Functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        const messageDiv = document.getElementById('loginMessage');

        if (result.success) {
            messageDiv.className = 'login-message success';
            messageDiv.textContent = result.message;

            // Reload page after 1.5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            messageDiv.className = 'login-message error';
            messageDiv.textContent = result.message;
        }
    } catch (error) {
        console.error('Login error:', error);
        const messageDiv = document.getElementById('loginMessage');
        messageDiv.className = 'login-message error';
        messageDiv.textContent = 'An error occurred. Please try again.';
    }
}

// Handle Logout
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });

        if (response.ok) {
            window.location.reload();
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLoginModal();
    }
}

// Close modal on escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeLoginModal();
    }
});
