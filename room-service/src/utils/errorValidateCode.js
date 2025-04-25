 const errorMessages = {
    ROOM_NAME_REQUIRED: "ROOM_000001",
    ROOM_PRICE_INVALID: "ROOM_000002",
    ROOM_CAPACITY_INVALID: "ROOM_000003",
    ROOM_TYPE_INVALID: "ROOM_000004",
    ROOM_STATUS_INVALID: "ROOM_000005",
    ROOM_RATING_INVALID: "ROOM_000006",
    ROOM_DISCOUNT_INVALID: "ROOM_000007",
    ROOM_ACTIVE_STATUS_INVALID: "ROOM_000008",
};

// Object ánh xạ từ mã lỗi sang thông báo chi tiết
 const detailedErrorMessages = {
    [errorMessages.ROOM_NAME_REQUIRED]: { name: "Tên phòng là bắt buộc" },
    [errorMessages.ROOM_TYPE_INVALID]: { roomType: "Loại phòng không hợp lệ" },
    [errorMessages.ROOM_PRICE_INVALID]: { price: "Giá phòng không hợp lệ" },
    [errorMessages.ROOM_CAPACITY_INVALID]: { capacity: "Sức chứa phòng không hợp lệ" },
    [errorMessages.ROOM_STATUS_INVALID]: { roomType: "Loại phòng không hợp lệ" },
    [errorMessages.ROOM_RATING_INVALID]: { status: "Trạng thái phòng không hợp lệ" },
    [errorMessages.ROOM_DISCOUNT_INVALID]: { discount: "Giảm giá phải từ 0 đến 100" },
    [errorMessages.ROOM_ACTIVE_STATUS_INVALID]: { isActive: "Trạng thái hoạt động không hợp lệ" },
};


module.exports = {
    errorMessages,
     detailedErrorMessages
}