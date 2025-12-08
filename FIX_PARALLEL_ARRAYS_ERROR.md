# Fix: "cannot index parallel arrays [subCategoryId] [categoryId]" Error

## Problem
This error occurs when MongoDB tries to use a compound index on two array fields (`categoryId` and `subCategoryId`). MongoDB cannot create or use compound indexes on parallel arrays because arrays can have different lengths and MongoDB doesn't know how to match elements by position.

## Solution

### Step 1: Check for Problematic Indexes
Connect to your MongoDB database and run:
```javascript
db.products.getIndexes()
```

Look for any index that includes both `categoryId` and `subCategoryId` in the same index.

### Step 2: Drop the Problematic Index
If you find a compound index like:
```javascript
{ "categoryId": 1, "subCategoryId": 1 }
```

Drop it using:
```javascript
db.products.dropIndex("index_name")
```

Or drop it by the key pattern:
```javascript
db.products.dropIndex({ "categoryId": 1, "subCategoryId": 1 })
```

### Step 3: Verify
After dropping the index, verify it's gone:
```javascript
db.products.getIndexes()
```

You should only see separate indexes:
- `{ "categoryId": 1 }`
- `{ "subCategoryId": 1 }`

But NOT a compound index with both fields.

## Prevention
The Product model is configured to only create separate indexes on `categoryId` and `subCategoryId`, not compound indexes. This error should not occur with the current model definition.

## Alternative: Use MongoDB Compass or MongoDB Shell
1. Open MongoDB Compass
2. Navigate to your database
3. Go to the `products` collection
4. Click on the "Indexes" tab
5. Look for any index containing both `categoryId` and `subCategoryId`
6. Delete that index

## Note
This error typically occurs when:
- A compound index was created manually
- An older version of the code created such an index
- A migration script created the index

The current code does NOT create compound indexes on array fields.

