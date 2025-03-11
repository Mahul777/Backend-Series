class ApiResponse {
    constructor(statusCode, data, message="Success") {
      this.statusCode = statusCode;
      this.data = data;
      this.message = message;
      this.success = statusCode < 400;  // success flag will be true for codes less than 400
    }
  }
  
  export {ApiResponse};