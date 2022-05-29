import mongoose from 'mongoose';

const { Schema } = mongoose;

const templateSchema = new Schema({
  userId: { type: String, required: [true] },
  name: { type: String, required: [true] },
  description: { type: String },
  createdTime: { type: Number, required: [true] },
  widgets: { type: Array, default: [] },
});

// Convertir a Modelo.
const Template = mongoose.model('Template', templateSchema);

export default Template;
