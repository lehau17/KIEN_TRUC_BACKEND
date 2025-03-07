import User from "../models/user.model.js"

const createUserRepo = async (body) => {
    return await User.create(body)
}


const findUserByEmailRepo = async(email) => {
    return await User.findOne({
        email : email
    })
}

export { createUserRepo, findUserByEmailRepo }




// export class UserRepository {
//    async createUserRepo(body) {
//         return await User.create(body)
//    }
//     async indUserByEmailRepo(email) {
//         return await User.findOne({
//             email: email
//         })
//     }
// }
