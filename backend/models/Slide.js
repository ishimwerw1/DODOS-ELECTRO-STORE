import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String,
    default: ''   // separate wide banner image (different from product image)
  },
  badge: {
    type: String,
    default: 'NEW ARRIVAL'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Slide = mongoose.model('Slide', slideSchema);
export default Slide;