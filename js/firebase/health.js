// ── NEXABAY HEALTH SYSTEM ─────────────────────

function nexaAddHealthListing(listingData, imageUrl) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var listingRef = db.collection('healthListings').doc();
  var listingId  = listingRef.id;

  return listingRef.set({
    id:              listingId,
    providerId:      user.uid,
    providerName:    listingData.providerName || 'Provider',
    listingType:     listingData.listingType || 'doctor',
    name:            listingData.name,
    specialization:  listingData.specialization || '',
    category:        listingData.category,
    description:     listingData.description,
    consultationFee: parseFloat(listingData.consultationFee) || 0,
    location:        listingData.location,
    address:         listingData.address || '',
    availableDays:   listingData.availableDays || [],
    availableFrom:   listingData.availableFrom || '',
    availableTo:     listingData.availableTo || '',
    experience:      listingData.experience || '',
    qualifications:  listingData.qualifications || '',
    imageUrl:        imageUrl || '',
    emoji:           listingData.emoji || '🏥',
    status: 'pending',
    rating:          0,
    reviews:         0,
    appointments:    0,
    createdAt:       firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return listingId;
  });
}

function nexaGetHealthListings(listingType) {
  var query = db.collection('healthListings').where('status', '==', 'active');
  if (listingType && listingType !== 'all') {
    query = query.where('listingType', '==', listingType);
  }
  return query.get()
    .then(function(snap) {
      var listings = [];
      snap.forEach(function(doc) {
        listings.push(doc.data());
      });
      listings.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return listings;
    });
}

function nexaGetProviderHealthListings(providerId) {
  return db.collection('healthListings')
    .where('providerId', '==', providerId)
    .get()
    .then(function(snap) {
      var listings = [];
      snap.forEach(function(doc) {
        var data = doc.data();
        if (data.status !== 'deleted') {
          listings.push(data);
        }
      });
      listings.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return listings;
    });
}

function nexaDeleteHealthListing(listingId) {
  return db.collection('healthListings').doc(listingId).update({ status: 'deleted' });
}

// ── APPOINTMENTS ───────────────────────────────

function nexaBookAppointment(listingId, appointmentData) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var apptRef = db.collection('appointments').doc();
  var apptId  = apptRef.id;

  return apptRef.set({
    id:              apptId,
    listingId:       listingId,
    patientId:       user.uid,
    patientName:     appointmentData.patientName || '',
    patientEmail:    appointmentData.patientEmail || '',
    patientPhone:    appointmentData.patientPhone || '',
    providerName:    appointmentData.providerName || '',
    listingType:     appointmentData.listingType || 'doctor',
    appointmentDate: appointmentData.appointmentDate || '',
    appointmentTime: appointmentData.appointmentTime || '',
    reason:          appointmentData.reason || '',
    consultationFee: appointmentData.consultationFee || 0,
    paymentRef:      appointmentData.paymentRef || '',
    status:          'confirmed',
    createdAt:       firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return db.collection('healthListings').doc(listingId).update({
      appointments: firebase.firestore.FieldValue.increment(1)
    });
  }).then(function() {
    return apptId;
  });
}

function nexaGetProviderAppointments(providerId) {
  return db.collection('appointments')
    .where('providerId', '==', providerId)
    .get()
    .then(function(snap) {
      var appointments = [];
      snap.forEach(function(doc) {
        appointments.push(doc.data());
      });
      appointments.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return appointments;
    });
}

function nexaGetListingAppointments(listingId) {
  return db.collection('appointments')
    .where('listingId', '==', listingId)
    .get()
    .then(function(snap) {
      var appointments = [];
      snap.forEach(function(doc) {
        appointments.push(doc.data());
      });
      appointments.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return appointments;
    });
}