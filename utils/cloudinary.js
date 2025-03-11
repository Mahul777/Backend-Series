import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_key: process.env.CLOUDNARY_API_KEY,
    api_secret: process.env.CLOUDNARY_API_SECRET
});

// Function to upload a file to Cloudinary
const uploadCloudinary = async (localFilePath) => {
    try {
        // Check if the local file path exists
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"  // Auto detects the file type (image, video, etc.)
        });
          console.log("Checking what kind of response ", response);
          
        // File has been uploaded successfully
        console.log("File is uploaded on Cloudinary", response.url);
        //if file is uploaded then unlink the file 
        fs.unlinkSync(localFilePath); //we use unlinkSync becaause after remove of file then only we are going to mpve forward
        return response;
    } catch (error) {
        // If there is an error in uploading the file, remove the file from the server
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadCloudinary };


// // Upload an image inside an async function
// const uploadImage = async () => {
//     try {
//         const uploadResult = await cloudinary.uploader.upload(
//             'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                 public_id: 'shoes',
//             }
//         );
//         console.log(uploadResult);
//     } catch (error) {
//         console.log(error);
//     }
// };

// // Call the function
// uploadImage();