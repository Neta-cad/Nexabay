// ── NEXABAY EVENTS SYSTEM ─────────────────────

function nexaAddEvent(eventData, imageUrl) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var eventRef = db.collection('events').doc();
  var eventId  = eventRef.id;

  return eventRef.set({
    id:            eventId,
    organizerId:   user.uid,
    organizerName: eventData.organizerName || 'Organizer',
    title:         eventData.title,
    category:      eventData.category,
    description:   eventData.description,
    eventType:     eventData.eventType || 'physical',
    date:          eventData.date,
    time:          eventData.time,
    endTime:       eventData.endTime || '',
    venue:         eventData.venue || '',
    address:       eventData.address || '',
    onlineLink:    eventData.onlineLink || '',
    location:      eventData.location,
    ticketTiers:   eventData.ticketTiers || [],
    imageUrl:      imageUrl || '',
    emoji:         eventData.emoji || '🎉',
    status: 'pending',
    totalTickets:  eventData.totalTickets || 0,
    soldTickets:   0,
    rating:        0,
    reviews:       0,
    createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return eventId;
  });
}

function nexaGetEvents(category) {
  var query = db.collection('events').where('status', '==', 'active');
  if (category && category !== 'all') {
    query = query.where('category', '==', category);
  }
  return query.get()
    .then(function(snap) {
      var events = [];
      snap.forEach(function(doc) {
        events.push(doc.data());
      });
      events.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return events;
    });
}

function nexaGetOrganizerEvents(organizerId) {
  return db.collection('events')
    .where('organizerId', '==', organizerId)
    .get()
    .then(function(snap) {
      var events = [];
      snap.forEach(function(doc) {
        var data = doc.data();
        if (data.status !== 'deleted') {
          events.push(data);
        }
      });
      events.sort(function(a, b) {
        var aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        var bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      return events;
    });
}

function nexaDeleteEvent(eventId) {
  return db.collection('events').doc(eventId).update({ status: 'deleted' });
}

// ── TICKET PURCHASES ───────────────────────────

function nexaBuyTicket(eventId, ticketData) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  var ticketRef = db.collection('tickets').doc();
  var ticketId  = ticketRef.id;

  return ticketRef.set({
    id:           ticketId,
    eventId:      eventId,
    buyerId:      user.uid,
    buyerName:    ticketData.buyerName || '',
    buyerEmail:   ticketData.buyerEmail || '',
    buyerPhone:   ticketData.buyerPhone || '',
    tierName:     ticketData.tierName || 'General',
    price:        ticketData.price || 0,
    quantity:     ticketData.quantity || 1,
    totalPaid:    (ticketData.price || 0) * (ticketData.quantity || 1),
    paymentRef:   ticketData.paymentRef || '',
    status:       'confirmed',
    checkedIn:    false,
    purchasedAt:  firebase.firestore.FieldValue.serverTimestamp(),
  }).then(function() {
    return db.collection('events').doc(eventId).update({
      soldTickets: firebase.firestore.FieldValue.increment(ticketData.quantity || 1)
    });
  }).then(function() {
    return ticketId;
  });
}

function nexaGetEventTickets(eventId) {
  return db.collection('tickets')
    .where('eventId', '==', eventId)
    .get()
    .then(function(snap) {
      var tickets = [];
      snap.forEach(function(doc) {
        tickets.push(doc.data());
      });
      tickets.sort(function(a, b) {
        var aTime = a.purchasedAt ? a.purchasedAt.toMillis() : 0;
        var bTime = b.purchasedAt ? b.purchasedAt.toMillis() : 0;
        return bTime - aTime;
      });
      return tickets;
    });
}

function nexaGetMyTickets(buyerId) {
  return db.collection('tickets')
    .where('buyerId', '==', buyerId)
    .get()
    .then(function(snap) {
      var tickets = [];
      snap.forEach(function(doc) {
        tickets.push(doc.data());
      });
      return tickets;
    });
}