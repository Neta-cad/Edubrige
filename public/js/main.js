// EduBridge - Global Site Script

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const navActions = document.getElementById('navActions');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
    navActions.classList.toggle('show');
  });
}

// Check if user is logged in and update navbar accordingly
async function updateNavForAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session) {
    // User is logged in - update nav actions
    if (navActions) {
      navActions.innerHTML = `
        <a href="dashboard.html" class="btn btn-outline">Dashboard</a>
        <a href="#" id="logoutBtn" class="btn btn-primary">Logout</a>
      `;

      const logoutBtn = document.getElementById('logoutBtn');
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html';
      });
    }
  }
}

// Run on every page load
updateNavForAuth();