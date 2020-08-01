# Rock, Paper and Scissor
 <p align="center">
    <img src="public/images/titlePic.png" width="280">
 </p>
 
 Click here to [**Play**](https://rockpaperscissor-8f634.firebaseapp.com/)
 
## Contents
1. [Get started](#get-started).
2. [Database Structure](#database-structure).
3. [Database Rules](#database-rules).
4. [Mentions](#mentions).

## Get Started
- **Pre-requirement**:
  - Node.js [version 10 or above].
  - VS Code [Optional]
  - Firebase Project has to be switch to Blaze Plan, as Firebase Function running in node.js 10 environment needs blaze plan. [Tip: Set the budget to 1 rupee]
  
- **Set up Firebase**:
  - Create a Project in Firebase. If you haven't, create it here: [Firebase Console](https://console.firebase.google.com/).
  - Install firebase on your local system.
  
  ```
  npm install -g firebase-tools
  ```
  - Login into your google account.
  ```
  firebase login
  ```
  
- **Download the repository**:
  - Download the git repository for github or github desktop.
  - Unzip the folder where you want it to be placed. 
  
- **Set up Firebase in Project**:
  - Initialize the firebase in the unzipped folder.
  ```
  firebase init
  ```
  - Select the firebase cli features : `Functions and Hosting`
  - Select `Use an existing project` and then from the list, the project you want it connect to.
  - Select `JavaScript` as a language for Firebase Functions.
  - In later steps, `Yes` for all except in `Hosting Setup` for `Configure as a single-page app (rewrite all urls to /index.html)?`, select `No`.
  
- **Testing**:
  - To test locally on your system. You have deploy functions. 
  ```
  firebase deploy --only functions
  ```
  Once functions are deployed, you can test the website locally by hosting locally on your system.
  ```
  firebase serve
  ```
  Open in your browser: http://localhost:5000/
  
- **Deploy Project**:
  - Deploy the firebase functions and website to firebase hosting.
  ```
  firebase deploy
  ```
  - **Wala! You are GOOD to go!**
  
  
## Database Structure

- **Firestore**:
   - userDetails
      - playerName
      - userLastSeen
   - requestDetails
      - gameStatus
      - requestGameTime
      - players
         - host
            - name
            - uid
         - receiver
            - name
            - uid
   - gameDetails
      - gameInitializedTime
      - status
      - joinedPlayers: []
      - players: [ hostuid, receiveruid ]
      - keyPath 
      
- **Realtime Database**
   - root
      - gameDetails
         - lastMoveTime
         - players
            - host
               - uid
               - name
            - receiver
               - uid 
               - name
         - move
            - 1 
               - host: "SOMEMOVE"
               - receiver: "SOMEMOVE"
            - 2 
               - host: "SOMEMOVE"
               - receiver: "SOMEMOVE"
            - and so on
            
## Database Rules
 
 - Firestore rules can be found in file name: `firestoreRules.txt`.
 - Realtime Database rules can be found in file name: `realtimeDatabaseRules.txt`.
 
## Mentions

- FrontEnd Inspiration: [Link](https://manavendrasen.github.io/rock-paper-scissors/)
- Toggle button: [Link](https://www.w3schools.com/howto/howto_css_switch.asp)
- Loading spinner: [Link](https://tobiasahlin.com/spinkit/)
 
 
               
