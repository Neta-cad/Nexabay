// ── IMGBB IMAGE UPLOAD ───────────────────────
var IMGBB_API_KEY = '1537dc1c070accc85047cd153e45bc63';

function uploadImageToImgBB(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() {
      var base64Image = reader.result.split(',')[1];
      var formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', base64Image);

      fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.success) {
            resolve(data.data.url);
          } else {
            reject(new Error('Image upload failed'));
          }
        })
        .catch(reject);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}