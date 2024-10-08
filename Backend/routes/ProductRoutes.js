const Product  = require("../models/ProductsModelDB");
const Feedback = require("../models/FeedbackModelDB")
const User = require("../models/UserModelDB")
const mongoose = require('mongoose');
const upload = require("../middleware/upload");

// const ProductsController = require("../controllers/ProductControllerDB");

// auth -> authorization
const auth = require("../middleware/AuthMWPermission");

const express = require('express');
const router = express.Router();

const jwt = require("jsonwebtoken");

// getAllProductsCategories
router.get("/categories", async (req, res) => {
  try {
    // Get distinct category values using Mongoose aggregate
    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category", // Group by the category field
          categoryCount: { $sum: 1 } // Count the number of products per category
        }
      }
    ]);

    // Map the results to the desired format
    const distinctCategories = categories.map(category => ({
      category: category._id, // _id holds the distinct category value
      count: category.categoryCount
    }));

    res.status(200).send(distinctCategories);

  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error retrieving categories");
  }
});


// getProductByCategory
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category
    });

    const transformedProducts = products.map(product => {
    const productData = product.toObject(); // .toObject() بدلاً من .toJSON() في Mongoose

      if (productData.img_url) {
        productData.img_urls = productData.img_url.split(',');
      } else {
        productData.img_urls = [];
      }


      return productData;
    });

    res.status(200).send(transformedProducts);
  } catch (err) {
    console.error(err); // تسجيل الخطأ بالكامل للمساعدة في التصحيح
    res.status(400).send("Error retrieving product");
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();

    const transformedProducts = products.map(product => {
      const productData = product.toObject(); 

      productData.img_urls = productData.img_url ? productData.img_url.split(',') : [];


      return productData;
    });

    res.status(200).send(transformedProducts);
  } catch (err) {
    console.error(err); 
    res.status(400).send("Error retrieving products");
  }
});


// to make product - only admin can add - MW 
// auth
// router.post("/", upload.array("prodimg", 10), auth, async (req, res) => {
//   try {
//     const imgUrls = req.files.map(file => file.filename);
//     const prod = await Product.create({
//       name: req.body.name,
//       description: req.body.description,
//       price: req.body.price,
//       img_url: imgUrls.join(','), // Save as comma-separated string
//       // prodimg: req.body.path,
//       category: req.body.category,
//     });

//     res.status(200).send("Product added successfully");
//   } catch (err) {
//     console.error('Error:', err);  // Log the complete error for debugging
//     res.status(400).send("Product addition failed. Please check the request data.");
//   }
// });

/**to make product - anyone */ 
router.post("/", upload.array("prodimg", 10), async (req, res) => {
  try {
    const imgUrls = req.files.map(file => file.filename);

    const prod = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      img_url: imgUrls.join(','),
      category: req.body.category,
    });

    await prod.save();

    res.status(200).send("Product added successfully");
  } catch (err) {
    console.error('Error:', err);  
    res.status(400).send("Product addition failed. Please check the request data.");
  }
});


// search = sort
router.get('/searchsort', async (req, res) => {
  const { search = '', sort_by = '', category = '' } = req.query;

  let sort = {};
  if (sort_by === 'name_asc') sort = { name: 1 };
  if (sort_by === 'name_desc') sort = { name: -1 };
  if (sort_by === 'price_asc') sort = { price: 1 };
  if (sort_by === 'price_desc') sort = { price: -1 };

  try {
    const products = await Product.find({
      category: category || { $ne: null }, // Ensuring it works even if category is not provided
      name: { $regex: search, $options: 'i' }, // Case-insensitive search for the product name
    }).sort(sort);

    const transformedProducts = products.map(product => {
      // Clone the product data
      const productData = product.toObject(); // Convert Mongoose document to plain JavaScript object

      // Transform the img_url field from a string to an array
      if (productData.img_url) {
        productData.img_urls = productData.img_url.split(',');
      } else {
        productData.img_urls = [];
      }

      // Remove the original img_url field if desired
      delete productData.img_url;

      return productData;
    });

    res.status(200).send(transformedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//feedback
router.post("/feedback", async (req, res) => {
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).send("Access Denied. No token provided.");

  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    const userid = decodedPayload.userid;

    const { productId, feedback, rate } = req.body;
    if (!productId || !feedback || !rate) {
      return res.status(400).send("Missing required fields: productId, feedback, or rate.");
    }

    // Create feedback using Mongoose
    const newFeedback = new Feedback({
      userId: new mongoose.Types.ObjectId(userid), // Correctly instantiate ObjectId
      productId: new mongoose.Types.ObjectId(productId), // Correctly instantiate ObjectId
      feedback,
      rate
    });

    await newFeedback.save();

    return res.status(200).send("Feedback on product added successfully.");
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(400).send("Failed to add feedback on product.");
  }
});

router.get("/feedbacks/:productId", async (req, res) => {
  const { productId } = req.params;
  console.log("Received productId:", productId); // Log the received productId

  // Check if the productId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send("Invalid productId format.");
  }

  try {
      const feedbacks = await Feedback.find({
          productId: new mongoose.Types.ObjectId(productId), // Use the valid ObjectId
      })
      .populate('userId', 'name') // Ensure correct field for user
      .sort({ createdAt: -1 }); // Sort by creation date

      if (feedbacks.length === 0) {
          return res.status(404).send("No feedback found for this product.");
      }

      return res.status(200).json(feedbacks);
  } catch (err) {
      console.error("Error:", err.message);
      res.status(500).send("Error fetching feedbacks.");
  }
});


// // updateProductByID
// router.put("/:id", auth, ProductsController.updateProductByID);

// // deleteProductByID
// router.delete("/:id", auth, ProductsController.deleteProductByID);



// getProductByID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product with this id not found");
    }

    const productData = product.toObject();

    productData.img_urls = productData.img_url ? productData.img_url.split(',') : [];

    res.status(200).send(productData);
  } catch (err) {
    console.error(err); 
    res.status(400).send("Error retrieving product");
  }
});


module.exports = router;