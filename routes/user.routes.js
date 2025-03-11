import { Router } from "express";
import { loginUser, logOutUser, refreshAccessToken, registerUser,updateAvatar, updateCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware .js";
const router = Router();
// Define a POST route for "/register" that triggers the registerUser function from the controller
router.route("/register").post(
    upload.fields                         //upload is middlewareand accept array with multiple fields 
    ([ 
       //here we accepting 2 file ("avatar", "coverImage")
       {
        name:"avatar", //name of file
        maxCount: 1   
       },
       {
          name:"coverImage",
          maxCount: 1
       }
    ]),         
    registerUser
)

router.route("/login").post(loginUser)

//secure routes
router.route("/logout").post(verifyJWT,logOutUser)

//refreshAccessToken route
router.route("/refresh-token").post(refreshAccessToken);

// Update avatar route
router.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateAvatar); // 'avatar' is the field name in form data

// Update cover image route
router.route("/update-cover-image").post(verifyJWT, upload.single("coverImage"), updateCoverImage); // 'coverImage' is the field name in form data


export default router;