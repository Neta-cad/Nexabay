// js/firebase/support.js
// Handles saving escalated support chats to Firestore

function saveSupportTicket(userId, question, aiAnswer, category) {
  const db = firebase.firestore();

  return db.collection('support_tickets').add({
    userId: userId || 'guest',
    question: question,
    aiAnswer: aiAnswer,
    category: category || 'general',
    status: 'open',
    adminReply: '',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    resolvedAt: null
  }).then((docRef) => {
    console.log('Support ticket saved:', docRef.id);
    return docRef.id;
  }).catch((error) => {
    console.error('Error saving support ticket:', error);
    throw error;
  });
}

function listenToMyTickets(userId, callback) {
  const db = firebase.firestore();

  return db.collection('support_tickets')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      const tickets = [];
      snapshot.forEach((doc) => {
        tickets.push({ id: doc.id, ...doc.data() });
      });
      callback(tickets);
    });
}