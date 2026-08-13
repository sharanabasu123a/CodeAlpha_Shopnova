const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Populates product details plus a denormalized name/price/image/category.
cartSchema.methods.toJSON = function () {
  return {
    _id: this._id,
    productId: this.productId,
    quantity: this.quantity,
  };
};

module.exports = mongoose.model('Cart', cartSchema);