// ── NEXABAY ORDERS SYSTEM ────────────────────

function nexaCreateOrder(items, deliveryInfo, paymentMethod, deliveryFee) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var subtotal = items.reduce(function(s, i) {
    return s + i.price * (i.qty || 1);
  }, 0);
  var total = subtotal + (deliveryFee || 0);
  var orderId = 'NXB' + Date.now().toString().slice(-8).toUpperCase();

  return db.collection('orders').doc(orderId).set({
    id:            orderId,
    buyerId:       user.uid,
    items:         items,
    delivery:      deliveryInfo,
    paymentMethod: paymentMethod,
    deliveryFee:   deliveryFee || 0,
    subtotal:      subtotal,
    total:         total,
    status:        'confirmed',
    createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return orderId;
  });
}

function nexaGetBuyerOrders(buyerId) {
  return db.collection('orders')
    .where('buyerId', '==', buyerId)
    .orderBy('createdAt', 'desc')
    .get()
    .then(function(snap) {
      var orders = [];
      snap.forEach(function(doc) {
        orders.push(doc.data());
      });
      return orders;
    });
}

function nexaUpdateOrderStatus(orderId, status) {
  return db.collection('orders').doc(orderId).update({ status: status });
}