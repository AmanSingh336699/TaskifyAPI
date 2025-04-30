import mongoose from "mongoose"

export const connectDb = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`)
    } catch (error) {
        console.log("error connecting mongoose", error)
        process.exit(1)
    }
}

export const closeMongoDB = async () => {
    try {
      await mongoose.connection.close();
      console.info('MongoDB connection closed');
    } catch (error) {
      console.error(`Error closing MongoDB connection: ${error.message}`);
      process.exit(1);
    }
  };