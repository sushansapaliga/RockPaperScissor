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

exports.invitePlayerToGame = functions.https.onCall(async (data, context)=>{

    if(!context.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Only Authenticated User Can Make Request'
        );
    }

    const hostUID = context.auth.uid;
    const receiverUID = data.userUID;

    if(!(typeof receiverUID === 'string')){
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Input To The Function Must Be String. Request Failed.'
        );
    }

    let constructDoc = {
        gameStatus: 'waiting',
        players: {
            host: {
                name: '',
                uid: hostUID
            },
            receiver: {
                name: '',
                uid: receiverUID
            }
        },
        requestGameTime: 1
    }

    // related to receiver
    const receiverDetails = await admin.firestore().collection('userDetails').doc(receiverUID).get();

    if(!receiverDetails.exists){
        throw new functions.https.HttpsError(
            'aborted',
            'Invalid Player UID. Request Failed.'
        );
    }
        
    constructDoc.players.receiver.name = receiverDetails.data().playerName;

    //related to host
    const hostDetails = await admin.firestore().collection('userDetails').doc(hostUID).get();

    if(!hostDetails.exists){
        throw new functions.https.HttpsError(
            'aborted',
            'Invalid Player UID. Request Failed.'
        );
    }
    
    constructDoc.players.host.name = hostDetails.data().playerName;

    // time
    constructDoc.requestGameTime = Date.now();

    // add doc
    let doc = await admin.firestore().collection('requestDetails').add(constructDoc);

    return new Promise((resolve, reject)=>{
        resolve(doc.id);
    });

});

exports.acceptTheChallenge = functions.https.onCall(async (data, context)=>{

    if(!context.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Only Authenticated User Can Make Request'
        );
    }

    const docID = data.docID;
    const receiverUID = context.auth.uid;

    let constructDoc = {
        status: 'open',
        players : {
            host: {
                playerName: '',
                uid: '',
            },
            receiver:{
                playerName: '',
                uid: receiverUID
            }
        },
        joinedPlayers: [],
        gameInitializedTime: 1,
        keyPath: 'add-later'
    }

    let constructDocRealTimeDatabase = {
        lastMoveTime: 1,
        players : {
            host: {
                playerName: '',
                uid: '',
            },
            receiver:{
                playerName: '',
                uid: receiverUID
            }
        }
    }

    const doc = await admin.firestore().collection('requestDetails').doc(docID).get();
    let time = Date.now();

    if(!doc.exists){
        throw new functions.https.HttpsError(
            'aborted',
            'Invalid Input. Challenge Denied.'
        );
    }

    if( doc.data().requestGameTime + 25000 < time){
        throw new functions.https.HttpsError(
            'deadline-exceeded',
            'The Challenge Has Expired. Challenge Denied.'
        );
    }

    // setting up with admin realtime database 
    const db = admin.database();
    var keyPath = (await db.ref('gameDetails').push()).key;

    // setting things for firebase store
    constructDoc.players = doc.data().players;
    constructDoc.gameInitializedTime = time;
    constructDoc.keyPath = keyPath;

    // settting data for realtime database
    constructDocRealTimeDatabase.players = constructDoc.players;
    constructDocRealTimeDatabase.lastMoveTime = constructDoc.gameInitializedTime;

    await db.ref('gameDetails/' + keyPath ).set(constructDocRealTimeDatabase);
    await admin.firestore().collection('gameDetails').add(constructDoc);

    return admin.firestore().collection('requestDetails').doc(docID)
    .update({
        gameStatus: 'accepted'
    });

});
