const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(bodyParser.json());

// MongoDB Connection
// Using a local MongoDB instance since we don't have the actual MongoDB Atlas credentials
// This will use a locally running MongoDB instance or MongoDB memory server for testing
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/incentives";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.warn('Using in-memory data storage instead. Data will be lost when server restarts.');
  // Continue execution even without a DB connection - we'll use in-memory storage
});

// Define Schema with required fields
const incentiveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  schemeId: String, // Used to group versions together
  effectiveStart: String,
  effectiveEnd: String,
  currency: String,
  revenueBase: String,
  participants: [String],
  commissionStructure: Object,
  measurementRules: Object,
  creditRules: Object,
  customRules: Array,
  salesQuota: Number,
  metadata: {
    createdAt: {
      type: String,
      default: () => new Date().toISOString()
    },
    updatedAt: {
      type: String,
      default: () => new Date().toISOString()
    },
    version: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['DRAFT', 'APPROVED', 'SIMULATION', 'PRODUCTION'],
      default: 'DRAFT'
    }
  }
}, { strict: false }); // Allow flexible structure

const Incentive = mongoose.model('incentivescheme', incentiveSchema);

// Define Schema for Scheme Admin Configuration
const schemeAdminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true
  },
  adminName: String,
  createdAt: String,
  updatedAt: String,
  calculationBase: String,
  baseField: String,
  baseData: Object,
  qualificationFields: Array,
  adjustmentFields: Array,
  exclusionFields: Array,
  customRules: Array,
  mappings: Array
}, { strict: false }); // Allow flexible structure

const SchemeConfig = mongoose.model('schemeconfig', schemeAdminSchema);

// In-memory fallback for when MongoDB is not available
let inMemorySchemes = [];
let inMemorySchemeConfigs = [];
let nextInMemoryId = 1;

// Helper function to determine if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// API Routes

// GET all incentive schemes - return latest version of each schemeId
app.get('/api/incentives', async (req, res) => {
  try {
    if (isMongoConnected()) {
      // Group by schemeId and find the highest version for each
      const schemes = await Incentive.aggregate([
        { 
          $sort: { 
            schemeId: 1, 
            "metadata.version": -1 
          } 
        },
        {
          $group: {
            _id: "$schemeId",
            doc: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: { newRoot: "$doc" }
        },
        {
          $sort: { 'metadata.updatedAt': -1 }
        }
      ]);
      
      res.json(schemes);
    } else {
      // Fallback to in-memory data if MongoDB is not connected
      console.log('Returning in-memory schemes:', inMemorySchemes.length);
      
      // Group by schemeId and get latest version
      const schemes = Object.values(
        inMemorySchemes.reduce((acc, scheme) => {
          const { schemeId } = scheme;
          if (!acc[schemeId] || acc[schemeId].metadata.version < scheme.metadata.version) {
            acc[schemeId] = scheme;
          }
          return acc;
        }, {})
      );
      
      res.json(schemes);
    }
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ error: 'Failed to fetch incentive schemes' });
  }
});

// GET all versions of a specific scheme by schemeId
app.get('/api/incentives/versions/:schemeId', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const schemes = await Incentive.find({ 
        schemeId: req.params.schemeId 
      }).sort({ 'metadata.version': -1 });
      
      if (!schemes || schemes.length === 0) {
        return res.status(404).json({ error: 'No versions found for this scheme ID' });
      }
      
      res.json(schemes);
    } else {
      // Fallback to in-memory data
      const schemes = inMemorySchemes
        .filter(scheme => scheme.schemeId === req.params.schemeId)
        .sort((a, b) => b.metadata.version - a.metadata.version);
        
      if (schemes.length === 0) {
        return res.status(404).json({ error: 'No versions found for this scheme ID' });
      }
      
      res.json(schemes);
    }
  } catch (error) {
    console.error('Error fetching scheme versions:', error);
    res.status(500).json({ error: 'Failed to fetch scheme versions' });
  }
});

// GET a specific incentive scheme by ID
app.get('/api/incentives/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const scheme = await Incentive.findById(req.params.id);
      if (!scheme) {
        return res.status(404).json({ error: 'Incentive scheme not found' });
      }
      res.json(scheme);
    } else {
      // Fallback to in-memory data
      const scheme = inMemorySchemes.find(s => s._id === req.params.id);
      
      if (!scheme) {
        return res.status(404).json({ error: 'Incentive scheme not found' });
      }
      
      res.json(scheme);
    }
  } catch (error) {
    console.error('Error fetching scheme:', error);
    res.status(500).json({ error: 'Failed to fetch incentive scheme' });
  }
});

// POST - Create a new incentive scheme
app.post('/api/incentives', async (req, res) => {
  try {
    // Ensure the scheme has required metadata
    const schemeData = {
      ...req.body,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: req.body.metadata?.version || 1,
        status: req.body.metadata?.status || 'DRAFT'
      }
    };
    
    if (isMongoConnected()) {
      const newScheme = new Incentive(schemeData);
      const savedScheme = await newScheme.save();
      res.status(201).json(savedScheme);
    } else {
      // Fallback to in-memory storage
      const inMemoryScheme = {
        ...schemeData,
        _id: String(nextInMemoryId++)
      };
      
      inMemorySchemes.push(inMemoryScheme);
      console.log(`Saved in-memory scheme with ID: ${inMemoryScheme._id}`);
      res.status(201).json(inMemoryScheme);
    }
  } catch (error) {
    console.error('Error creating scheme:', error);
    res.status(500).json({ error: `Failed to create incentive scheme: ${error.message}` });
  }
});

// POST - Save a new version of an existing scheme
app.post('/api/incentives/:schemeId/version', async (req, res) => {
  try {
    const { schemeId } = req.params;
    const editedScheme = req.body;

    console.log('Attempting to create new version for schemeId:', schemeId);
    console.log('Edited scheme data:', JSON.stringify(editedScheme, null, 2));

    if (isMongoConnected()) {
      // Find ALL documents with this schemeId and sort to get the latest
      const latest = await Incentive.findOne({ schemeId }).sort({ 'metadata.version': -1 });

      if (!latest) {
        console.error(`No scheme found with schemeId: ${schemeId}`);
        return res.status(404).json({ 
          error: 'Scheme not found', 
          details: `No scheme exists with schemeId: ${schemeId}` 
        });
      }

      // Create new version
      const newVersion = new Incentive({
        ...editedScheme,
        schemeId,
        metadata: {
          createdAt: editedScheme.metadata?.createdAt || latest.metadata.createdAt,
          updatedAt: new Date().toISOString(),
          version: latest.metadata.version + 1,
          status: editedScheme.metadata?.status || 'DRAFT'
        }
      });

      console.log('New version to be saved:', JSON.stringify(newVersion.toObject(), null, 2));

      const savedVersion = await newVersion.save();
      
      console.log(`Successfully created version ${savedVersion.metadata.version} for scheme ${schemeId}`);
      
      res.status(201).json(savedVersion);
    } else {
      res.status(500).json({ error: 'Database connection not available' });
    }
  } catch (error) {
    console.error('Error saving new version:', error);
    res.status(500).json({ 
      error: 'Failed to save version', 
      details: error.message 
    });
  }
});

// PUT - Update an existing incentive scheme
// This is kept for compatibility but we're now using POST for new versions
app.put('/api/incentives/:id', async (req, res) => {
  try {
    const scheme = await Incentive.findById(req.params.id);
    
    if (!scheme) {
      return res.status(404).json({ error: 'Incentive scheme not found' });
    }
    
    // Update the scheme with new data
    const updates = {
      ...req.body,
      metadata: {
        ...scheme.metadata.toObject(),
        ...req.body.metadata,
        updatedAt: new Date().toISOString()
      }
    };
    
    const updatedScheme = await Incentive.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    
    res.json(updatedScheme);
  } catch (error) {
    console.error('Error updating scheme:', error);
    res.status(500).json({ error: 'Failed to update incentive scheme' });
  }
});

