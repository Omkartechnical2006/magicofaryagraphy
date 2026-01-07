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

// Login/Signup Toggle
let isLoginMode = true;

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('modalTitle');
    const nameField = document.getElementById('nameField');
    const submitBtn = document.getElementById('submitAuthBtn');
    const toggleText = document.getElementById('toggleText');

    if (isLoginMode) {
        title.textContent = 'Welcome Back';
        nameField.style.display = 'none';
        document.querySelector('input[name="name"]').required = false;
        submitBtn.textContent = 'Login';
        toggleText.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuthMode(); event.preventDefault()">Sign Up</a>';
    } else {
        title.textContent = 'Create Account';
        nameField.style.display = 'block';
        document.querySelector('input[name="name"]').required = true;
        submitBtn.textContent = 'Sign Up';
        toggleText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuthMode(); event.preventDefault()">Log In</a>';
    }
}

// Handle Login/Signup
async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    if (!isLoginMode) {
        data.name = formData.get('name');
    }

    const endpoint = isLoginMode ? '/api/login' : '/api/signup';

    try {
        const response = await fetch(endpoint, {
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
        console.error('Auth error:', error);
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
