import { openDB } from 'idb';

export async function exchangeDataDB() {
    const db = await openDB('exchangeDB', 1, {
        upgrade(db){
            db.createObjectStore('ex', {keyPath: 'ex'})
        }
    })
    return db
}



