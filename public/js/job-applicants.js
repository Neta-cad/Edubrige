// EduBridge - View Applicants for a Job

const applicantsContainer = document.getElementById('applicantsContainer');
const jobTitleHeader = document.getElementById('jobTitleHeader');

function getJobIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadApplicants() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const jobId = getJobIdFromUrl();
  if (!jobId) {
    applicantsContainer.innerHTML = '<p>No job specified.</p>';
    return;
  }

  // Confirm this job belongs to the logged-in user, and get its title
  const { data: job, error: jobError } = await supabaseClient
    .from('jobs')
    .select('title, school_id')
    .eq('id', jobId)
    .single();

  if (jobError || !job || job.school_id !== session.user.id) {
    applicantsContainer.innerHTML = '<p>You do not have access to this job\'s applicants.</p>';
    return;
  }

  jobTitleHeader.textContent = `Applicants for "${job.title}"`;

  // Get applications with applicant profile info
  const { data: applications, error } = await supabaseClient
    .from('applications')
    .select('*, profiles(full_name, email)')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) {
    applicantsContainer.innerHTML = '<p>Could not load applicants.</p>';
    return;
  }

  if (!applications || applications.length === 0) {
    applicantsContainer.innerHTML = '<p>No applicants yet for this job.</p>';
    return;
  }

  applicantsContainer.innerHTML = applications.map(app => `
    <div class="applicant-card">
      <div class="applicant-header">
        <h3>${app.profiles?.full_name || 'Applicant'}</h3>
        <span class="status-pill status-${app.status}">${app.status}</span>
      </div>
      <p class="applicant-note">${app.cover_note || 'No cover note provided.'}</p>
      <p class="applicant-note">📧 ${app.profiles?.email || ''}</p>
      <div class="applicant-actions">
        <button class="btn btn-outline" onclick="updateStatus('${app.id}', 'reviewed')">Mark Reviewed</button>
        <button class="btn btn-primary" onclick="updateStatus('${app.id}', 'accepted')">Accept</button>
        <button class="btn btn-outline" onclick="updateStatus('${app.id}', 'rejected')">Reject</button>
      </div>
    </div>
  `).join('');
}

async function updateStatus(applicationId, newStatus) {
  const { error } = await supabaseClient
    .from('applications')
    .update({ status: newStatus })
    .eq('id', applicationId);

  if (error) {
    alert('Could not update application status.');
    return;
  }

  loadApplicants();
}

loadApplicants();