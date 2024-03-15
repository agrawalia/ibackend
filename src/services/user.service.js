import {User} from "../models/user.model.js";


const checkUserExist = async({email, username}) =>{
    let user = await User.findOne({$or:[{username}, {email}]}).lean();  
    return !!user;  // returns true if the user is found otherwise false
};

const createUser = async({fullName, email, password, username}, avatar, coverImage) => {
    const newUser = await User.create({
        fullName,
        email,
        password,
        username : username.toLowerCase(),
        avatar : avatar?.url,
        coverImage : coverImage?.url || ''
    })
    return !!newUser;
}

const findUserById = async(userId) => {
    return await User.findById(userId)
                    .select("-passsword -refreshToken")
                    .lean()
}

export {
    checkUserExist,
    createUser,
    findUserById,
}
