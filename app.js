const express = require('express');
const connectDB = require('./db/db');
const datesheetSchema = require('./models/models');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'datesheets',
    allowedFormats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

app.get('/',async (req, res) => {
 try{
    const data = await datesheetSchema.find();
    res.send(data);
 }catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server Error' });
 
 }
});

app.post('/upload', upload.single('image'), async (req, res) => {
  const { title } = req.body;
  const data = datesheetSchema({ title, image: req.file.path });
  await data.save();
  res.send(data);
});

app.delete('/delete/:id', async (req, res) => {
    try {
      // Find the document to be deleted
      const data = await datesheetSchema.findById(req.params.id);
  
      if (!data) {
        return res.status(404).send('Data not found');
      }
  
      // Extract the public ID from the image URL
      const publicId = data.image.split('/').slice(-2).join('/').split('.')[0];
  
      // Debug: log the public ID to check if it's correct
      console.log('Public ID:', publicId);
  
      // Delete the image from Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.destroy(publicId);
  
      // Debug: log the response from Cloudinary
      console.log('Cloudinary Response:', cloudinaryResponse);
  
      // If deletion is successful, remove the document from the database
      await datesheetSchema.findByIdAndDelete(req.params.id);
  
      res.send({ message: 'Data and associated image deleted successfully', data });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  });

const Star = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

Star();