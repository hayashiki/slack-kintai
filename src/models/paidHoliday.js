import mongoose from 'mongoose';

const PaidHolidaySchema = new mongoose.Schema({
    user_id : { type: String, required: true },
    date : { type: Date, required: true , default: Date.now },
    hours : { type: Number, required: true, default: 8 },
    comment : { type: String  },
});

// Create new paidHoliday entry
PaidHolidaySchema.methods.create = (userId, date) => {
  try {
    const newPaidHoliday = new PaidHoliday();
    newPaidHoliday.user_id = userId
    newPaidHoliday.date = date
    newPaidHoliday.hour = 8
    return newPaidHoliday.save
  } catch (e) {
    console.log(err)
  }
};

PaidHolidaySchema.methods.show = (userId) => {
  try {
    return PaidHoliday.find({ user_id: userId },{'_id':0, 'date': 1, 'hours': 1})
  } catch (err) {
    console.log(err)
  }
};

PaidHolidaySchema.methods.delete = (userId, date) => {
  try {
    // todo delete
  } catch (err) {
    console.log(err)
  }
};

PaidHolidaySchema.index({user_id: 1, date: 1}, {unique: true});
const PaidHoliday = mongoose.model('PaidHoliday', PaidHolidaySchema);
export default PaidHoliday
