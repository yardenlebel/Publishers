const express=require('express');
const app =express();
const db=require('mongoose');
const cors = require('cors');
db.connect('mongodb://127.0.0.1:27017/Publisher')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server once connected to MongoDB
  })

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());

const publisherSchema = new db.Schema({
    publisher: String,
    domains: [{
      domain: String,
      desktopAds: Number,
      mobileAds: Number
    }]
  });
  const Publisher = db.model('Publisher', publisherSchema);


  app.get('/getData',(req,res)=>{
    const find=async()=>{
        let temp=await Publisher.find();
       res.json(temp);
    }
	find();
})



app.post('/addPublisher', async (req, res) => {
    try {
      const newPublisher = new Publisher(req.body);
      await newPublisher.save();
      res.json({ message: 'Publisher added successfully', publisher: newPublisher });
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: err });
    }
  });

  app.post('/addDomain', async (req, res) => {
    try {
      const { publisher, domain } = req.body; 
      const existingPublisher = await Publisher.findOne({ publisher });
  
      if (!existingPublisher) {
        return res.status(404).json({ error: 'Publisher not found' });
      }
      existingPublisher.domains.push(domain);
      await existingPublisher.save();
      res.status(200).json({ message: 'Domain added successfully', publisher: existingPublisher });
    } catch (err) {
      console.error('Error adding domain:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  app.put('/updateDomain', async (req, res) => {
    try {
      const { oldDomainName, newDomain } = req.body;
  
      // Find the domain in the database and update it
      const existingDomain = await Domain.findOneAndUpdate(
        { domain: oldDomainName },
        { $set: newDomain },
        { new: true }
      );
  
      // Check if the domain was successfully updated
      if (!existingDomain) {
        return res.status(404).json({ error: 'Domain not found' });
      }
  
      // Send a success response
      res.status(200).json({ message: 'Domain updated successfully', domain: existingDomain });
    } catch (err) {
      console.error('Error updating domain:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/deleteDomain/:name', async (req, res) => {
    try {
      const domainName = req.params.name;
  
      // Implement logic to delete the domain with the given name from your database
      // For example, using Mongoose with MongoDB
      const deletedDomain = await Domain.findOneAndDelete({ domain: domainName });
  
      if (!deletedDomain) {
        return res.status(404).json({ error: 'Domain not found' });
      }
  
      res.status(200).json({ message: 'Domain deleted successfully', deletedDomain });
    } catch (error) {
      console.error('Error deleting domain:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.listen('3000',()=>{console.log('server is listen to 3000')});
