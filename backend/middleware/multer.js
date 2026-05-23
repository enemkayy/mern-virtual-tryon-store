import multer from "multer";

// Multer configuration for file uploads
const storage = multer.diskStorage({
      
    filename:function(req, file, callback) {
        callback(null, file.originalname);
    }
})

const upload = multer({storage})

export default upload;