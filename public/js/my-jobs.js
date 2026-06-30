// EduBridge - My Job Listings (for schools/tutors)

const myJobsContainer = document.getElementById('myJobsContainer');

async function loadMyJobs() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const userId = session.user.id;

  // Get jobs posted by this user, along with application counts
  const { data: jobs, error } = await supabaseClient
    .from('jobs')
    .select('*, applications(id)')
    .eq('school_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    myJobsContainer.innerHTML = '<p>Could not load your jobs.</p>';
    return;
  }

  if (!jobs || jobs.length === 0) {
    myJobsContainer.innerHTML = `
      <div class="dash-card">
        <p>You haven't posted any jobs yet.</p>
        <a href="post-job.html" class="btn btn-primary" style="margin-top:14px;">Post Your First Job</a>
      </div>
    `;
    return;
  }

  myJobsContainer.innerHTML = `
    <div class="jobs-list">
      ${jobs.map(job => `
        <div class="job-card">
          <div class="job-card-header">
            <h3>${job.title}</h3>
            <span class="job-type-tag">${job.is_active ? 'Active' : 'Closed'}</span>
          </div>
          <p class="job-location">📍 ${job.location || 'Not specified'}</p>
          <p class="job-desc">${job.applications.length} applicant${job.applications.length !== 1 ? 's' : ''}</p>
          <div class="job-card-footer">
            <a href="job-applicants.html?id=${job.id}" class="btn btn-outline">View Applicants</a>
            <button class="btn btn-outline" onclick="toggleJobStatus('${job.id}', ${job.is_active})">
              ${job.is_active ? 'Close Listing' : 'Reopen Listing'}
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function toggleJobStatus(jobId, currentStatus) {
  const { error } = await supabaseClient
    .from('jobs')
    .update({ is_active: !currentStatus })
    .eq('id', jobId);

  if (error) {
    alert('Could not update job status.');
    return;
  }

  loadMyJobs();
}

loadMyJobs();