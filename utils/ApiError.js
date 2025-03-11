class ApiError extends Error {
    constructor(
      statusCode,            // The HTTP status code (e.g., 404, 500, etc.)
      message="Something went wrong", // The error message (default is "Something went wrong")
      errors=[],             // An array of additional errors (default is an empty array)
      stack=""               // A stack trace (optional)
    ) {
      super(message);        // Call the parent class (Error) constructor with the message
      this.statusCode = statusCode;  // Set the status code
      this.data = null;      // Default value for 'data' is null (you can use this to store additional info)
      this.message = message;  // The error message
      this.success = false;  // Indicates whether the operation was successful (set to false in case of an error)
      this.errors = errors;  // Store the additional errors passed in the constructor
      
      // If the stack is provided, use it, otherwise capture the current stack trace
      if (stack) {
        this.stack = stack;  // Assign the provided stack trace
      } else {
        Error.captureStackTrace(this, this.constructor); // Capture the current stack trace for debugging
      }
    }
  }
  
  export { ApiError };
  