// ── NEXABAY PRODUCTS SYSTEM ──────────────────

function nexaAddProduct(productData, imageUrl) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var productRef = db.collection('products').doc();
  var productId  = productRef.id;

  return productRef.set({
    id:          productId,
    sellerId:    user.uid,
    sellerName:  productData.sellerName || 'Seller',
    name:        productData.name,
    category:    productData.category,
    description: productData.description,
    price:       parseFloat(productData.price),
    oldPrice:    parseFloat(productData.oldPrice) || parseFloat(productData.price),
    stock:       parseInt(productData.stock),
    location:    productData.location,
    condition:   productData.condition,
    shipsTo:     productData.shipsTo || 'nationwide',
    negotiable:  productData.negotiable || false,
    imageUrl:    imageUrl || '',
    emoji:       productData.emoji || '📦',
    status:      'active',
    rating:      0,
    reviews:     0,
    sold:        0,
    createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return productId;
  });
}

function nexaGetProducts(category, limit) {
  var query = db.collection('products').where('status', '==', 'active');
  if (category && category !== 'all') {
    query = query.where('category', '==', category);
  }
  return query.get()
    .then(function(snap) {
      var products = [];
      snap.forEach(function(doc) {
        products.push(doc.data());
      });
      products.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      if (limit) products = products.slice(0, limit);
      return products;
    });
}

function nexaGetSellerProducts(sellerId) {
  return db.collection('products')
    .where('sellerId', '==', sellerId)
    .get()
    .then(function(snap) {
      var products = [];
      snap.forEach(function(doc) {
        var data = doc.data();
        if (data.status !== 'deleted') {
          products.push(data);
        }
      });
      products.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return products;
    });
}

function nexaDeleteProduct(productId) {
  return db.collection('products').doc(productId).update({ status: 'deleted' });
}