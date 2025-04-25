import { createUserService, login } from "../services/user.service.js"

const createUserController = async (req, res, next) => {
    const result = await createUserService(req.body)
    return res.json(result)
}


const loginController = async (req, res) => {
    try {
        const result = await login(req.body)
        return res.json(result)
    } catch (error) {
        return res.status(400).json({"isSuccess":false, "message" : error.message})
    }
}


export { createUserController, loginController }

