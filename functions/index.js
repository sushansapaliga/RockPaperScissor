const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// when new user is signed in
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

// when user changes the his gama name
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
    }else if(/[^A-Za-z_,!\d\s]/.test(userName)){
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

//update the last seen time and also get online players
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

//challenage a player
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

//when user accepts the challenge
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
        players : [],
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
    constructDoc.players = [doc.data().players.host.uid, doc.data().players.receiver.uid];
    constructDoc.gameInitializedTime = time;
    constructDoc.keyPath = keyPath;

    // settting data for realtime database
    constructDocRealTimeDatabase.players = doc.data().players;
    constructDocRealTimeDatabase.lastMoveTime = constructDoc.gameInitializedTime;

    //pushing data to database
    await db.ref('gameDetails/' + keyPath ).set(constructDocRealTimeDatabase);
    await admin.firestore().collection('gameDetails').add(constructDoc);

    return admin.firestore().collection('requestDetails').doc(docID)
    .update({
        gameStatus: 'accepted'
    });

});

// get the game details
exports.getGameDetails = functions.https.onCall(async (data, context)=>{

    if(!context.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Only Authenticated User Can Make Request'
        );
    }

    const time = Date.now();
    const playerUID = context.auth.uid;
    const doc = await admin.firestore().collection('gameDetails').where('gameInitializedTime','>=', time-30000)
                                                                .where('players', 'array-contains', playerUID)
                                                                .where('status','==','open')
                                                                .orderBy('gameInitializedTime', 'desc')
                                                                .limit(1)
                                                                .get();

    let dataToSendBack = {
        keyPath: '',
        docID: ''
    }

    let count = 0;

    doc.forEach( async (snapShot)=>{

        dataToSendBack.keyPath = snapShot.data()['keyPath'];
        dataToSendBack.docID = snapShot.id;
        count++;

        let joinedPlayersArr = snapShot.data()['joinedPlayers'];
        let status = 'open';

        if(joinedPlayersArr.indexOf(playerUID) == -1){
            joinedPlayersArr.push(playerUID);
        }

        if(joinedPlayersArr.length == 2){
            status = 'playing';
        }

        await admin.firestore().collection('gameDetails').doc(snapShot.id).update({
            joinedPlayers: joinedPlayersArr,
            status: status
        });
    });

    // check if the user has already joined the game or not
    if(count == 0){
        throw new functions.https.HttpsError(
            'permission-denied',
            'You Have No Game Challenges.'
        );
    }

    return new Promise((resolve, reject)=>{
        resolve(dataToSendBack);
    });
});