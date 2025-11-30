# Add Banner API - Postman Example

## Endpoint Details

**Method:** `POST`  
**URL:** `http://localhost:8081/api/v1/Admin/addBanner`  
**Authentication:** Required (Admin Token)

---

## Headers

```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: multipart/form-data
```

**Note:** Postman will automatically set `Content-Type: multipart/form-data` when you select form-data with files.

---

## Request Body (form-data)

The API accepts **multiple image files** with specific field names:

| Key | Type | Value | Description |
|-----|------|-------|-------------|
| `home_image1` | File | (Select File) | Home page banner image 1 |
| `home_image2` | File | (Select File) | Home page banner image 2 |
| `bannner_image3` | File | (Select File) | Banner page image 3 |

**Note:** All fields are optional. You can send one, two, or all three images.

---

## Postman Setup Steps

### Step 1: Set Request Method and URL
1. Select **POST** method
2. Enter URL: `http://localhost:8081/api/v1/Admin/addBanner`

### Step 2: Add Authorization Header
1. Go to **Headers** tab
2. Add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_ADMIN_TOKEN_HERE`
   - Replace `YOUR_ADMIN_TOKEN_HERE` with your actual admin token

### Step 3: Set Request Body
1. Go to **Body** tab
2. Select **form-data** option
3. Add the following fields:

#### Option 1: Single Image
```
Key: home_image1
Type: File (change from Text to File)
Value: [Select your image file]
```

#### Option 2: Multiple Images
```
Key: home_image1
Type: File
Value: [Select image file 1]

Key: home_image2
Type: File
Value: [Select image file 2]

Key: bannner_image3
Type: File
Value: [Select image file 3]
```

### Step 4: Send Request
Click **Send** button

---

## Example Request (cURL)

```bash
curl --location 'http://localhost:8081/api/v1/Admin/addBanner' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE' \
--form 'home_image1=@"/path/to/image1.jpg"' \
--form 'home_image2=@"/path/to/image2.jpg"' \
--form 'bannner_image3=@"/path/to/image3.jpg"'
```

---

## Success Response

```json
{
    "success": true,
    "statusCode": 200,
    "message": "Banner added successfully",
    "data": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "homePageBanner1": "/uploads/image-1234567890.jpg",
        "homePageBanner2": "/uploads/image-1234567891.jpg",
        "bannerPage3": "/uploads/image-1234567892.jpg",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
    },
    "status": 1
}
```

---

## Error Responses

### 401 Unauthorized (Missing/Invalid Token)
```json
{
    "statusCode": 401,
    "message": "UNAUTHORIZED ACCESS",
    "data": {},
    "status": 0,
    "isSessionExpired": true
}
```

### 400 Bad Request
```json
{
    "statusCode": 400,
    "message": "Error message here",
    "data": {},
    "status": 0
}
```

---

## Important Notes

1. **Authentication Required:** You must be logged in as an Admin and include the token in the Authorization header.

2. **Field Names:** The field names are case-sensitive:
   - `home_image1` (not `homeImage1` or `home_image_1`)
   - `home_image2` (not `homeImage2` or `home_image_2`)
   - `bannner_image3` (note: there's a typo in the original code - it's `bannner` not `banner`)

3. **File Types:** Accepts common image formats (jpg, jpeg, png, gif, webp, etc.)

4. **All Fields Optional:** You can send just one image, two images, or all three. Empty fields will be stored as empty strings.

5. **File Size:** Check your server's file upload size limits (usually configured in multer/express).

---

## How to Get Admin Token

1. First, login as admin using the login endpoint:
   ```
   POST http://localhost:8081/api/v1/Admin/login
   Body (JSON):
   {
       "email": "admin@example.com",
       "password": "your_password"
   }
   ```

2. Copy the `accessToken` from the response
3. Use it in the Authorization header as: `Bearer YOUR_ACCESS_TOKEN`

---

## Postman Collection JSON (Optional)

You can import this into Postman:

```json
{
    "info": {
        "name": "Add Banner API",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "Add Banner",
            "request": {
                "method": "POST",
                "header": [
                    {
                        "key": "Authorization",
                        "value": "Bearer {{admin_token}}",
                        "type": "text"
                    }
                ],
                "body": {
                    "mode": "formdata",
                    "formdata": [
                        {
                            "key": "home_image1",
                            "type": "file",
                            "src": []
                        },
                        {
                            "key": "home_image2",
                            "type": "file",
                            "src": []
                        },
                        {
                            "key": "bannner_image3",
                            "type": "file",
                            "src": []
                        }
                    ]
                },
                "url": {
                    "raw": "http://localhost:8081/api/v1/Admin/addBanner",
                    "protocol": "http",
                    "host": ["localhost"],
                    "port": "8081",
                    "path": ["api", "v1", "Admin", "addBanner"]
                }
            }
        }
    ]
}
```