// PATCH - Update scheme status only
app.patch('/api/incentives/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['DRAFT', 'APPROVED', 'SIMULATION', 'PRODUCTION'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const scheme = await Incentive.findById(req.params.id);
    
    if (!scheme) {
      return res.status(404).json({ error: 'Incentive scheme not found' });
    }
    
    const updatedScheme = await Incentive.findByIdAndUpdate(
      req.params.id,
      { 
        'metadata.status': status,
        'metadata.updatedAt': new Date().toISOString()
      },
      { new: true }
    );
    
    res.json(updatedScheme);
  } catch (error) {
    console.error('Error updating scheme status:', error);
    res.status(500).json({ error: 'Failed to update incentive scheme status' });
  }
});

// DELETE - Remove an incentive scheme
app.delete('/api/incentives/:id', async (req, res) => {
  try {
    const deletedScheme = await Incentive.findByIdAndDelete(req.params.id);
    
    if (!deletedScheme) {
      return res.status(404).json({ error: 'Incentive scheme not found' });
    }
    
    res.json({ message: 'Incentive scheme deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheme:', error);
    res.status(500).json({ error: 'Failed to delete incentive scheme' });
  }
});

// SchemeConfig API Routes

// GET all scheme configurations
app.get('/api/admin', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const configs = await SchemeConfig.find().sort({ createdAt: -1 });
      res.json(configs);
    } else {
      // Fallback to in-memory data
      res.json(inMemorySchemeConfigs);
    }
  } catch (error) {
    console.error('Error fetching scheme configurations:', error);
    res.status(500).json({ error: 'Failed to fetch scheme configurations' });
  }
});

// GET a specific scheme configuration
app.get('/api/admin/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const config = await SchemeConfig.findById(req.params.id);
      if (!config) {
        return res.status(404).json({ error: 'Scheme configuration not found' });
      }
      res.json(config);
    } else {
      // Fallback to in-memory data
      const config = inMemorySchemeConfigs.find(c => c._id === req.params.id);
      if (!config) {
        return res.status(404).json({ error: 'Scheme configuration not found' });
      }
      res.json(config);
    }
  } catch (error) {
    console.error('Error fetching scheme configuration:', error);
    res.status(500).json({ error: 'Failed to fetch scheme configuration' });
  }
});

// POST - Create a new scheme configuration
app.post('/api/admin', async (req, res) => {
  try {
    // Ensure timestamp fields are present
    const configData = {
      ...req.body,
      createdAt: req.body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isMongoConnected()) {
      const newConfig = new SchemeConfig(configData);
      const savedConfig = await newConfig.save();
      console.log('Saved scheme configuration to MongoDB:', savedConfig._id);
      res.status(201).json(savedConfig);
    } else {
      // Fallback to in-memory storage
      const inMemoryConfig = {
        ...configData,
        _id: String(nextInMemoryId++)
      };
      
      inMemorySchemeConfigs.push(inMemoryConfig);
      console.log(`Saved in-memory scheme configuration with ID: ${inMemoryConfig._id}`);
      res.status(201).json(inMemoryConfig);
    }
  } catch (error) {
    console.error('Error creating scheme configuration:', error);
    res.status(500).json({ error: `Failed to create scheme configuration: ${error.message}` });
  }
});

// PUT - Update an existing scheme configuration
app.put('/api/admin/:id', async (req, res) => {
  try {
    const config = await SchemeConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({ error: 'Scheme configuration not found' });
    }
    
    // Update with new data
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const updatedConfig = await SchemeConfig.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    
    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating scheme configuration:', error);
    res.status(500).json({ error: 'Failed to update scheme configuration' });
  }
});

// DELETE - Remove a scheme configuration
app.delete('/api/admin/:id', async (req, res) => {
  try {
    const deletedConfig = await SchemeConfig.findByIdAndDelete(req.params.id);
    
    if (!deletedConfig) {
      return res.status(404).json({ error: 'Scheme configuration not found' });
    }
    
    res.json({ message: 'Scheme configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheme configuration:', error);
    res.status(500).json({ error: 'Failed to delete scheme configuration' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/incentives`);
});
