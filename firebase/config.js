const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
    // apiKey: "YOUR_API_KEY",
    // authDomain: "your-app.firebaseapp.com",
    // projectId: "your-project-id",
    // storageBucket: "your-app.appspot.com",
    // messagingSenderId: "your-sender-id",
    // appId: "your-app-id"
    apiKey: "AIzaSyArSALy7X3BSeY15O2ByE4ydfAv7kqItUw",
    authDomain: "campeonato-xadrez.firebaseapp.com",
    databaseURL: "https://campeonato-xadrez-default-rtdb.firebaseio.com",
    projectId: "campeonato-xadrez",
    storageBucket: "campeonato-xadrez.firebasestorage.app",
    messagingSenderId: "859281317018",
    appId: "1:859281317018:web:d6170dd8aa7b187fa59323",
    measurementId: "G-GHQ7YY7J8W"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };