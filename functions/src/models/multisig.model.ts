import { initializeApp, firestore } from 'firebase-admin'
import { config } from 'firebase-functions'

initializeApp(config().firebase)

const db = firestore(),
    collection = db.collection('multisig')

export interface IMultisig {
    a: string
    d: string
    k: string[]
    m: number
    n: number
}

export async function addWallet(wallet: IMultisig) {
    const docRef = collection.doc(wallet.a)
    await docRef.set(wallet)
    return wallet
}

export async function getWallet(address: string) {
    const doc = await collection.doc(address).get()
    if (!doc.exists)
        throw Error('WALLET_NOT_EXISTS')
    else
        return doc.data()
}