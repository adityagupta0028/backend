const Model = require("../../../models/index");
const constants = require("../../../common/constants");
const { uploadFileToS3 } = require("../../../services/uploadS3Service");

// Define all filter keys and their display names
const FILTER_DEFINITIONS = [
  { key: 'settingConfigurations', name: 'Setting Configurations' },
  { key: 'shankConfigurations', name: 'Shank Configurations' },
  { key: 'holdingMethods', name: 'Holding Methods' },
  { key: 'bandProfileShapes', name: 'Band Profile Shapes' },
  { key: 'bandWidthCategories', name: 'Band Width Categories' },
  { key: 'bandFits', name: 'Band Fits' },
  { key: 'shankTreatments', name: 'Shank Treatments' },
  { key: 'styles', name: 'Styles' },
  { key: 'settingFeatures', name: 'Setting Features' },
  { key: 'motifThemes', name: 'Motif Themes' },
  { key: 'ornamentDetails', name: 'Ornament Details' },
  { key: 'accentStoneShapes', name: 'Accent Stone Shapes' }
];

// Initialize filter visibility settings
const initializeFilterVisibility = async () => {
  for (const filter of FILTER_DEFINITIONS) {
    const existing = await Model.FilterVisibility.findOne({ filterKey: filter.key });
    if (!existing) {
      await Model.FilterVisibility.create({
        filterKey: filter.key,
        filterName: filter.name,
        isVisible: true
      });
    }
  }
};

// Get all filter visibility settings
module.exports.getFilterVisibility = async (req, res, next) => {
  try {
    // Initialize if not exists
    await initializeFilterVisibility();


    
    let filterVisibility = await Model.FilterVisibility.find({})
      .sort({ filterKey: 1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, filterVisibility);
  } catch (error) {
    next(error);
  }
};

// Update filter visibility settings
module.exports.updateFilterVisibility = async (req, res, next) => {
  try {
    const { filters } = req.body;
    
    if (!filters || !Array.isArray(filters)) {
      throw new Error("Filters array is required");
    }
    
    // Initialize if not exists
    await initializeFilterVisibility();
    
    // Update each filter visibility
    const updatePromises = filters.map(async (filter) => {
      return await Model.FilterVisibility.findOneAndUpdate(
        { filterKey: filter.filterKey },
        { isVisible: filter.isVisible },
        { new: true, upsert: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    // Get updated settings
    let updatedFilters = await Model.FilterVisibility.find({})
      .sort({ filterKey: 1 });
    
    return res.success(constants.MESSAGES.DATA_UPDATED, updatedFilters);
  } catch (error) {
    next(error);
  }
};

// Update filter item image
module.exports.updateFilterImage = async (req, res, next) => {
  try {
    const { filterKey, itemId } = req.body;
    
    if (!filterKey || !itemId) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "filterKey and itemId are required"
      });
    }

    // Map filterKey to corresponding Model
    const filterModelMap = {
      settingConfigurations: Model.SettingConfigurations,
      shankConfigurations: Model.ShankConfigurations,
      holdingMethods: Model.HoldingMethods,
      bandProfileShapes: Model.BandProfileShapes,
      bandWidthCategories: Model.BandWidthCategories,
      bandFits: Model.BandFits,
      shankTreatments: Model.ShankTreatments,
      styles: Model.Styles,
      settingFeatures: Model.SettingFeatures,
      motifThemes: Model.MotifThemes,
      ornamentDetails: Model.OrnamentDetails,
      accentStoneShapes: Model.AccentStoneShapes
    };

    const ModelClass = filterModelMap[filterKey];
    if (!ModelClass) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "Invalid filterKey"
      });
    }

    // Check if item exists
    const item = await ModelClass.findOne({
      _id: itemId,
      isDeleted: false
    });

    if (!item) {
      return res.error(404, constants.MESSAGES.NOT_FOUND, {
        message: "Filter item not found"
      });
    }

    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    } else {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "Image is required (either file upload or image URL)"
      });
    }

    // Update the image
    const updatedItem = await ModelClass.findByIdAndUpdate(
      itemId,
      { image: imagePath },
      { new: true }
    );

    return res.success(constants.MESSAGES.DATA_UPDATED, updatedItem);
  } catch (error) {
    next(error);
  }
};

