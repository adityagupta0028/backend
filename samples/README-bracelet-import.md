# Bracelet CSV Import

Use **bracelet-import-sample.csv** with the API: `POST /import-bracelet-product` (multipart form field: `csv`).

## Required columns (must have values)

- **product_name** – Product title
- **categoryId** – One valid MongoDB ObjectId (Bracelets category)
- **diamond_origin** – `natural` or `lab grown`
- **metal_color** – Comma-separated (e.g. `Yellow Gold`, `White Gold`, `Platinum`)
- **karat** – Comma-separated if not Platinum (e.g. `14K`, `18K`)
- **shape** – Comma-separated (e.g. `Round`, `Circle`)
- **diamond_quality** – Comma-separated (e.g. `Good - F VS2`, `Better - E VS1`)
- **carat_weight** – Comma-separated numbers (e.g. `0.5`, `1`, `2`)

## Replace placeholder IDs

The sample row uses placeholder ObjectIds like `507f1f77bcf86cd799439011`. Replace them with real IDs from your database:

- **categoryId** – from Category (Bracelets)
- **subCategoryId**, **subSubCategoryId** – optional, from SubCategory / SubSubCategory
- **sizeScale** – from SizeScale collection
- **flexibilityType** – from FlexibilityType
- **chainLinkType** – from ChainLinkType
- **closureType** – from ClosureType
- **stoneSetting** – from StoneSetting (comma-separated IDs)
- **styles**, **settingFeatures**, **motifThemes** – from Styles, SettingFeatures, MotifThemes (comma-separated)
- **FinishDetail** – from FinishDetail (comma-separated)
- **placementFit** – from PlacementFit
- **center_stone_holding_methods_diamond** etc. – HoldingMethods ObjectIds when applicable

## Optional columns

- product_id (if empty, API generates `BRAC-xxxxxx`)
- description, design_styles, stone, gender, product_specials, collections
- Length (bracelet lengths, comma-separated, e.g. `7,7.5,8`)
- engraving, gift, product_details, average_width, rhodium_plate
- All center/side/stone_details columns
- price, discounted_price (used for all variants if no per-variant columns), status

## Variants

Variants are generated from: **carat_weight** × **metal_type** (metal_color + karat) × **diamond_quality** × **shape**. Set **price** and **discounted_price** in the CSV to apply to all variants.
