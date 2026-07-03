// ── NEXABAY SERVICES SYSTEM ──────────────────

function nexaAddService(serviceData, imageUrl) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var serviceRef = db.collection('services').doc();
  var serviceId  = serviceRef.id;

  return serviceRef.set({
    id:           serviceId,
    providerId:   user.uid,
    providerName: serviceData.providerName || 'Provider',
    title:        serviceData.title,
    category:     serviceData.category,
    description:  serviceData.description,
    price:        parseFloat(serviceData.price),
    location:     serviceData.location,
    deliveryTime: serviceData.deliveryTime || 'Negotiable',
    imageUrl:     imageUrl || '',
    emoji:        serviceData.emoji || '🛠️',
    status: 'pending',
    rating:       0,
    reviews:      0,
    completedJobs: 0,
    createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return serviceId;
  });
}

function nexaGetServices(category) {
  var query = db.collection('services').where('status', '==', 'active');
  if (category && category !== 'all') {
    query = query.where('category', '==', category);
  }
  return query.get()
    .then(function(snap) {
      var services = [];
      snap.forEach(function(doc) {
        services.push(doc.data());
      });
      services.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return services;
    });
}

function nexaGetProviderServices(providerId) {
  return db.collection('services')
    .where('providerId', '==', providerId)
    .get()
    .then(function(snap) {
      var services = [];
      snap.forEach(function(doc) {
        services.push(doc.data());
      });
      services.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return services;
    });
}

function nexaDeleteService(serviceId) {
  return db.collection('services').doc(serviceId).update({ status: 'deleted' });
}