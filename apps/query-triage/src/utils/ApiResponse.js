class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  static error(message = 'Error', statusCode = 500, errors = []) {
    return {
      success: false,
      statusCode,
      message,
      errors: errors.length ? errors : undefined,
    };
  }

  static accepted(data = {}, message = 'Request accepted for processing') {
    return {
      success: true,
      statusCode: 202,
      message,
      data,
    };
  }
}

export default ApiResponse;
