const errorMessages = {
    // ROOM
    ROOM_NAME_REQUIRED: "ROOM_000001",
    ROOM_PRICE_INVALID: "ROOM_000002",
    ROOM_CAPACITY_INVALID: "ROOM_000003",
    ROOM_TYPE_INVALID: "ROOM_000004",
    ROOM_STATUS_INVALID: "ROOM_000005",
    ROOM_RATING_INVALID: "ROOM_000006",
    ROOM_DISCOUNT_INVALID: "ROOM_000007",
    ROOM_ACTIVE_STATUS_INVALID: "ROOM_000008",

    // REVIEW
    REVIEW_ROOM_ID_REQUIRED: "REVIEW_000001",
    REVIEW_USER_ID_REQUIRED: "REVIEW_000002",
    REVIEW_RATING_INVALID: "REVIEW_000003",
};

const detailedErrorMessages = {
    // ROOM
    [errorMessages.ROOM_NAME_REQUIRED]: { name: "Tên phòng là bắt buộc" },
    [errorMessages.ROOM_TYPE_INVALID]: { roomType: "Loại phòng không hợp lệ" },
    [errorMessages.ROOM_PRICE_INVALID]: { price: "Giá phòng không hợp lệ" },
    [errorMessages.ROOM_CAPACITY_INVALID]: { capacity: "Sức chứa phòng không hợp lệ" },
    [errorMessages.ROOM_STATUS_INVALID]: { status: "Trạng thái phòng không hợp lệ" },
    [errorMessages.ROOM_RATING_INVALID]: { rating: "Điểm đánh giá không hợp lệ" },
    [errorMessages.ROOM_DISCOUNT_INVALID]: { discount: "Giảm giá phải từ 0 đến 100" },
    [errorMessages.ROOM_ACTIVE_STATUS_INVALID]: { isActive: "Trạng thái hoạt động không hợp lệ" },

    // REVIEW
    [errorMessages.REVIEW_ROOM_ID_REQUIRED]: { roomId: "roomId là bắt buộc" },
    [errorMessages.REVIEW_USER_ID_REQUIRED]: { userId: "userId là bắt buộc" },
    [errorMessages.REVIEW_RATING_INVALID]: { rating: "Điểm đánh giá phải từ 1 đến 5" },
};

module.exports = {
    errorMessages,
    detailedErrorMessages,
};
