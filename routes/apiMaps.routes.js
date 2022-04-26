const router = require('express').Router()
const Event = require('../models/Event.model')

router.get('/event/:id', (req, res) => {
    const { id } = req.params
    
    Event
        .findById(id)
        .then(event => {
            console.log('-----------HOLI HOLI----------')
            res.json(event)
        })
        .catch(err => console.log(err))
})

module.exports = router