const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    rating: { type: Number, min: 1, max: 5 },
    title: String,
    comment: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true, default: 'Shop Nova' },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Fashion', 'Shoes', 'Watches', 'Gaming'],
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, required: true },
    gallery: [{ type: String }],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    numReviews: { type: Number, default: 0 },
    highlights: [{ type: String }],
    specs: [{ label: String, value: String }],
    seller: { type: String, trim: true, default: 'ShopNovaRetail' },
    offers: [{ type: String }],
    reviews: [reviewSchema],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

// default gallery to [image] if unset
productSchema.pre('save', function (next) {
  if ((!this.gallery || this.gallery.length === 0) && this.image) this.gallery = [this.image];
  next();
});

module.exports = mongoose.model('Product', productSchema);