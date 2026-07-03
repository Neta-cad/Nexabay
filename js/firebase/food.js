// ── NEXABAY FOOD SYSTEM ───────────────────────

function nexaAddMenuItem(itemData, imageUrl) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var itemRef = db.collection('foodItems').doc();
  var itemId  = itemRef.id;

  return itemRef.set({
    id:              itemId,
    restaurantId:    user.uid,
    restaurantName:  itemData.restaurantName || 'Restaurant',
    name:            itemData.name,
    category:        itemData.category,
    menuCategory:    itemData.menuCategory,
    description:     itemData.description,
    price:           parseFloat(itemData.price),
    customizations:  itemData.customizations || [],
    imageUrl:        imageUrl || '',
    emoji:           itemData.emoji || '🍽️',
    available:       true,
    status: 'pending',
    rating:          0,
    reviews:         0,
    orders:          0,
    prepTime:        itemData.prepTime || '20-30 mins',
    createdAt:       firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return itemId;
  });
}

function nexaGetFoodItems(category) {
  var query = db.collection('foodItems').where('status', '==', 'active');
  if (category && category !== 'all') {
    query = query.where('category', '==', category);
  }
  return query.get()
    .then(function(snap) {
      var items = [];
      snap.forEach(function(doc) {
        items.push(doc.data());
      });
      items.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return items;
    });
}

function nexaGetRestaurantItems(restaurantId) {
  return db.collection('foodItems')
    .where('restaurantId', '==', restaurantId)
    .get()
    .then(function(snap) {
      var items = [];
      snap.forEach(function(doc) {
        var data = doc.data();
        if (data.status !== 'deleted') {
          items.push(data);
        }
      });
      items.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return items;
    });
}

function nexaDeleteMenuItem(itemId) {
  return db.collection('foodItems').doc(itemId).update({ status: 'deleted' });
}

function nexaToggleItemAvailability(itemId, available) {
  return db.collection('foodItems').doc(itemId).update({ available: available });
}

// ── FOOD ORDERS ────────────────────────────────

function nexaCreateFoodOrder(orderData) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var orderRef = db.collection('foodOrders').doc();
  var orderId  = orderRef.id;

  return orderRef.set({
    id:           orderId,
    customerId:   user.uid,
    customerName: orderData.customerName || '',
    restaurantId: orderData.restaurantId,
    restaurantName: orderData.restaurantName,
    items:        orderData.items,
    total:        orderData.total,
    deliveryFee:  orderData.deliveryFee || 0,
    address:      orderData.address || '',
    status:       'pending',
    paymentRef:   orderData.paymentRef || '',
    createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return orderId;
  });
}

function nexaGetRestaurantOrders(restaurantId) {
  return db.collection('foodOrders')
    .where('restaurantId', '==', restaurantId)
    .get()
    .then(function(snap) {
      var orders = [];
      snap.forEach(function(doc) {
        orders.push(doc.data());
      });
      orders.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return orders;
    });
}

function nexaUpdateFoodOrderStatus(orderId, status) {
  return db.collection('foodOrders').doc(orderId).update({ status: status });
}