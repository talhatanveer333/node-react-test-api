const express = require('express');
const meetingHistory = require('./meeting');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.get('/', auth, meetingHistory.index)
router.post('/add', auth, meetingHistory.add)
router.get('/view/:id', auth, meetingHistory.view)
router.delete('/delete/:id', auth, meetingHistory.deleteData)
router.post('/deleteMany', auth, meetingHistory.deleteMany)

module.exports = router