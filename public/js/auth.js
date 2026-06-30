// EduBridge - Auth Logic (Register + Login)

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// ===== REGISTER =====
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorMsg = document.getElementById('errorMsg');

    errorMsg.textContent = '';

    if (!fullName || !email || !password || !role) {
      errorMsg.textContent = 'Please fill in all fields.';
      return;
    }

    // Step 1: Create the auth user
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      errorMsg.textContent = error.message;
      return;
    }

    const userId = data.user.id;

    // Step 2: Create their profile row
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert([
        {
          id: userId,
          full_name: fullName,
          email: email,
          role: role,
          is_pro: false
        }
      ]);

    if (profileError) {
      errorMsg.textContent = profileError.message;
      return;
    }

    alert('Account created! Please check your email to confirm your account, then log in.');
    window.location.href = 'login.html';
  });
}

// ===== LOGIN =====
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('errorMsg');

    errorMsg.textContent = '';

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      errorMsg.textContent = error.message;
      return;
    }

    window.location.href = 'dashboard.html';
  });
}