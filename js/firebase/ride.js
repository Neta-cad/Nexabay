// ── NEXABAY RIDE SYSTEM ───────────────────────

function nexaAddDriverListing(driverData, imageUrl) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var driverRef = db.collection('drivers').doc();
  var driverId  = driverRef.id;

  return driverRef.set({
    id:              driverId,
    driverId:        user.uid,
    driverName:      driverData.driverName || 'Driver',
    serviceType:     driverData.serviceType || 'both',
    vehicleType:     driverData.vehicleType || 'Car',
    vehicleName:     driverData.vehicleName || '',
    vehicleColor:    driverData.vehicleColor || '',
    plateNumber:     driverData.plateNumber || '',
    pricePerKm:      parseFloat(driverData.pricePerKm) || 0,
    basePrice:       parseFloat(driverData.basePrice) || 0,
    serviceAreas:    driverData.serviceAreas || [],
    availableDays:   driverData.availableDays || [],
    availableFrom:   driverData.availableFrom || '',
    availableTo:     driverData.availableTo || '',
    description:     driverData.description || '',
    experience:      driverData.experience || '',
    imageUrl:        imageUrl || '',
    emoji:           driverData.emoji || '🚗',
    status: 'pending',
    isAvailable:     true,
    rating:          0,
    reviews:         0,
    totalRides:      0,
    createdAt:       firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return driverId;
  });
}

function nexaGetDrivers(serviceType) {
  var query = db.collection('drivers').where('status', '==', 'active');
  if (serviceType && serviceType !== 'all') {
    query = query.where('serviceType', '==', serviceType);
  }
  return query.get()
    .then(function(snap) {
      var drivers = [];
      snap.forEach(function(doc) {
        drivers.push(doc.data());
      });
      drivers.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return drivers;
    });
}

function nexaGetMyDriverListings(driverId) {
  return db.collection('drivers')
    .where('driverId', '==', driverId)
    .get()
    .then(function(snap) {
      var drivers = [];
      snap.forEach(function(doc) {
        var data = doc.data();
        if (data.status !== 'deleted') {
          drivers.push(data);
        }
      });
      drivers.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return drivers;
    });
}

function nexaDeleteDriverListing(driverId) {
  return db.collection('drivers').doc(driverId).update({ status: 'deleted' });
}

function nexaToggleDriverAvailability(driverId, isAvailable) {
  return db.collection('drivers').doc(driverId).update({ isAvailable: isAvailable });
}

// ── RIDE REQUESTS ──────────────────────────────

function nexaCreateRideRequest(driverId, requestData) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var requestRef = db.collection('rideRequests').doc();
  var requestId  = requestRef.id;

  return requestRef.set({
    id:            requestId,
    driverId:      driverId,
    customerId:    user.uid,
    customerName:  requestData.customerName || '',
    customerEmail: requestData.customerEmail || '',
    customerPhone: requestData.customerPhone || '',
    serviceType:   requestData.serviceType || 'ride',
    pickupAddress: requestData.pickupAddress || '',
    dropoffAddress: requestData.dropoffAddress || '',
    estimatedKm:   requestData.estimatedKm || 0,
    estimatedPrice: requestData.estimatedPrice || 0,
    scheduledDate: requestData.scheduledDate || '',
    scheduledTime: requestData.scheduledTime || '',
    notes:         requestData.notes || '',
    paymentRef:    requestData.paymentRef || '',
    status:        'pending',
    createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return db.collection('drivers').doc(driverId).update({
      totalRides: firebase.firestore.FieldValue.increment(1)
    });
  }).then(function() {
    return requestId;
  });
}

function nexaGetDriverRideRequests(driverId) {
  return db.collection('rideRequests')
    .where('driverId', '==', driverId)
    .get()
    .then(function(snap) {
      var requests = [];
      snap.forEach(function(doc) {
        requests.push(doc.data());
      });
      requests.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return requests;
    });
}

function nexaUpdateRideStatus(requestId, status) {
  return db.collection('rideRequests').doc(requestId).update({ status: status });
}