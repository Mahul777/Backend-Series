const asyncHandler = (requestHandler) => (req, res, next) =>
   {
  Promise.resolve(requestHandler(req, res, next))
         .catch(next);
};

export { asyncHandler };


// const asyncHandler =(fn) =>async(req,res,next) =>
//     {
//        try {
//         await fn(req,res,next)
//        } 
//        catch (error) 
//        {
//          res.status(error.code || 500)  //if there no error code then we pass 500
//          .json(   
//             {
//               success:false,
//                message:error.message
//             });
//        }
//     }

