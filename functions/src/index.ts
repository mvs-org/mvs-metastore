import * as functions from 'firebase-functions'
import * as express from 'express'
import { checkError } from './libraries/helpers'
import { addWallet, getWallet } from './models/multisig.model'
import { SuccessMessage, ErrorMessage } from './models/message.model'
import * as bodyParser from 'body-parser'
import { cors } from './config/config'
const Metaverse = require('metaversejs')

const app = express()

app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", cors.origin)
    res.header("Access-Control-Allow-Headers", cors.headers)
    res.header('Access-Control-Allow-Methods', cors.methods)
    if (req.method === 'OPTIONS')
        res.end()
    else
        next()
})

//Enable body parsing
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

const router = express.Router()

router.post('/', (req, res) => {
    const description = req.body.d
    const pubkeys = req.body.k
    const min = req.body.m
    const number = req.body.n

    checkError(pubkeys && (Array.isArray(pubkeys) && pubkeys.length > 1), 'Invalid public keys list')
        .then(() => Promise.all([
            checkError((min <= number), 'Minimum sign number is not allowed to be higher than the total number of keys'),
            checkError((min >= 1), 'Minimum sign number invalid'),
            checkError((number >= 1 && pubkeys.length === number), 'Number of keys invalid')
        ]))
        .then(() => Metaverse.multisig.generate(min, pubkeys))
        .then((msig: { address: string }) => addWallet({
            d: description,
            k: pubkeys,
            m: min,
            n: number,
            a: msig.address
        }))
        .then((wallet) => {
            console.info(`created new wallet with address ${wallet.a}`)
            res.status(200).json(SuccessMessage(wallet, "NEW"))
        })
        .catch((error) => {
            console.log(error)
            switch (error.code) {
                case 11000:
                    res.status(200).json(SuccessMessage(undefined, "DUPLICATE"))
                    break
                default:
                    console.error(error)
                    res.status(400).json(ErrorMessage('Error storing wallet'))
            }
        })


})

router.get('/:address', (req, res) => {
    const address = req.params.address
    console.info(`lookup request for address ${address}`)
    getWallet(address)
        .then((wallet) => {
            res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
            res.status(200).json(SuccessMessage(wallet))
        })
        .catch((error) => {
            console.error(error)
            res.status(400).json(ErrorMessage(error.message))
        })
})

app.use(router)

function App(req: any, res: any) {
    console.log(req.url)
    if (!req.url || req.url[0] !== '/') {
        req.url = '/' + req.url
    }
    return app(req, res)
}

export const multisig = functions.region('asia-northeast1').https.onRequest(App)
