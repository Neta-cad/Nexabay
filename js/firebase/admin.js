// ── NEXABAY ADMIN SYSTEM ──────────────────────

var ADMIN_UID = 'BCkKeqX8PfaKDE1MBxzXbwdsjPo1';

function nexaCheckIsAdmin(uid) {
  return db.collection('users').doc(uid).get()
    .then(function(doc) {
      if (!doc.exists) return false;
      return doc.data().isAdmin === true;
    });
}

// ── USERS ──────────────────────────────────────

function nexaGetAllUsers(limitCount) {
  return db.collection('users')
    .limit(limitCount || 50)
    .get()
    .then(function(snap) {
      var users = [];
      snap.forEach(function(doc) { users.push(doc.data()); });
      return users;
    });
}

function nexaSuspendUser(uid, suspended) {
  return db.collection('users').doc(uid).update({ suspended: suspended });
}

function nexaGrantAdmin(uid) {
  return db.collection('users').doc(uid).update({ isAdmin: true });
}

// ── PRODUCTS APPROVAL ──────────────────────────

function nexaGetPendingProducts() {
  return db.collection('products').where('status', '==', 'pending').get()
    .then(function(snap) {
      var items = [];
      snap.forEach(function(doc) { items.push(doc.data()); });
      return items;
    });
}

function nexaApproveProduct(productId) {
  return db.collection('products').doc(productId).update({ status: 'active' });
}

function nexaRejectProduct(productId, reason) {
  return db.collection('products').doc(productId).update({
    status: 'rejected',
    rejectionReason: reason || 'Does not meet Nexabay guidelines',
  });
}

// ── SERVICES APPROVAL ─────────────────────────

function nexaGetPendingServices() {
  return db.collection('services').where('status', '==', 'pending').get()
    .then(function(snap) {
      var items = [];
      snap.forEach(function(doc) { items.push(doc.data()); });
      return items;
    });
}

function nexaApproveService(serviceId) {
  return db.collection('services').doc(serviceId).update({ status: 'active' });
}

function nexaRejectService(serviceId, reason) {
  return db.collection('services').doc(serviceId).update({
    status: 'rejected',
    rejectionReason: reason || 'Does not meet Nexabay guidelines',
  });
}

// ── GENERIC APPROVAL (for all other sections) ──

function nexaApproveListing(collection, listingId) {
  return db.collection(collection).doc(listingId).update({ status: 'active' });
}

function nexaRejectListing(collection, listingId, reason) {
  return db.collection(collection).doc(listingId).update({
    status: 'rejected',
    rejectionReason: reason || 'Does not meet Nexabay guidelines',
  });
}

function nexaGetPendingListings(collection) {
  return db.collection(collection).where('status', '==', 'pending').get()
    .then(function(snap) {
      var items = [];
      snap.forEach(function(doc) {
        var data = doc.data();
        data._collection = collection;
        items.push(data);
      });
      return items;
    });
}

// ── WITHDRAWALS ────────────────────────────────

function nexaGetPendingWithdrawals() {
  return db.collection('withdrawalRequests').where('status', '==', 'pending').get()
    .then(function(snap) {
      var items = [];
      snap.forEach(function(doc) { items.push(Object.assign({ _id: doc.id }, doc.data())); });
      items.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return items;
    });
}

function nexaMarkWithdrawalPaid(withdrawalId) {
  return db.collection('withdrawalRequests').doc(withdrawalId).update({
    status: 'paid',
    paidAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

function nexaRejectWithdrawal(withdrawalId, reason) {
  return db.collection('withdrawalRequests').doc(withdrawalId).update({
    status: 'rejected',
    rejectionReason: reason || '',
  });
}

// ── PLATFORM STATS ─────────────────────────────

function nexaGetPlatformStats() {
  return Promise.all([
    db.collection('users').get(),
    db.collection('products').where('status', '==', 'active').get(),
    db.collection('orders').get(),
    db.collection('services').where('status', '==', 'active').get(),
    db.collection('payments').get(),
    db.collection('withdrawalRequests').where('status', '==', 'pending').get(),
  ]).then(function(results) {
    var totalRevenue = 0;
    results[4].forEach(function(doc) {
      totalRevenue += (doc.data().amount || 0);
    });
    return {
      totalUsers:        results[0].size,
      totalProducts:     results[1].size,
      totalOrders:       results[2].size,
      totalServices:     results[3].size,
      totalRevenue:      totalRevenue,
      pendingWithdrawals: results[5].size,
    };
  });
}