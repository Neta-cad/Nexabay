// ── NEXABAY COMMUNITY SYSTEM (Firestore) ─────

function nexaCreatePost(content, tag) {
  var user = auth.currentUser;
  if (!user) return Promise.reject(new Error('Not logged in'));

  return nexaGetUserData(user.uid).then(function(userData) {
    return db.collection('posts').add({
      authorId:   user.uid,
      authorName: userData ? userData.fullName : 'Nexabay User',
      avatar:     userData ? (userData.firstName || 'U')[0].toUpperCase() : 'U',
      role:       userData ? (userData.accountType === 'seller' ? 'Nexabay Seller' : 'Nexabay Member') : 'Member',
      content:    content,
      tag:        tag || 'general',
      likes:      0,
      comments:   0,
      shares:     0,
      createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
    });
  });
}

function nexaGetPosts(limit) {
  return db.collection('posts')
    .orderBy('createdAt', 'desc')
    .limit(limit || 20)
    .get()
    .then(function(snap) {
      var posts = [];
      snap.forEach(function(doc) {
        var data = doc.data();
        data.id = doc.id;
        data.time = 'Recently';
        data.author = data.authorName;
        posts.push(data);
      });
      return posts;
    });
}

function nexaLikePost(postId) {
  return db.collection('posts').doc(postId).update({
    likes: firebase.firestore.FieldValue.increment(1)
  });
}