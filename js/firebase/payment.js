// ── NEXABAY PAYMENT SYSTEM (Paystack) ────────────────
var PAYSTACK_PUBLIC_KEY = 'pk_test_0ff9d79c687429c4cf550662d59e3714cca29df2';

function nexaPayWithPaystack(options) {
  // options = { email, amount (in naira), name, orderId, onSuccess, onCancel }
  return new Promise(function(resolve, reject) {
    if (typeof PaystackPop === 'undefined') {
      reject(new Error('Paystack not loaded'));
      return;
    }

    var handler = PaystackPop.setup({
      key:    PAYSTACK_PUBLIC_KEY,
      email:  options.email,
      amount: options.amount * 100, // convert naira to kobo
      currency: 'NGN',
      ref:    'NXB-' + Date.now() + '-' + Math.floor(Math.random() * 99999),
      metadata: {
        custom_fields: [
          { display_name: 'Order ID',      variable_name: 'order_id',      value: options.orderId || '' },
          { display_name: 'Customer Name', variable_name: 'customer_name', value: options.name   || '' },
          { display_name: 'Platform',      variable_name: 'platform',      value: 'Nexabay'              },
        ]
      },
      callback: function(response) {
        // Payment completed — save reference to Firestore for manual verification
        nexaSavePaymentRecord(response.reference, options)
          .then(function() {
            if (options.onSuccess) options.onSuccess(response.reference);
            resolve(response.reference);
          })
          .catch(function(err) {
            console.log('Error saving payment record:', err);
            if (options.onSuccess) options.onSuccess(response.reference);
            resolve(response.reference);
          });
      },
      onClose: function() {
        if (options.onCancel) options.onCancel();
        reject(new Error('Payment cancelled'));
      }
    });

    handler.openIframe();
  });
}

function nexaSavePaymentRecord(reference, options) {
  if (typeof db === 'undefined') return Promise.resolve();

  return db.collection('payments').doc(reference).set({
    reference:    reference,
    orderId:      options.orderId    || '',
    orderType:    options.orderType  || 'product',
    amount:       options.amount,
    email:        options.email,
    customerName: options.name       || '',
    status:       'paid',
    verifiedManually: false,
    createdAt:    firebase.firestore.FieldValue.serverTimestamp(),
  });
}

function nexaGetPaymentRecord(reference) {
  return db.collection('payments').doc(reference).get()
    .then(function(doc) {
      return doc.exists ? doc.data() : null;
    });
}