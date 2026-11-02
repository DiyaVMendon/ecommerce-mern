import Cart from "../models/Cart.js";

export const addToCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity: 1 }],
      });
    } else {
      const item = cart.items.find((i) => i.productId?.toString() === productId);
      if (item) {
        item.quantity += 1;
      } else {
        cart.items.push({ productId, quantity:1 });
      }
    }

    await cart.save();
    res.status(200).json({
      message: "Data retrieved",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error",
    });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
     return res.status(400).json({
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (i) => i.productId?.toString() !== productId,
    );
    await cart.save();

    res.status(200).json({
      mesaage: "Cart found",
      data: cart,
    });
  } catch (error) {
    res.json({
      message: "Unexpected error",
    });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      res.status(400).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.find((i) => i.productId.toString() === productId);

    item.quantity = quantity;
    await cart.save();
    res.status(200).json({
      message: "Cart updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error",
    });
  }
};


export const getCart = async (req,res)=>{
    try {
        const {userId}=req.query;

        const cart = await Cart.findOne({userId}).populate('items.productId');

        res.json({data:cart})
    } catch (error) {
         res.status(500).json({
      message: "Unexpected error",
    });
    }
}
