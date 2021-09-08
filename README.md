# Smarty Tag Android App

## Stack: 
React Native + Typescript + RxJS</br>
Database: Firestore</br>
Notifications: Cloud functions + Firebase Messaging</br>
Design Framework: UI-Kittens</br>

Link to firebase projet: https://console.firebase.google.com/u/0/project/smarty-tag/overview

## Known issues:

### Build

Build of signed APKs sometimes fail because of not enough allocated memory,</br>
see here: https://jqn.medium.com/learn-to-fix-react-native-jvm-heap-space-is-exhausted-9d8e19ed0d16 for the solution

### Components are re-render making a component state very unstable
The USB library makes reading tags very expensive on the memory and forces to re-render component.</br> 
If you want state to persist one should keep the state that he wants persistant in the dedicated services (FirebaseService or USBService)</br> instead of in the component.


