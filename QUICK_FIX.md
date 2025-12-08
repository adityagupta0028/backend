# QUICK FIX: Parallel Arrays Error

## Run this command to fix immediately:

```bash
node scripts/drop-parallel-array-index.js
```

## OR manually in MongoDB:

```javascript
db.products.dropIndex({ "categoryId": 1, "subCategoryId": 1 })
```

## OR in MongoDB Compass:
1. Open MongoDB Compass
2. Go to your database → products collection
3. Click "Indexes" tab
4. Find index with both categoryId and subCategoryId
5. Click "Drop Index"

After dropping the index, try creating the product again.
