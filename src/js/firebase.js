const R = require('ramda')

const firebase = require('@firebase/app').default
require('@firebase/firestore')

const config = {
  apiKey: "AIzaSyA3qeeRavSd1JKjpccNVmQqe-nEZmu6ZUM",
  authDomain: "pylos-5b63e.firebaseapp.com",
  projectId: "pylos-5b63e",
  databaseURL: "https://pylos-5b63e.firebaseio.com"
};
firebase.initializeApp(config);

const firestore = firebase.firestore()

const createGame = () => {
    const ref = firestore.collection('games').doc()
    return ref.set({ created_at: new Date() }).then(_ => ref.id)
}

const pushAction = game_id => firebaseAction => {
  const timestampedAction = {
    ...firebaseAction,
    game_id,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }
  const ref = firestore.collection('moves').doc()
  return ref.set(R.reject(R.isNil, timestampedAction)).then(_ => ref.id)
}

const connectToGame = handler => game_id => {
    const ref = firestore.collection('moves').where('game_id', '==', game_id).orderBy('timestamp')
    return ref.onSnapshot(R.pipe(
        R.prop('docs'),
        R.map(doc => doc.data()),
        handler
    ))
}

module.exports = {
    createGame,
    connectToGame,
    pushAction
}
