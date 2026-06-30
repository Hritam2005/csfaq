class ApiResponse {
  /**
   * Generates a standardized successful JSON response payload.
   * @param {any} data - The data payload to send to the client
   * @param {string} message - A human-readable success message
   * @param {number} statusCode - HTTP status code (default 200)
   * @returns {Object} JSON payload
   */
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  /**
   * Generates a standardized error JSON response payload.
   * @param {string} message - A human-readable error message
   * @param {number} statusCode - HTTP status code (default 500)
   * @param {Array} errors - Array of specific validation errors if applicable
   * @returns {Object} JSON payload
   */
  static error(message = 'Error', statusCode = 500, errors = []) {
    return {
      success: false,
      statusCode,
      message,
      errors: errors.length ? errors : undefined,
    };
  }
}

export default ApiResponse;
