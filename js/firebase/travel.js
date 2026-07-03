// ── NEXABAY TRAVEL SYSTEM ─────────────────────

function nexaAddTravelListing(listingData, imageUrl) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var listingRef = db.collection('travelListings').doc();
  var listingId  = listingRef.id;

  return listingRef.set({
    id:            listingId,
    agentId:       user.uid,
    agentName:     listingData.agentName || 'Agent',
    listingType:   listingData.listingType || 'hotel',
    title:         listingData.title,
    category:      listingData.category,
    description:   listingData.description,
    location:      listingData.location,
    country:       listingData.country || 'Nigeria',
    price:         parseFloat(listingData.price),
    priceUnit:     listingData.priceUnit || 'per night',
    roomTypes:     listingData.roomTypes || [],
    amenities:     listingData.amenities || [],
    checkIn:       listingData.checkIn || '',
    checkOut:      listingData.checkOut || '',
    duration:      listingData.duration || '',
    includes:      listingData.includes || '',
    imageUrl:      imageUrl || '',
    emoji:         listingData.emoji || '🏨',
    status: 'pending',
    rating:        0,
    reviews:       0,
    bookings:      0,
    createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return listingId;
  });
}

function nexaGetTravelListings(listingType) {
  var query = db.collection('travelListings').where('status', '==', 'active');
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

function nexaGetAgentListings(agentId) {
  return db.collection('travelListings')
    .where('agentId', '==', agentId)
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

function nexaDeleteTravelListing(listingId) {
  return db.collection('travelListings').doc(listingId).update({ status: 'deleted' });
}

// ── TRAVEL BOOKINGS ────────────────────────────

function nexaCreateTravelBooking(listingId, bookingData) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var bookingRef = db.collection('travelBookings').doc();
  var bookingId  = bookingRef.id;

  return bookingRef.set({
    id:            bookingId,
    listingId:     listingId,
    customerId:    user.uid,
    customerName:  bookingData.customerName || '',
    customerEmail: bookingData.customerEmail || '',
    customerPhone: bookingData.customerPhone || '',
    listingTitle:  bookingData.listingTitle || '',
    listingType:   bookingData.listingType || 'hotel',
    roomType:      bookingData.roomType || '',
    checkIn:       bookingData.checkIn || '',
    checkOut:      bookingData.checkOut || '',
    guests:        bookingData.guests || 1,
    totalPrice:    bookingData.totalPrice || 0,
    paymentRef:    bookingData.paymentRef || '',
    status:        'confirmed',
    createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return db.collection('travelListings').doc(listingId).update({
      bookings: firebase.firestore.FieldValue.increment(1)
    });
  }).then(function() {
    return bookingId;
  });
}

function nexaGetAgentBookings(agentId) {
  return db.collection('travelBookings')
    .where('agentId', '==', agentId)
    .get()
    .then(function(snap) {
      var bookings = [];
      snap.forEach(function(doc) {
        bookings.push(doc.data());
      });
      bookings.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return bookings;
    });
}