// EduBridge - Schools Directory Logic

const schoolsListContainer = document.getElementById('schoolsListContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

async function loadSchools(searchTerm = '') {
  if (!schoolsListContainer) return;

  schoolsListContainer.innerHTML = '<p>Loading schools...</p>';

  let query = supabaseClient
    .from('school_profiles')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false });

  if (searchTerm) {
    query = query.or(`school_name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
  }

  const { data: schools, error } = await query;

  if (error) {
    schoolsListContainer.innerHTML = '<p>Could not load schools right now.</p>';
    return;
  }

  if (!schools || schools.length === 0) {
    schoolsListContainer.innerHTML = '<p>No schools found. Be the first to set up your school profile!</p>';
    return;
  }

  schoolsListContainer.innerHTML = schools.map(school => {
    const name = school.school_name || school.profiles?.full_name || 'Unnamed School';
    const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    return `
      <div class="school-card">
        <div class="school-logo">${initials}</div>
        <h3>${name} ${school.is_verified ? '<span class="verified-tick">✓</span>' : ''}</h3>
        ${school.school_type ? `<p class="school-type-label">${formatSchoolType(school.school_type)}</p>` : ''}
        <p class="job-location">📍 ${school.address || 'Location not specified'}</p>
        <a href="school-profile-view.html?id=${school.id}" class="btn btn-outline">View Profile</a>
      </div>
    `;
  }).join('');
}

function formatSchoolType(type) {
  const map = {
    primary: 'Primary School',
    secondary: 'Secondary School',
    tertiary: 'Tertiary / University',
    vocational: 'Vocational Center',
    other: 'School'
  };
  return map[type] || type;
}

if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    loadSchools(searchInput.value.trim());
  });
}

if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadSchools(searchInput.value.trim());
    }
  });
}

loadSchools();