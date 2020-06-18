import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/functions'

if (!firebase.apps.length) {
  const config = {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  }
  firebase.initializeApp(config)
}
const fireDb = firebase.firestore()
const fireDbauth = firebase.auth()
fireDbauth.useDeviceLanguage()
const providerGoogleAuthClass = new firebase.auth.GoogleAuthProvider()
const providerFacebookAuthClass = new firebase.auth.FacebookAuthProvider()
const providerPhoneAuthClass = new firebase.auth.PhoneAuthProvider()
const providerPhoneAuth = firebase.auth.PhoneAuthProvider
const providerEmailAuth = firebase.auth.EmailAuthProvider
const phoneMultiFactorGenerator = firebase.auth.PhoneMultiFactorGenerator
const storageGoogleapis = 'https://storage.googleapis.com'
const publicBucket = 'pets-lv.appspot.com'
const fireBucket = firebase.storage()
const fireBucketRef = fireBucket.ref()
const firebaseFunctions = firebase.functions()
if (process.env.NODE_ENV === 'development') {
  // firebaseFunctions.useFunctionsEmulator('http://localhost:5001')
}

export {
  fireDb,
  fireDbauth,
  providerGoogleAuthClass,
  firebase,
  providerFacebookAuthClass,
  providerPhoneAuthClass,
  providerPhoneAuth,
  providerEmailAuth,
  phoneMultiFactorGenerator,
  fireBucket,
  fireBucketRef,
  firebaseFunctions,
  storageGoogleapis,
  publicBucket
}
