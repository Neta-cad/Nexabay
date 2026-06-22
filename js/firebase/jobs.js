// ── NEXABAY JOBS SYSTEM ───────────────────────

function nexaAddJob(jobData) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var jobRef = db.collection('jobs').doc();
  var jobId  = jobRef.id;

  return jobRef.set({
    id:           jobId,
    employerId:   user.uid,
    employerName: jobData.employerName || 'Employer',
    companyName:  jobData.companyName || jobData.employerName || 'Company',
    title:        jobData.title,
    category:     jobData.category,
    jobType:      jobData.jobType,
    description:  jobData.description,
    requirements: jobData.requirements || '',
    salaryMin:    parseFloat(jobData.salaryMin) || 0,
    salaryMax:    parseFloat(jobData.salaryMax) || 0,
    location:     jobData.location,
    remote:       jobData.remote || false,
    status:       'active',
    applicantCount: 0,
    createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return jobId;
  });
}

function nexaGetJobs(jobType) {
  var query = db.collection('jobs').where('status', '==', 'active');
  if (jobType && jobType !== 'all') {
    query = query.where('jobType', '==', jobType);
  }
  return query.get()
    .then(function(snap) {
      var jobs = [];
      snap.forEach(function(doc) {
        jobs.push(doc.data());
      });
      jobs.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return jobs;
    });
}

function nexaGetEmployerJobs(employerId) {
  return db.collection('jobs')
    .where('employerId', '==', employerId)
    .get()
    .then(function(snap) {
      var jobs = [];
      snap.forEach(function(doc) {
        var data = doc.data();
        if (data.status !== 'deleted') {
          jobs.push(data);
        }
      });
      jobs.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return jobs;
    });
}

function nexaDeleteJob(jobId) {
  return db.collection('jobs').doc(jobId).update({ status: 'deleted' });
}

// ── JOB APPLICATIONS ──────────────────────────

function nexaApplyToJob(jobId, applicationData) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var appRef = db.collection('jobApplications').doc();
  var appId  = appRef.id;

  return appRef.set({
    id:            appId,
    jobId:         jobId,
    applicantId:   user.uid,
    applicantName: applicationData.applicantName || 'Applicant',
    applicantEmail: applicationData.applicantEmail || '',
    applicantPhone: applicationData.applicantPhone || '',
    coverLetter:   applicationData.coverLetter || '',
    resumeUrl:     applicationData.resumeUrl || '',
    status:        'pending',
    appliedAt:     firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return db.collection('jobs').doc(jobId).update({
      applicantCount: firebase.firestore.FieldValue.increment(1)
    });
  }).then(function() {
    return appId;
  });
}

function nexaGetJobApplications(jobId) {
  return db.collection('jobApplications')
    .where('jobId', '==', jobId)
    .get()
    .then(function(snap) {
      var apps = [];
      snap.forEach(function(doc) {
        apps.push(doc.data());
      });
      apps.sort(function(a, b) {
        var aTime = a.appliedAt ? a.appliedAt.toMillis() : 0;
        var bTime = b.appliedAt ? b.appliedAt.toMillis() : 0;
        return bTime - aTime;
      });
      return apps;
    });
}

function nexaGetMyApplications(applicantId) {
  return db.collection('jobApplications')
    .where('applicantId', '==', applicantId)
    .get()
    .then(function(snap) {
      var apps = [];
      snap.forEach(function(doc) {
        apps.push(doc.data());
      });
      apps.sort(function(a, b) {
        var aTime = a.appliedAt ? a.appliedAt.toMillis() : 0;
        var bTime = b.appliedAt ? b.appliedAt.toMillis() : 0;
        return bTime - aTime;
      });
      return apps;
    });
}

function nexaUpdateApplicationStatus(appId, status) {
  return db.collection('jobApplications').doc(appId).update({ status: status });
}