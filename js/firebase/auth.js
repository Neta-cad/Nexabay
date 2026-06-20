// ── NEXABAY AUTH SYSTEM ──────────────────────

function nexaRegister(firstName, lastName, email, phone, state, password, accountType) {
  return auth.createUserWithEmailAndPassword(email, password)
    .then(function(result) {
      var user = result.user;
      return db.collection('users').doc(user.uid).set({
        uid:         user.uid,
        firstName:   firstName,
        lastName:    lastName,
        fullName:    firstName + ' ' + lastName,
        email:       email,
        phone:       phone,
        state:       state,
        accountType: accountType,
        joinedAt:    firebase.firestore.FieldValue.serverTimestamp(),
        verified:    false,
        avatar:      '',
        coins:       0,
      });
    })
    .then(function() {
      return auth.currentUser;
    });
}

function nexaLogin(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function nexaLogout() {
  return auth.signOut();
}

function nexaGetCurrentUser() {
  return auth.currentUser;
}

function nexaOnAuthChange(callback) {
  return auth.onAuthStateChanged(callback);
}

function nexaSaveUserToLocal(user, userData) {
  localStorage.setItem('nexa_current_user', JSON.stringify({
    uid:         user.uid,
    firstName:   userData.firstName,
    lastName:    userData.lastName,
    fullName:    userData.fullName,
    email:       userData.email,
    phone:       userData.phone,
    state:       userData.state,
    accountType: userData.accountType,
  }));
}

function nexaGetUserData(uid) {
  return db.collection('users').doc(uid).get()
    .then(function(doc) {
      if (doc.exists) return doc.data();
      return null;
    });
}