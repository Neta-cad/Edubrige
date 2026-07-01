// EduBridge - Auth Logic (Register + Login)

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// ===== REGISTER =====
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    alert('Button clicked - starting registration...');

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

    alert('Form filled correctly. Connecting to Supabase...');

    // Step 1: Create the auth user
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert('Supabase Error: ' + error.message);
      errorMsg.textContent = error.message;
      return;
    }

    alert('Account created! Check your email.');
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
      alert('Profile Error: ' + profileError.message);
      errorMsg.textContent = profileError.message;
      return;
    }

    alert('Account created! Please check your email to confirm.');
    window.location.href = 'login.html';
  });
}