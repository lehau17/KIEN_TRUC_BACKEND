const { z } = require("zod");
const { errorMessages } = require("../utils/errorValidateCode");


const RoomSchema = z.object({
    name: z.string().min(1, { message: errorMessages.ROOM_NAME_REQUIRED }),
    price: z.number().min(0, { message: errorMessages.ROOM_PRICE_INVALID }),
    capacity: z.number().min(1, { message: errorMessages.ROOM_CAPACITY_INVALID }),
    description: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
    roomType: z.enum(["Standard", "Deluxe", "Suite"], { message: errorMessages.ROOM_TYPE_INVALID }),
    status: z.enum(["available", "booked", "maintenance"]).optional(),
    rating: z.number().min(1).max(5).optional(),
    discount: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional()
});
const RoomUpdateSchema = RoomSchema.partial();

module.exports = {
    RoomSchema,
    RoomUpdateSchema
};

