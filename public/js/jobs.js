// EduBridge - Jobs Logic (Post + Browse + Apply)

const postJobForm = document.getElementById('postJobForm');
const jobsListContainer = document.getElementById('jobsListContainer');

// ===== POST A JOB =====
if (postJobForm) {
  postJobForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    errorMsg.textContent = '';
    successMsg.textContent = '';

    // Step 1: Confirm user is logged in
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return;
    }

    const userId = session.user.id;

    // Step 2: Get their profile (need role + is_pro)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, is_pro')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      errorMsg.textContent = 'Could not verify your account. Please try again.';
      return;
    }

    if (profile.role !== 'school') {
      errorMsg.textContent = 'Only school accounts can post jobs.';
      return;
    }

    // Step 3: FREE PLAN LIMIT CHECK - max 2 active jobs
    if (!profile.is_pro) {
      const { count, error: countError } = await supabaseClient
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', userId)
        .eq('is_active', true);

      if (countError) {
        errorMsg.textContent = 'Error checking your job limit. Please try again.';
        return;
      }

      if (count >= 2) {
        errorMsg.innerHTML = 'Free plan allows only 2 active job posts. <a href="upgrade.html" style="color:#f5a623;font-weight:700;">Upgrade to Pro</a> for unlimited postings.';
        return;
      }
    }

    // Step 4: Gather form data
    const title = document.getElementById('jobTitle').value.trim();
    const description = document.getElementById('jobDescription').value.trim();
    const subject = document.getElementById('jobSubject').value.trim();
    const jobType = document.getElementById('jobType').value;
    const location = document.getElementById('jobLocation').value.trim();
    const salaryRange = document.getElementById('jobSalary').value.trim();

    // Step 5: Insert job
    const { error: insertError } = await supabaseClient
      .from('jobs')
      .insert([{
        school_id: userId,
        title: title,
        description: description,
        subject: subject,
        job_type: jobType,
        location: location,
        salary_range: salaryRange,
        is_active: true
      }]);

    if (insertError) {
      errorMsg.textContent = insertError.message;
      return;
    }

    successMsg.textContent = 'Job posted successfully!';
    postJobForm.reset();
    setTimeout(() => {
      window.location.href = 'my-jobs.html';
    }, 1500);
  });
}

function formatJobType(type) {
  const map = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract',
    volunteer: 'Volunteer'
  };
  return map[type] || type;
}
// ===== SEARCH & FILTER =====
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterType = document.getElementById('filterType');

async function loadJobs(searchTerm = '', jobType = '') {
  if (!jobsListContainer) return;

  jobsListContainer.innerHTML = '<p>Loading jobs...</p>';

  let query = supabaseClient
    .from('jobs')
    .select('*, profiles(full_name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (jobType) {
    query = query.eq('job_type', jobType);
  }

  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
  }

  const { data: jobs, error } = await query;

  if (error) {
    jobsListContainer.innerHTML = '<p>Could not load jobs right now.</p>';
    return;
  }

  if (!jobs || jobs.length === 0) {
    jobsListContainer.innerHTML = '<p>No jobs found matching your search.</p>';
    return;
  }

  jobsListContainer.innerHTML = jobs.map(job => `
    <div class="job-card">
      <div class="job-card-header">
        <h3>${job.title}</h3>
        <span class="job-type-tag">${formatJobType(job.job_type)}</span>
      </div>
      <p class="job-school">${job.profiles?.full_name || 'EduBridge School'}</p>
      <p class="job-location">📍 ${job.location || 'Not specified'}</p>
      <p class="job-desc">${job.description.substring(0, 120)}${job.description.length > 120 ? '...' : ''}</p>
      <div class="job-card-footer">
        ${job.salary_range ? `<span class="job-salary">${job.salary_range}</span>` : '<span></span>'}
        <a href="job-details.html?id=${job.id}" class="btn btn-outline">View Details</a>
      </div>
    </div>
  `).join('');
}

if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    loadJobs(searchInput.value.trim(), filterType.value);
  });
}

if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadJobs(searchInput.value.trim(), filterType.value);
    }
  });
}

if (filterType) {
  filterType.addEventListener('change', () => {
    loadJobs(searchInput.value.trim(), filterType.value);
  });
}
loadJobs();