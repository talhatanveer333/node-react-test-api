const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');

const add = async (req, res) => {
   try {
        const result = new MeetingHistory(req.body);
        await result.save();
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to create :', err);
        res.status(400).json({ err, error: 'Failed to create' });
    }
}

const index = async (req, res) => {
    try {
        const query = req.query
        let allData = await MeetingHistory.find(query).populate({
            path: 'createBy'
        }).populate({
            path: 'attendes',
        }).exec()

        res.send(allData)
    } catch (err) {
            console.error('Failed to fetch data:', err);
            res.status(400).json({ error: 'Failed to fetch data' });
        }
}

const view = async (req, res) => {
    try {
        const { id } = req.params
        let meetingHistory = await MeetingHistory.findOne({ _id: id }).populate({
            path: 'createBy',
            match: { deleted: false }
        }).populate({
            path: 'attendes',
        }).exec()

        // if (!meetingHistory) return res.status(404).json({ message: "no Data Found." })
        res.status(200).json({ meetingHistory })
    } catch (err) {
        console.error('Failed to view data:', err);
        res.status(400).json({ error: 'Failed to view data' });
    }
}

const deleteData = async (req, res) => {
  try {
        const meetingHistory = await MeetingHistory.findByIdAndUpdate(req.params.id, { deleted: true });
        res.status(200).json({ message: "done", meetingHistory })
    } catch (err) {
        res.status(404).json({ message: "error", err })
    }
}

const deleteMany = async (req, res) => {
    try {
        const meetingHistories = await MeetingHistory.updateMany({ _id: { $in: req.body } }, { $set: { deleted: true } });
        res.status(200).json({ message: "done", meetingHistories })
    } catch (err) {
        res.status(404).json({ message: "error", err })
    }
}

module.exports = { add, index, view, deleteData, deleteMany }