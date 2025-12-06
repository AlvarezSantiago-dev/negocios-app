class CustomError {
  static new({ message, statusCode }) {
    const error = new Error(message); //recibir message y crear un nuevo error con ese message
    error.statusCode = statusCode; //recibir el status code
    throw error; // arrojar el error
  }
}

export default CustomError;
