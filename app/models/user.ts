import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  name: String,
  address: String,
  index: String
});

export default model('User', UserSchema);