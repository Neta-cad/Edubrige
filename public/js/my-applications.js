// EduBridge - My Applications (for job seekers)

const myApplicationsContainer = document.getElementById('myApplicationsContainer');

async function loadMyApplications() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const userId = session.user.id;

  // Get applications with job + school info
  const { data: applications, error } = await supabaseClient
    .from('applications')
    .select('*, jobs(id, title, location, job_type, profiles(full_name))')
    .eq('applicant_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    myApplicationsContainer.innerHTML = '<p>Could not load your applications.</p>';
    return;
  }

  if (!applications || applications.length === 0) {
    myApplicationsContainer.innerHTML = `
      <div class="dash-card">
        <p>You haven't applied to any jobs yet.</p>
        <a href="jobs.html" class="btn btn-primary" style="margin-top:14px;">Browse Jobs</a>
      </div>
    `;
    return;
  }

  myApplicationsContainer.innerHTML = `
    <div class="jobs-list">
      ${applications.map(app => `
        <div class="job-card">
          <div class="job-card-header">
            <h3>${app.jobs?.title || 'Job no longer available'}</h3>
            <span class="status-pill status-${app.status}">${app.status}</span>
          </div>
          <p class="job-school">${app.jobs?.profiles?.full_name || ''}</p>
          <p class="job-location">📍 ${app.jobs?.location || 'Not specified'}</p>
          <div class="job-card-footer">
            <span class="job-salary">Applied ${formatDate(app.created_at)}</span>
            ${app.jobs?.id ? `<a href="job-details.html?id=${app.jobs.id}" class="btn btn-outline">View Job</a>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

loadMyApplications();