# UploadThing File Organization

## Folder Structure

Files uploaded to UploadThing are now automatically organized in a hierarchical folder structure:

```
UploadThing Storage
│
└── Portfolio_{portfolioId}/
    └── Property_{propertyId}/
        ├── documents/
        │   ├── lease-agreement.pdf
        │   ├── inspection-report.pdf
        │   └── ...
        │
        └── images/
            └── property-photo.jpg
```

### Structure Details

- **Portfolio Folders**: Each portfolio gets its own folder named `Portfolio_{portfolioId}`
- **Property Subfolders**: Under each portfolio, properties are organized as `Property_{propertyId}`
- **Document Storage**: Documents are stored in the `/documents` subfolder
- **Image Storage**: Property images are stored in the `/images` subfolder

### Benefits

✅ **Organized**: Easy to locate files by portfolio and property
✅ **Scalable**: Supports unlimited portfolios and properties
✅ **Clean**: Prevents file clutter at the root level
✅ **Logical**: Mirrors the application's data structure

### How It Works

When files are uploaded through the application:

1. **Document Upload**:
   - User uploads a document to a property
   - System passes `portfolioId` and `propertyId` to UploadThing
   - File is stored in: `Portfolio_{id}/Property_{id}/documents/filename.ext`

2. **Image Upload**:
   - User uploads a property image
   - System passes `portfolioId` and `propertyId` to UploadThing
   - File is stored in: `Portfolio_{id}/Property_{id}/images/filename.ext`

### Viewing in UploadThing Dashboard

When you view your files in the UploadThing dashboard (https://uploadthing.com/dashboard):

1. Files will be organized by these folder paths
2. You can browse by portfolio to see all its properties
3. Each property folder contains separate subfolders for documents and images

### Example

For a portfolio with ID `abc123` and a property with ID `xyz789`:

```
Portfolio_abc123/
└── Property_xyz789/
    ├── documents/
    │   ├── lease.pdf
    │   └── contract.pdf
    └── images/
        └── front-view.jpg
```

### Notes

- Folder names use underscores (e.g., `Portfolio_abc123`) to ensure compatibility
- The folder structure is created automatically when files are uploaded
- Deleting files from the app also removes them from UploadThing storage
- Old files (uploaded before this change) remain at the root level until replaced
