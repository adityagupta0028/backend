const Model = require("../../../models/index");
const constants = require("../../../common/constants");
const { uploadFileToS3 } = require("../../../services/uploadS3Service");
const fs = require("fs");
// Define all filter keys and their display names
// NOTE: Keep this list in sync with:
// - admin-frontend `filterTypes` config in `FilterManagement.tsx`
// - `filterModelMap` below
const FILTER_DEFINITIONS = [
  { key: 'settingConfigurations', name: 'Setting Configurations' },
  { key: 'shankConfigurations', name: 'Shank Configurations' },
  { key: 'holdingMethods', name: 'Holding Methods' },
  { key: 'bandProfileShapes', name: 'Band Profile Shapes' },
  { key: 'bandWidthCategories', name: 'Band Width Categories' },
  { key: 'bandFits', name: 'Band Fits' },
  { key: 'flexibilityTypes', name: 'Flexibility Types' },
  { key: 'productSpecials', name: 'Product Specials' },
  { key: 'collections', name: 'Collections' },
  { key: 'chainLinkTypes', name: 'Chain Link Types' },
  { key: 'closureTypes', name: 'Closure Types' },
  { key: 'stoneSettings', name: 'Stone Settings' },
  { key: 'placementFits', name: 'Placement Fits' },
  { key: 'shankTreatments', name: 'Shank Treatments' },
  { key: 'styles', name: 'Styles' },
  { key: 'settingFeatures', name: 'Setting Features' },
  { key: 'motifThemes', name: 'Motif Themes' },
  { key: 'ornamentDetails', name: 'Ornament Details' },
  { key: 'accentStoneShapes', name: 'Accent Stone Shapes' },
  { key: 'assemblyTypes', name: 'Assembly Types' },
  { key: 'chainTypes', name: 'Chain Types' },
  { key: 'finishDetails', name: 'Finish Details' },
  { key: 'unitOfSales', name: 'Unit Of Sales' },
  { key: 'dropShapes', name: 'Drop Shapes' },
  { key: 'attachmentTypes', name: 'Attachment Types' },
  { key: 'earringOrientations', name: 'Earring Orientations' }
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
      flexibilityTypes: Model.FlexibilityType,
      productSpecials: Model.ProductSpecials,
      collections: Model.Collections,
      chainLinkTypes: Model.ChainLinkType,
      closureTypes: Model.ClosureType,
      stoneSettings: Model.StoneSetting,
      placementFits: Model.PlacementFit,
      shankTreatments: Model.ShankTreatments,
      styles: Model.Styles,
      settingFeatures: Model.SettingFeatures,
      motifThemes: Model.MotifThemes,
      ornamentDetails: Model.OrnamentDetails,
      accentStoneShapes: Model.AccentStoneShapes,
      assemblyTypes: Model.AssemblyType,
      chainTypes: Model.ChainType,
      finishDetails: Model.FinishDetail,
      unitOfSales: Model.UnitOfSale,
      dropShapes: Model.DropShape,
      attachmentTypes: Model.AttachmentType,
      earringOrientations: Model.EarringOrientation
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

// Save menu filter settings
module.exports.saveMenuFilterSettings = async (req, res, next) => {
  try {
    let { menuName, menuItem, filters, categoryId } = req.body;
    
    if (!menuName || !menuItem || !filters || !Array.isArray(filters)) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "menuName, menuItem, and filters array are required"
      });
    }

    const validMenuNames = ['Main Menu', 'Side Menu', 'Hero Menu'];
    if (!validMenuNames.includes(menuName)) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "menuName must be one of: Main Menu, Side Menu, Hero Menu"
      });
    }

    if(menuItem=="Engagement Rings"){
      categoryId = "6942e3b741e766bf37919b9c";
     }
     else if(menuItem=="Wedding"){
      categoryId = "6945ae7225a47dcbe1667cb5";
     }
     else if(menuItem=="Jewellery" || menuItem=="Ring" || menuItem=="Bracelets" || menuItem=="Necklace" || menuItem=="Earrings"){
      categoryId = "696b72148245c957c8788293";
     }

    // Save or update each filter setting
    const savePromises = filters.map(async (filter) => {
      const { item, itemKey, items } = filter;
      
      if (!item || !itemKey || !Array.isArray(items)) {
        throw new Error(`Invalid filter data: ${JSON.stringify(filter)}`);
      }

   
     

      // Find existing setting or create new one
      const filterSetting = await Model.MenuFilterSettings.findOneAndUpdate(
        {
          menuName,
          menuItem,
          itemKey
        },
        {
          menuName,
          categoryId,
          menuItem,
          item,
          itemKey,
          items: items.map(id => typeof id === 'string' ? id : id.toString())
        },
        {
          new: true,
          upsert: true
        }
      );

      return filterSetting;
    });

    await Promise.all(savePromises);

    // Get all saved settings for this menu item
    const savedSettings = await Model.MenuFilterSettings.find({
      menuName,
      menuItem
    }).sort({ itemKey: 1 });

    return res.success(constants.MESSAGES.DATA_UPDATED, savedSettings);
  } catch (error) {
    console.log(error,"error");
    next(error);
  }
};

// Get menu filter settings
module.exports.getMenuFilterSettings = async (req, res, next) => {
  try {
    const { menuName, menuItem } = req.query;
    
    if (!menuName || !menuItem) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "menuName and menuItem are required"
      });
    }

    const filterSettings = await Model.MenuFilterSettings.find({
      menuName,
      menuItem
    }).sort({ itemKey: 1 });

    return res.success(constants.MESSAGES.DATA_FETCHED, filterSettings);
  } catch (error) {
    next(error);
  }
};

