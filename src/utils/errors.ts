export class AppError extends Error {
    status: number;
    isOperational: boolean;

    constructor(status: number, message: string, isOperational = true) {
        super(message);
        this.status = status;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ParamsError extends AppError {
    constructor(message: string) {
        super(400, message);
    }
}

export class ImageClientError extends AppError {
    constructor(status: number = 400, message: string) {
        super(status, message);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(400, message);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error') {
        super(500, message, false);
    }
}

