// EduBridge - Job Details + Apply Logic

const jobDetailContainer = document.getElementById('jobDetailContainer');

function getJobIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadJobDetails() {
  const jobId = getJobIdFromUrl();

  if (!jobId) {
    jobDetailContainer.innerHTML = '<p>No job specified.</p>';
    return;
  }

  // Fetch the job
  const { data: job, error } = await supabaseClient
    .from('jobs')
    .select('*, profiles(full_name)')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    jobDetailContainer.innerHTML = '<p>Job not found or no longer available.</p>';
    return;
  }

  // Check if user is logged in
  const { data: { session } } = await supabaseClient.auth.getSession();

  let applySectionHtml = '';

  if (!session) {
    applySectionHtml = `
      <div class="apply-box">
        <p>You need an account to apply for this job.</p>
        <a href="login.html" class="btn btn-primary">Log In to Apply</a>
      </div>
    `;
  } else {
    // Check if already applied
    const { data: existingApp } = await supabaseClient
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('applicant_id', session.user.id)
      .maybeSingle();

    if (existingApp) {
      applySectionHtml = `
        <div class="apply-box">
          <span class="applied-badge">✓ You've already applied to this job</span>
        </div>
      `;
    } else {
      applySectionHtml = `
        <div class="apply-box">
          <h3>Apply for this position</h3>
          <form id="applyForm">
            <textarea id="coverNote" rows="4" placeholder="Add a short note about why you're a great fit (optional)"></textarea>
            <div id="applyError" class="error-msg"></div>
            <div id="applySuccess" class="success-msg"></div>
            <button type="submit" class="btn btn-primary">Submit Application</button>
          </form>
        </div>
      `;
    }
  }

  jobDetailContainer.innerHTML = `
    <div class="job-detail-card">
      <div class="job-detail-header">
        <h1>${job.title}</h1>
        <span class="job-type-tag">${formatJobType(job.job_type)}</span>
      </div>
      <p class="job-detail-school">${job.profiles?.full_name || 'EduBridge School'}</p>

      <div class="job-detail-meta">
        ${job.location ? `<span class="meta-pill">📍 ${job.location}</span>` : ''}
        ${job.subject ? `<span class="meta-pill">📖 ${job.subject}</span>` : ''}
        ${job.salary_range ? `<span class="meta-pill">💰 ${job.salary_range}</span>` : ''}
      </div>

      <div class="job-detail-body">
        <h3>Job Description</h3>
        <p>${job.description}</p>
      </div>

      ${applySectionHtml}
    </div>
  `;

  // Attach apply form listener if it exists
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => handleApply(e, jobId, session.user.id));
  }
}

async function handleApply(e, jobId, userId) {
  e.preventDefault();

  const applyError = document.getElementById('applyError');
  const applySuccess = document.getElementById('applySuccess');
  applyError.textContent = '';
  applySuccess.textContent = '';

  // Get profile to check role + pro status
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('role, is_pro')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    applyError.textContent = 'Could not verify your account.';
    return;
  }

  // FREE PLAN LIMIT - max 5 applications for job seekers
  if (!profile.is_pro) {
    const { count, error: countError } = await supabaseClient
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('applicant_id', userId);

    if (countError) {
      applyError.textContent = 'Error checking application limit.';
      return;
    }

    if (count >= 5) {
      applyError.innerHTML = 'Free plan allows only 5 applications. <a href="upgrade.html" style="color:#f5a623;font-weight:700;">Upgrade to Pro</a> for unlimited applications.';
      return;
    }
  }

  const coverNote = document.getElementById('coverNote').value.trim();

  const { error: insertError } = await supabaseClient
    .from('applications')
    .insert([{
      job_id: jobId,
      applicant_id: userId,
      cover_note: coverNote,
      status: 'pending'
    }]);

  if (insertError) {
    applyError.textContent = insertError.message;
    return;
  }

  applySuccess.textContent = 'Application submitted successfully!';
  document.getElementById('applyForm').innerHTML = '<span class="applied-badge">✓ Application submitted</span>';
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

loadJobDetails();