const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    let result = [
        { id: 1, name: '이지은' },
    ]
    res.send(result)
});

module.exports = router;