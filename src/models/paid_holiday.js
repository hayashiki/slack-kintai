const mongoose     = require('mongoose');
const Schema       = mongoose.Schema;

const PaidHolidaySchema   = new Schema({
    user_id : { type: String, required: true },
    date : { type: Date, required: true , default: Date.now },
    // hours : { type: Number, required: true },
    // comment : { type: String  },
});

module.exports = mongoose.model('PaidHoliday', PaidHolidaySchema);
