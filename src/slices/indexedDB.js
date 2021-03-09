import { openDB } from 'idb';

export async function exchangeDataDB() {
    const db = await openDB('exchangeDB', 1, {
        upgrade(db){
            db.createObjectStore('exchangeDB', {keyPath: 'ex'})
        },
        terminated(){
            console.log("Error with DB.")
        }
    })
    return db
}



