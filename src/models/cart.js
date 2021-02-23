const mongoose = require("mongoose");

const cart = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    get: (v) => v.toString(),
    ref: "User",
    required: true,
    unique: true,
  },
  cartItems: [
    {
      item: {
        type: mongoose.ObjectId,
        get: (v) => v.toString(),
        ref: "Product",
      },
      quantity: {
        type: Number,
        min: 1,
      },
      price: {
        type: Number,
        min: 0,
      },
    },
  ],
});

cart.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.cartItems.map((i) => {
      i.id = i._id.toString();
      delete i._id;
      return i;
    });
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Cart", cart);
