import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters'],
      },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
    },
    tags: [
        {
            type: String,
            trim: true,
            enum: ['work', 'personal', 'urgent', 'important'],
        },
    ],
}, {
    timestamps: true
})

todoSchema.index({ userId: 1, status: 1 })
todoSchema.index({ userId: 1, priority: 1 })
todoSchema.index({ userId: 1, dueDate: 1 })


todoSchema.methods.isOverdue = function(){
    return this.dueDate < Date.now()
}

todoSchema.pre("save", async function(next){
    try {
        if(!this.isModified("dueDate")){
            return next()
        }
        if(this.dueDate && this.dueDate < Date.now()){
            throw new Error('Due date cannot be in the past');
        }
        next()
    } catch (error) {
        next(error)
    }
})

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;