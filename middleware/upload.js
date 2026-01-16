const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Ensure upload directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userDir = path.join(uploadDir, req.user._id.toString());
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        'image/jpeg': true,
        'image/jpg': true,
        'image/png': true,
        'image/webp': true,
        'application/pdf': true
    };
    
    if (allowedTypes[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
};

// Initialize multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        files: 5
    }
});

// Process image uploads
const processImage = async (req, res, next) => {
    if (!req.file) return next();
    
    try {
        if (req.file.mimetype.startsWith('image/')) {
            const filePath = req.file.path;
            const optimizedPath = filePath.replace(/\.[^/.]+$/, '_optimized.jpg');
            
            // Resize and optimize image
            await sharp(filePath)
                .resize(800, 800, { 
                    fit: 'inside',
                    withoutEnlargement: true 
                })
                .jpeg({ 
                    quality: 80,
                    progressive: true 
                })
                .toFile(optimizedPath);
            
            // Replace original with optimized
            fs.unlinkSync(filePath);
            req.file.path = optimizedPath;
            req.file.filename = path.basename(optimizedPath);
            req.file.size = fs.statSync(optimizedPath).size;
        }
        
        // Generate public URL
        req.file.url = `/uploads/${req.user._id}/${req.file.filename}`;
        next();
    } catch (error) {
        console.error('Image processing error:', error);
        next(error);
    }
};

// Handle multiple file uploads
const uploadMultiple = (fields) => {
    return [
        upload.fields(fields),
        async (req, res, next) => {
            try {
                if (req.files) {
                    const processedFiles = {};
                    
                    for (const [field, files] of Object.entries(req.files)) {
                        processedFiles[field] = await Promise.all(
                            files.map(async (file) => {
                                if (file.mimetype.startsWith('image/')) {
                                    const optimizedPath = file.path.replace(/\.[^/.]+$/, '_optimized.jpg');
                                    
                                    await sharp(file.path)
                                        .resize(800, 800, { 
                                            fit: 'inside',
                                            withoutEnlargement: true 
                                        })
                                        .jpeg({ 
                                            quality: 80,
                                            progressive: true 
                                        })
                                        .toFile(optimizedPath);
                                    
                                    fs.unlinkSync(file.path);
                                    file.path = optimizedPath;
                                    file.filename = path.basename(optimizedPath);
                                    file.size = fs.statSync(optimizedPath).size;
                                }
                                
                                file.url = `/uploads/${req.user._id}/${file.filename}`;
                                return {
                                    filename: file.filename,
                                    originalname: file.originalname,
                                    mimetype: file.mimetype,
                                    size: file.size,
                                    url: file.url
                                };
                            })
                        );
                    }
                    
                    req.processedFiles = processedFiles;
                }
                next();
            } catch (error) {
                next(error);
            }
        }
    ];
};

module.exports = {
    upload,
    processImage,
    uploadMultiple,
    single: (fieldName) => [upload.single(fieldName), processImage],
    array: (fieldName, maxCount) => upload.array(fieldName, maxCount),
    fields: (fields) => uploadMultiple(fields)
};