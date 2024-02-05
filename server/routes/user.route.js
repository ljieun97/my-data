//file
const config = require('../config.json')
const UserManager = require('../managers/user.manager')

//package
const express = require('express')
const router = express.Router()
const axios = require('axios')

const GOOGLE_CLIENT_ID = config.google.client_id
const GOOGLE_CLIENT_SECRET = config.google.client_pass
const GOOGLE_LOGIN_REDIRECT_URI  = 'http://localhost:3000/user/login/redirect'
const GOOGLE_SIGNUP_REDIRECT_URI = 'http://localhost:3000/user/signup/redirect'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

router.get('/', (req, res) => {
    res.send(`
        <h1>OAuth</h1>
        <a href="/user/login">Log in</a>
        <a href="/user/signup">Sign up</a>
    `)
})

router.get('/login', (req, res) => {
    let url = 'https://accounts.google.com/o/oauth2/v2/auth'
    url += `?client_id=${GOOGLE_CLIENT_ID}`
    url += `&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}`
    url += '&response_type=code'
    url += '&scope=email profile'    
	res.redirect(url)
})

router.get('/login/redirect', (req, res) => {
    const { code } = req.query
    console.log(`code: ${code}`)

    //todo: token db 저장
    res.send('ok')
})

router.get('/signup', (req, res) => {
    let url = 'https://accounts.google.com/o/oauth2/v2/auth'
    url += `?client_id=${GOOGLE_CLIENT_ID}`
    url += `&redirect_uri=${GOOGLE_SIGNUP_REDIRECT_URI}`
    url += '&response_type=code'
    url += '&scope=email profile'    
    res.redirect(url)
})

router.get('/signup/redirect', async (req, res) => {
    const { code } = req.query
    console.log(`code: ${code}`)

    const auth = await axios.post(GOOGLE_TOKEN_URL, {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_SIGNUP_REDIRECT_URI,
        grant_type: 'authorization_code',
    });

    const info = await axios.get(GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${auth.data.access_token}`,
        }
    })

    //todo: user db 저장
    UserManager.createUser(info.data)
    .then(result => {
        console.log('회원가입이 완료되었습니다.')
        res.json("회원가입이 완료되었습니다.")
        // res.status(200).send(result)
    })
    .catch(() => {
        res.json("회원가입 도중 장애가 발생했습니다.")
        // res.status(500).json({
        //     message : "회원가입 도중 장애가 발생했습니다."
        // })
    })
    
    // res.json(info.data)
})

module.exports = router