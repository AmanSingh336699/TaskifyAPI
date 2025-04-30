import bcrypt from "bcrypt"
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [20, 'Name cannot exceed 20 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Please provide a valid email address',
        ],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date,
    }
}, {
    timestamps: true
})

userSchema.index({ email: 1 })

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next()
    }
    try {
        const salt = await bcrypt.genSalt(14)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        return next(error);
    }
})

userSchema.methods.comparePassword = async function(enteredPassword){
    try {
        return await bcrypt.compare(enteredPassword, this.password)
    } catch (error) {
        throw new Error("Password comparison failed")
    }
}

const User = mongoose.model("User", userSchema)
export default User