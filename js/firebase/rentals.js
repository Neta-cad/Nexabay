// ── NEXABAY RENTALS SYSTEM ───────────────────

function nexaAddRental(rentalData, imageUrl) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var rentalRef = db.collection('rentals').doc();
  var rentalId  = rentalRef.id;

  return rentalRef.set({
    id:           rentalId,
    ownerId:      user.uid,
    ownerName:    rentalData.ownerName || 'Owner',
    title:        rentalData.title,
    listingType:  rentalData.listingType,
    category:     rentalData.category,
    description:  rentalData.description,
    price:        parseFloat(rentalData.price),
    rentalPeriod: rentalData.rentalPeriod || 'monthly',
    location:     rentalData.location,
    bedrooms:     rentalData.bedrooms || null,
    bathrooms:    rentalData.bathrooms || null,
    amenities:    rentalData.amenities || [],
    condition:    rentalData.condition || '',
    imageUrl:     imageUrl || '',
    emoji:        rentalData.emoji || '🏠',
    status: 'pending',
    rating:       0,
    reviews:      0,
    createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return rentalId;
  });
}

function nexaGetRentals(listingType) {
  var query = db.collection('rentals').where('status', '==', 'active');
  if (listingType && listingType !== 'all') {
    query = query.where('listingType', '==', listingType);
  }
  return query.get()
    .then(function(snap) {
      var rentals = [];
      snap.forEach(function(doc) {
        rentals.push(doc.data());
      });
      rentals.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return rentals;
    });
}

function nexaGetOwnerRentals(ownerId) {
  return db.collection('rentals')
    .where('ownerId', '==', ownerId)
    .get()
    .then(function(snap) {
      var rentals = [];
      snap.forEach(function(doc) {
        var data = doc.data();
        if (data.status !== 'deleted') {
          rentals.push(data);
        }
      });
      rentals.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return rentals;
    });
}

function nexaDeleteRental(rentalId) {
  return db.collection('rentals').doc(rentalId).update({ status: 'deleted' });
}