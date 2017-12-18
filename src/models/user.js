import mongoose from 'mongoose';

const UserSchema   = new mongoose.Schema({
    user_id : { type: String, required: true, unique: true },
});

UserSchema.methods.find_or_create_by = (userId) => {
  try {
    if (User.find({ user_id: userId })) {
      console.info("find user")
    } else {
      console.info("create user")
      const newUser = new User();
      newUser.user_id =  user.id;
      newUser.save();
    }
    // return PaidHoliday.find({ user_id: userId },{'_id':0, 'date': 1, 'hours': 1})
  } catch (err) {
    console.log(err)
  }
};

const User = mongoose.model('User', UserSchema);
export default User
