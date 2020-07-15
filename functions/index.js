const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.newUserIsSignedUp = functions.auth.user().onCreate( async (user)=>{
    
    var uid = user.uid;
    var userInitialName = "Mr Robot";

    await admin.auth().updateUser(uid, {
        displayName: userInitialName
    });

    let time = Date.now();

    return admin.firestore().collection('userDetails')
    .doc(uid).set({
        userLastSeen: time,
        playerName: userInitialName
    });

});