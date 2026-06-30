// EduBridge - School Profile Edit Logic

const schoolProfileForm = document.getElementById('schoolProfileForm');

async function loadExistingProfile() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const userId = session.user.id;

  // Confirm role is 'school'
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile || profile.role !== 'school') {
    document.querySelector('.auth-card').innerHTML = '<p>Only school accounts can edit a school profile.</p>';
    return;
  }

  // Load existing school_profiles row, if any
  const { data: schoolProfile } = await supabaseClient
    .from('school_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (schoolProfile) {
    document.getElementById('schoolName').value = schoolProfile.school_name || '';
    document.getElementById('schoolDescription').value = schoolProfile.description || '';
    document.getElementById('schoolType').value = schoolProfile.school_type || '';
    document.getElementById('schoolAddress').value = schoolProfile.address || '';
    document.getElementById('foundedYear').value = schoolProfile.founded_year || '';
    document.getElementById('schoolWebsite').value = schoolProfile.website || '';
  }
}

if (schoolProfileForm) {
  schoolProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    errorMsg.textContent = '';
    successMsg.textContent = '';

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return;
    }

    const userId = session.user.id;

    const schoolData = {
      id: userId,
      school_name: document.getElementById('schoolName').value.trim(),
      description: document.getElementById('schoolDescription').value.trim(),
      school_type: document.getElementById('schoolType').value || null,
      address: document.getElementById('schoolAddress').value.trim(),
      founded_year: document.getElementById('foundedYear').value || null,
      website: document.getElementById('schoolWebsite').value.trim()
    };

    // Upsert: insert if new, update if exists
    const { error } = await supabaseClient
      .from('school_profiles')
      .upsert(schoolData, { onConflict: 'id' });

    if (error) {
      errorMsg.textContent = error.message;
      return;
    }

    successMsg.textContent = 'Profile saved successfully!';
  });
}

loadExistingProfile();