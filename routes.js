const router = require('express').Router();

responseMessage = (keys, values) => {
    try {
        let response = {};
        for(let i = 0; i < keys.length; ++i) {
            let key = keys[i];
            response[key] = values[i];
        }
        return response;
    } catch (err) {
        console.log(err.stack);
    }
}

router.get('/', (req, res) => {
    res.json(responseMessage(['status', 'msg'], ['1', 'Funfou!']));
});


module.exports = router;