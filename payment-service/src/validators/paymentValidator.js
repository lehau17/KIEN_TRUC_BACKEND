const Joi = require('joi');

const bookingDataSchema = Joi.object({
    bookingId: Joi.string().required().messages({
        'any.required': 'Booking ID is required'
    }),
    userId: Joi.string().required().messages({
        'any.required': 'User ID is required'
    }),
    roomId: Joi.string().required().messages({
        'any.required': 'Room ID is required'
    }),
    amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be a positive number',
        'any.required': 'Amount is required'
    }),
    status: Joi.string().valid('pending', 'PENDING', 'PENDING_PAYMENT').required().messages({
        'any.only': 'Status must be "PENDING_PAYMENT"',
        'any.required': 'Status is required'
    })
});

module.exports = { bookingDataSchema };
