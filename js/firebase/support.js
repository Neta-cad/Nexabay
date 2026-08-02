// js/firebase/support.js
// Handles two-way conversational support tickets

function saveSupportTicket(userId, question, aiAnswer, category) {
  var db = firebase.firestore();

  return db.collection('support_tickets').add({
    userId: userId || 'guest',
    category: category || 'general',
    status: 'open',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    resolvedAt: null,
    messages: [
      { sender: 'customer', text: question, ts: Date.now() },
      { sender: 'ai', text: aiAnswer, ts: Date.now() }
    ]
  }).then(function(docRef) {
    return docRef.id;
  });
}

function appendTicketMessage(ticketId, sender, text) {
  var db = firebase.firestore();
  var updates = {
    messages: firebase.firestore.FieldValue.arrayUnion({
      sender: sender, text: text, ts: Date.now()
    })
  };
  if (sender === 'customer') {
    updates.status = 'open'; // reopen if it was resolved
  }
  return db.collection('support_tickets').doc(ticketId).update(updates);
}

function listenToTicket(ticketId, callback) {
  var db = firebase.firestore();
  return db.collection('support_tickets').doc(ticketId)
    .onSnapshot(function(doc) {
      if (doc.exists) callback(Object.assign({ id: doc.id }, doc.data()));
    });
}