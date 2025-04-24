const { db } = require('../firebase/config');
const { collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where } = require('firebase/firestore');

const playersCollection = collection(db, 'players');

class Player {
    static async getAll() {
        const snapshot = await getDocs(playersCollection);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    static async getById(id) {
        const playerDoc = await getDoc(doc(db, 'players', id));
        if (!playerDoc.exists()) {
            return null;
        }
        return {
            id: playerDoc.id,
            ...playerDoc.data()
        };
    }

    static async create(playerData) {
        const result = await addDoc(playersCollection, {
            name: playerData.name,
            rating: parseInt(playerData.rating) || 1500,
            email: playerData.email,
            phone: playerData.phone,
            createdAt: new Date().toISOString()
        });
        return result.id;
    }

    static async update(id, playerData) {
        const playerRef = doc(db, 'players', id);
        await updateDoc(playerRef, {
            name: playerData.name,
            rating: parseInt(playerData.rating) || 1500,
            email: playerData.email,
            phone: playerData.phone,
            updatedAt: new Date().toISOString()
        });
        return id;
    }

    static async delete(id) {
        await deleteDoc(doc(db, 'players', id));
        return id;
    }
}

module.exports = Player;