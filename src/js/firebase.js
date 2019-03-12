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

const insertMove = ([h,i,j], player, removals = []) => game_id => pushMove({
    game_id,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    type: 'insert',
    insert: {
        player,
        position: { h, i, j }
    },
    removals: removals.map(([h,i,j]) => ({h, i, j}))
})

const liftMove = ([fromH,fromI,fromJ], [toH, toI, toJ], removals = []) => game_id => pushMove({
    game_id,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    type: 'lift',
    lift: {
        from: { h: fromH, i: fromI, j: fromJ },
        to: { h: toH, i: toI, j: toJ }
    },
    removals: removals.map(([h,i,j]) => ({h, i, j}))
})

const pushMove = move => {
    const ref = firestore.collection('moves').doc()
    return ref.set(R.reject(R.isNil, move)).then(_ => ref.id)
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
    insertMove,
    liftMove,
    connectToGame
}
