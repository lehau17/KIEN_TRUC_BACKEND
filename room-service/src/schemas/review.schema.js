const { z } = require("zod");
const { errorMessages } = require("../utils/errorValidateCode.js");

const ReviewSchema = z.object({
    roomId: z.string().min(1, { message: errorMessages.REVIEW_ROOM_ID_REQUIRED }),
    comment: z.string().trim().optional(),
    rating: z.number()
        .min(1, { message: errorMessages.REVIEW_RATING_INVALID })
        .max(5, { message: errorMessages.REVIEW_RATING_INVALID }),
});

const ReviewUpdateSchema = ReviewSchema.partial();

module.exports = {
    ReviewSchema,
    ReviewUpdateSchema,
};
