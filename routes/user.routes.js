const router = require("express").Router()
const bcrypt = require('bcryptjs')
const SpotifyWebApi = require("spotify-web-api-node")
const User = require('./../models/User.model')
const fileUploader = require("./../config/cloudinary.config")
const { isLoggedIn, checkRole } = require("../middleware/checkRole")


const saltRounds = 10

// ######################## ESTO DEBERÍA IR EN APP.JS PERO SI NO NO FUNCIONA ########################################################
// ######################## ADEMÁS NECESITO QUE TODO EL RESTO DE RUTAS TENGAN ACCESO TB #############################################

// Setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
})

// Retrieve an access token
spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error))

// ######################################################################################################################################
// ######################################################################################################################################


// ----------> ARTIST ROUTES <----------


router.get("/artist/:id", (req, res, next) => {

    const { id } = req.params

    // const isAdmin = req.session.currentUser.role === 'ADMIN'
    // const isArtist = req.session.currentUser.role === 'ARTIST'

    // res.render('profile/artist-profile')
    spotifyApi
        .getArtist(id)
        .then((artist) => {
            console.log(artist)
            res.render('profile/artist-profile', artist)
        })
        .catch(err => next(err))

})

router.get("/artist/:id/edit", (req, res, next) => {

    // const isAdmin = req.session.currentUser.role === 'ADMIN'
    // const isArtist = req.session.currentUser.role === 'ARTIST'

    const { id } = req.params

    User
        .findByIdAndUpdate(id)
        .then(artist => {
            res.render('profile/artist-edit', artist)
        })
        .catch(err => next(err))


})

router.post("/artist/:id/edit", (req, res, next) => {

    const { id } = req.params
    const { name, image } = req.body

    User
        .findByIdAndUpdate(id, { name, image })
        .then(artist => {
            res.redirect('/')
        })
        .catch(err => next(err))

})


// ----------> USER ROUTES <----------


router.get("/user/:id", isLoggedIn, (req, res, next) => {

    const { id } = req.params
    console.log(id)

    const isAdmin = req.session.currentUser.role === 'ADMIN'
    const isUser = req.session.currentUser.role === 'USER'



    User
        .findById(id)
        .then(user => {
            console.log(user)
            res.render('profile/user-profile', user, isAdmin, isUser)
        })
        .catch(err => next(err))

})


router.get("/user/:id/edit", isLoggedIn, (req, res, next) => {


    const { id } = req.params

    const isAdmin = req.session.currentUser.role === 'ADMIN'
    const isUser = req.session.currentUser.role === 'USER'

    User
        .findByIdAndUpdate(id)
        .then(user => {
            res.render('profile/user-edit', user, isAdmin, isUser)
        })
        .catch(err => next(err))


})

router.post("/user/:id/edit", (req, res, next) => {

    const { id } = req.params
    const { name, lastname, image, favoriteGenres } = req.body

    User
        .findByIdAndUpdate(id, { name, lastname, image, favoriteGenres })
        .then(user => {
            console.log(id)
            res.redirect('/')
        })
        .catch(err => next(err))

})

router.post("/user/:id/delete", (req, res, next) => {

    const { id } = req.params

    User
        .findByIdAndDelete(id)
        .then(user => {
            res.redirect('/')
        })
        .catch(err => next(err))



})



// ----------> USER: choose favorite genres <----------


router.get("/signin-user/musicGenres", (req, res) => {

    spotifyApi
        .getAvailableGenreSeeds()
        .then(({ body: { genres } }) => {
            res.render('user/completeProfile', { genres })
        })
        .catch(err => next(err))
})

router.post("/signin-user/musicGenres", (req, res, next) => {
    const { favoriteGenres } = req.body
    const id = req.session.currentUser._id

    User
        .findByIdAndUpdate(id, { favoriteGenres })
        .then(res.redirect('/'))
        .catch(err => next(err))
})


module.exports = router
