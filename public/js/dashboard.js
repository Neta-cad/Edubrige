// EduBridge - Dashboard Logic

const welcomeMsg = document.getElementById('welcomeMsg');
const roleBadge = document.getElementById('roleBadge');
const dashboardGrid = document.getElementById('dashboardGrid');
const logoutBtn = document.getElementById('logoutBtn');

async function loadDashboard() {
  // Step 1: Check if user is logged in
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const userId = session.user.id;

  // Step 2: Get their profile
  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    dashboardGrid.innerHTML = '<p>Could not load your profile. Please try again later.</p>';
    return;
  }

  // Step 3: Update header
  welcomeMsg.textContent = `Welcome back, ${profile.full_name}!`;
  roleBadge.textContent = formatRole(profile.role);

  // Step 4: Build dashboard cards based on role
  let html = '';

  if (!profile.is_pro) {
    html += `
      <div class="upgrade-banner">
        <div>
          <h3>Unlock Pro Features</h3>
          <p>Get unlimited postings, priority placement, and more tools to grow.</p>
        </div>
        <a href="upgrade.html" class="btn btn-primary">Upgrade Now</a>
      </div>
    `;
  }

  html += '<div class="dashboard-grid">';

  if (profile.role === 'school') {
    html += `
      <div class="dash-card">
        <div class="dash-icon">📢</div>
        <h3>Post a Job</h3>
        <p>Share an open position at your school and reach qualified educators.</p>
        <a href="post-job.html" class="btn btn-outline">Post Job</a>
      </div>
      <div class="dash-card">
        <div class="dash-icon">📋</div>
        <h3>My Job Listings</h3>
        <p>View and manage all jobs you've posted.</p>
        <a href="my-jobs.html" class="btn btn-outline">View Listings</a>
      </div>
      <div class="dash-card">
        <div class="dash-icon">🏫</div>
        <h3>School Profile</h3>
        <p>Edit your school's public profile and information.</p>
        <a href="school-profile-edit.html" class="btn btn-outline">Edit Profile</a>
      </div>
      <div class="dash-card ${profile.is_pro ? '' : 'pro-locked'}">
        ${profile.is_pro ? '' : '<span class="pro-tag">Pro</span>'}
        <div class="dash-icon">👩‍🏫</div>
        <h3>Browse Tutors</h3>
        <p>Find and contact qualified private tutors directly.</p>
        <a href="${profile.is_pro ? 'tutors.html' : 'upgrade.html'}" class="btn btn-outline">Browse</a>
      </div>
    `;
  } else if (profile.role === 'job_seeker') {
    html += `
      <div class="dash-card">
        <div class="dash-icon">🔍</div>
        <h3>Browse Jobs</h3>
        <p>Search and apply to teaching and education jobs.</p>
        <a href="jobs.html" class="btn btn-outline">Find Jobs</a>
      </div>
      <div class="dash-card">
        <div class="dash-icon">📄</div>
        <h3>My Applications</h3>
        <p>Track the jobs you've applied to and their status.</p>
        <a href="my-applications.html" class="btn btn-outline">View Applications</a>
      </div>
      <div class="dash-card">
        <div class="dash-icon">👤</div>
        <h3>My Profile & CV</h3>
        <p>Update your profile and upload your CV.</p>
        <a href="profile-edit.html" class="btn btn-outline">Edit Profile</a>
      </div>
    `;
  } else if (profile.role === 'tutor') {
    html += `
      <div class="dash-card">
        <div class="dash-icon">📚</div>
        <h3>My Tutor Profile</h3>
        <p>Showcase your subjects, experience, and rates.</p>
        <a href="tutor-profile-edit.html" class="btn btn-outline">Edit Profile</a>
      </div>
      <div class="dash-card ${profile.is_pro ? '' : 'pro-locked'}">
        ${profile.is_pro ? '' : '<span class="pro-tag">Pro</span>'}
        <div class="dash-icon">📅</div>
        <h3>Bookings</h3>
        <p>Manage your lesson bookings and schedule.</p>
        <a href="${profile.is_pro ? 'bookings.html' : 'upgrade.html'}" class="btn btn-outline">View Bookings</a>
      </div>
    `;
  } else if (profile.role === 'student') {
    html += `
      <div class="dash-card">
        <div class="dash-icon">👩‍🏫</div>
        <h3>Find a Tutor</h3>
        <p>Browse tutors by subject and book lessons.</p>
        <a href="tutors.html" class="btn btn-outline">Browse Tutors</a>
      </div>
      <div class="dash-card">
        <div class="dash-icon">🏫</div>
        <h3>Explore Schools</h3>
        <p>Discover schools and their programs.</p>
        <a href="schools.html" class="btn btn-outline">View Schools</a>
      </div>
    `;
  } else if (profile.role === 'admin') {
    html += `
      <div class="dash-card">
        <div class="dash-icon">⚙️</div>
        <h3>Admin Panel</h3>
        <p>Manage users, listings, and site settings.</p>
        <a href="admin/admin-dashboard.html" class="btn btn-primary">Go to Admin Panel</a>
      </div>
    `;
  }

  html += '</div>';
  dashboardGrid.innerHTML = html;
}

function formatRole(role) {
  const map = {
    school: 'School',
    job_seeker: 'Job Seeker',
    tutor: 'Tutor',
    student: 'Student',
    admin: 'Admin'
  };
  return map[role] || role;
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  });
}

loadDashboard();