/**
 * Script to fix Product model indexes
 * Run this once to remove any problematic compound indexes on array fields
 * 
 * Usage: node scripts/fix-product-indexes.js
 */

const mongoose = require('mongoose');
const Model = require('../models/index');

async function fixIndexes() {
  try {
    // Connect to database (adjust connection string as needed)
    // This assumes you have a connection setup
    console.log('Checking Product model indexes...');
    
    const Product = Model.Product;
    const collection = Product.collection;
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
    // Check for problematic compound indexes on categoryId and subCategoryId
    const problematicIndexes = indexes.filter(index => {
      const keys = Object.keys(index.key || {});
      return keys.includes('categoryId') && keys.includes('subCategoryId');
    });
    
    if (problematicIndexes.length > 0) {
      console.log('Found problematic compound indexes:', problematicIndexes);
      console.log('These indexes need to be dropped manually from MongoDB.');
      console.log('Run in MongoDB shell:');
      problematicIndexes.forEach(index => {
        const indexName = index.name;
        console.log(`db.products.dropIndex("${indexName}")`);
      });
    } else {
      console.log('No problematic compound indexes found.');
    }
    
    console.log('Index check complete.');
  } catch (error) {
    console.error('Error checking indexes:', error);
  }
}

// Run if called directly
if (require.main === module) {
  fixIndexes().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = fixIndexes;

