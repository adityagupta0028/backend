# Product API - Postman Payload Examples

## Create Product - Using Form-Data (File Upload)

**Endpoint:** `POST /api/v1/admin/createProduct`  
**Headers:** 
- `Authorization: Bearer <your_admin_token>`
- `Content-Type: multipart/form-data`

### Form-Data Fields:

| Key | Type | Value | Required |
|-----|------|-------|----------|
| `product_id` | Text | `PROD-001` | ✅ Yes |
| `product_name` | Text | `Diamond Engagement Ring` | ✅ Yes |
| `description` | Text | `Beautiful diamond engagement ring with 14K white gold setting` | No |
| `original_price` | Text | `5000` | No |
| `discounted_price` | Text | `3999` | ✅ Yes |
| `discount_label` | Text | `Save 20%` | No |
| `promotion_label` | Text | `Limited Time Offer` | No |
| `promotion_end_date` | Text | `2024-12-31` | No |
| `metal_type` | Text | `14K White Gold` | ✅ Yes |
| `metal_code` | Text | `14KWG` | No |
| `metal_price` | Text | `1500` | No |
| `diamond_origin` | Text | `Natural` | ✅ Yes |
| `carat_weight` | Text | `1.5` | No |
| `diamond_quality` | Text | `Best - D, VVS` | No |
| `diamond_color_grade` | Text | `D` | No |
| `diamond_clarity_grade` | Text | `VVS1` | No |
| `ring_size` | Text | `7` | ✅ Yes |
| `engraving_text` | Text | `Forever` | No |
| `engraving_allowed` | Text | `true` | No |
| `back_type` | Text | `Push Back` | No |
| `matching_band_available` | Text | `true` | No |
| `product_type` | Text | `Engagement Ring` | No |
| `collection_name` | Text | `Classic Collection` | No |
| `categoryId` | Text | `507f1f77bcf86cd799439011` | ✅ Yes |
| `subCategoryId` | Text | `507f191e810c19729de860ea` | ✅ Yes |
| `images` | File | Select image files (up to 10) | ✅ Yes (at least 1) |
| `videos` | Text | `["https://example.com/video1.mp4"]` | No |
| `status` | Text | `Active` | No |
| `tags` | Text | `diamond,engagement,ring` or `["diamond", "engagement", "ring"]` | No |

---

## Create Product - Using JSON (With Image URLs)

**Endpoint:** `POST /api/v1/admin/createProduct`  
**Headers:** 
- `Authorization: Bearer <your_admin_token>`
- `Content-Type: application/json`

### JSON Payload:

```json
{
  "product_id": "PROD-001",
  "product_name": "Diamond Engagement Ring",
  "description": "Beautiful diamond engagement ring with 14K white gold setting. Perfect for your special moment.",
  "average_rating": 4.5,
  "review_count": 120,
  "original_price": 5000,
  "discounted_price": 3999,
  "discount_label": "Save 20%",
  "promotion_label": "Limited Time Offer",
  "promotion_end_date": "2024-12-31",
  "metal_type": "14K White Gold",
  "metal_code": "14KWG",
  "metal_price": 1500,
  "diamond_origin": "Natural",
  "carat_weight": 1.5,
  "diamond_quality": "Best - D, VVS",
  "diamond_color_grade": "D",
  "diamond_clarity_grade": "VVS1",
  "ring_size": 7,
  "engraving_text": "Forever",
  "engraving_allowed": true,
  "back_type": "Push Back",
  "matching_band_available": true,
  "product_type": "Engagement Ring",
  "collection_name": "Classic Collection",
  "categoryId": "507f1f77bcf86cd799439011",
  "subCategoryId": "507f191e810c19729de860ea",
  "images": [
    "/uploads/image-1762100625996.jpeg",
    "/uploads/image-1762101336928.jpeg"
  ],
  "videos": [
    "https://example.com/product-video.mp4"
  ],
  "status": "Active",
  "tags": ["diamond", "engagement", "ring", "14k", "white-gold"]
}
```

---

## Minimal Required Fields Only

```json
{
  "product_id": "PROD-002",
  "product_name": "Simple Ring",
  "discounted_price": 1999,
  "metal_type": "18K Yellow Gold",
  "diamond_origin": "Lab Grown",
  "ring_size": 6,
  "categoryId": "507f1f77bcf86cd799439011",
  "subCategoryId": "507f191e810c19729de860ea",
  "images": ["/uploads/image-1762100625996.jpeg"]
}
```

---

## Example with Different Product Types

### For Earrings:
```json
{
  "product_id": "PROD-003",
  "product_name": "Diamond Stud Earrings",
  "discounted_price": 2499,
  "metal_type": "Platinum",
  "diamond_origin": "Natural",
  "ring_size": 0,
  "categoryId": "507f1f77bcf86cd799439011",
  "subCategoryId": "507f191e810c19729de860ea",
  "product_type": "Earrings",
  "back_type": "Screw Back",
  "images": ["/uploads/earrings-image.jpeg"]
}
```

### For Pendant:
```json
{
  "product_id": "PROD-004",
  "product_name": "Diamond Pendant",
  "discounted_price": 1499,
  "metal_type": "14K Rose Gold",
  "diamond_origin": "Lab Grown",
  "ring_size": 0,
  "categoryId": "507f1f77bcf86cd799439011",
  "subCategoryId": "507f191e810c19729de860ea",
  "product_type": "Pendant",
  "images": ["/uploads/pendant-image.jpeg"]
}
```

---

## Valid Enum Values Reference

### metal_type:
- `14K White Gold`
- `14K Yellow Gold`
- `14K Rose Gold`
- `18K White Gold`
- `18K Yellow Gold`
- `18K Rose Gold`
- `Platinum`

### diamond_origin:
- `Natural`
- `Lab Grown`

### diamond_quality:
- `Best - D, VVS`
- `Better - E, VS1`
- `Good - F, VS2`

### back_type:
- `Push Back`
- `Screw Back`
- `Guardian Back`

### product_type:
- `Engagement Ring`
- `Earrings`
- `Pendant`
- `Bracelet`

### status:
- `Active`
- `Inactive`
- `Draft`

---

## Important Notes:

1. **categoryId** and **subCategoryId** must be valid MongoDB ObjectIds from existing Category and SubCategory records
2. **ring_size** must be between 3 and 10 (for rings). For other product types like Earrings/Pendants, you can use 0 or any value in range
3. **images** - At least one image is required. Can be:
   - File uploads via form-data (select files in Postman)
   - Array of image URLs: `["/uploads/image1.jpg", "/uploads/image2.jpg"]`
   - Single image URL string: `"/uploads/image1.jpg"`
4. **tags** can be:
   - Array: `["tag1", "tag2"]`
   - Comma-separated string: `"tag1,tag2,tag3"`
5. **promotion_end_date** should be in format: `YYYY-MM-DD` or ISO date string

---

## How to Get categoryId and subCategoryId:

1. First, create/get a Category using: `GET /api/v1/admin/getCategories`
2. Then, create/get a SubCategory using: `GET /api/v1/admin/getSubCategories?categoryId=<category_id>`
3. Use the `_id` field from the response as `categoryId` and `subCategoryId` in your product payload

