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

exports.requestForNameChange = functions.https.onCall( async (data, context)=>{

    if(!context.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Only Authenticated User Can Make Request'
        );
    }

    const userName = data.userName;
    const uid = context.auth.uid;

    if(userName == null){
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Premature Request Has Been Sent. Execution Failed.'
        );
    }else if(/[^A-Za-z_,!\d]/.test(userName)){
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Special Characters In Your Game Name. Update Failed.'
        );
    }else if(userName.length > 20){
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Your Game Name Cannot Exceed More Than 20 Characters. Update Failed.'
        );
    }else if(userName.length == 0){
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Cannot Set Your Game Name As Empty. Update Failed.'
        );
    }

    await admin.auth().updateUser(uid,{
        displayName: userName
    });

    return admin.firestore().collection('userDetails')
    .doc(uid).update({
        playerName: userName
    });

});

exports.fetchOnlinePlayers = functions.https.onCall(async (data, context)=>{

    if(!context.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Only Authenticated User Can Make Request'
        );
    }

    const uid = context.auth.uid;
    let time = Date.now();

    await admin.firestore().collection('userDetails')
    .doc(uid).update({
        userLastSeen: time
    });

    return new Promise((resolve,reject)=>{
        admin.firestore().collection('userDetails')
        .where('userLastSeen','>=',(time-30000))
        .orderBy("userLastSeen","asc")
        .limit(20)
        .get()
        .then((snapShot)=>{
            let data = [];

            snapShot.forEach((doc)=>{
                if(doc.id != uid){
                    data.push({
                        userUID: doc.id,
                        playerName: doc.data()["playerName"]
                    });
                }
            });

            resolve(data);
        }).catch((e)=>{
            reject(e);
        });
    });
});