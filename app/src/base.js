import Rebase from 're-base'
import firebase from 'firebase'

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyC3V78MLFGnyxxLI2X11lvpC4IoRjCef5Y",
  authDomain: "bot-o-mat.firebaseapp.com",
  databaseURL: "https://bot-o-mat.firebaseio.com",
});

const base = Rebase.createClass(firebaseApp.database());

export { firebaseApp };

export default base;