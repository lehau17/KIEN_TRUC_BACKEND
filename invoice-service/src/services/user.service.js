import jwt from "jsonwebtoken"
import { createUserRepo, findUserByEmailRepo } from "../repository/user.repo.js"
import ErrorWithStatus from "../utils/ErrorWithStatus.js"
export const createUserService = async (body) => {
    const foundUser = await findUserByEmailRepo(body.email)
    if (foundUser) {
        throw new ErrorWithStatus("User khoong ton tai", 400)
    }
    const user = await createUserRepo(body)
    const accessToken = jwt.sign({id : user.id, email :user.email, type : "ACCESS_TOKEN"}, "day la khoa bi mat", {
        expiresIn : "5m"
    })
    const refreshToken = jwt.sign({id : user.id, email :user.email, type : "REFRESH_TOKEN"}, "day la khoa bi mat", {
        expiresIn : "5m"
    })
    return {
        user, accessToken, refreshToken
    }
}


export const login = async (body) => {
    const user = await findUserByEmailRepo(body.email)
    if (!user) {
        throw new ErrorWithStatus("User khoong ton tai", 400)
    }
    if (user.password !== body.password) {
        throw new ErrorWithStatus("Password khong chinh xac", 400)
    }
    const accessToken = jwt.sign({id : user.id, email :user.email, type : "ACCESS_TOKEN"}, "day la khoa bi mat", {
        expiresIn : "5m"
    })
    const refreshToken = jwt.sign({id : user.id, email :user.email, type : "REFRESH_TOKEN"}, "day la khoa bi mat", {
        expiresIn : "5m"
    })
    return {
        user:user, accessToken, refreshToken
    }
}
