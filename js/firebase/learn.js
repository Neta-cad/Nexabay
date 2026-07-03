// ── NEXABAY LEARN SYSTEM ──────────────────────

function nexaAddCourse(courseData) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var courseRef = db.collection('courses').doc();
  var courseId  = courseRef.id;

  return courseRef.set({
    id:            courseId,
    instructorId:  user.uid,
    instructorName: courseData.instructorName || 'Instructor',
    title:         courseData.title,
    category:      courseData.category,
    description:   courseData.description,
    price:         parseFloat(courseData.price) || 0,
    isFree:        courseData.isFree || false,
    level:         courseData.level || 'Beginner',
    imageUrl:      courseData.imageUrl || '',
    emoji:         courseData.emoji || '🎓',
    lessons:       courseData.lessons || [],
    status: 'pending',
    rating:        0,
    reviews:       0,
    students:      0,
    createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return courseId;
  });
}

function nexaGetCourses(category) {
  var query = db.collection('courses').where('status', '==', 'active');
  if (category && category !== 'all') {
    query = query.where('category', '==', category);
  }
  return query.get()
    .then(function(snap) {
      var courses = [];
      snap.forEach(function(doc) {
        courses.push(doc.data());
      });
      courses.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return courses;
    });
}

function nexaGetInstructorCourses(instructorId) {
  return db.collection('courses')
    .where('instructorId', '==', instructorId)
    .get()
    .then(function(snap) {
      var courses = [];
      snap.forEach(function(doc) {
        var data = doc.data();
        if (data.status !== 'deleted') {
          courses.push(data);
        }
      });
      courses.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return courses;
    });
}

function nexaDeleteCourse(courseId) {
  return db.collection('courses').doc(courseId).update({ status: 'deleted' });
}

// ── ENROLLMENTS ────────────────────────────────

function nexaEnrollInCourse(courseId, courseData) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var enrollRef = db.collection('enrollments').doc();

  return enrollRef.set({
    id:           enrollRef.id,
    courseId:     courseId,
    studentId:    user.uid,
    courseTitle:  courseData.title,
    instructorId: courseData.instructorId,
    progress:     0,
    enrolledAt:   firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return db.collection('courses').doc(courseId).update({
      students: firebase.firestore.FieldValue.increment(1)
    });
  }).then(function() {
    return enrollRef.id;
  });
}

function nexaGetMyEnrollments(studentId) {
  return db.collection('enrollments')
    .where('studentId', '==', studentId)
    .get()
    .then(function(snap) {
      var enrollments = [];
      snap.forEach(function(doc) {
        enrollments.push(doc.data());
      });
      return enrollments;
    });
}

function nexaCheckEnrollment(courseId, studentId) {
  return db.collection('enrollments')
    .where('courseId', '==', courseId)
    .where('studentId', '==', studentId)
    .get()
    .then(function(snap) {
      return !snap.empty;
    });
}