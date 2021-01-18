import mongoose from "mongoose";

interface IProfile extends mongoose.Document {
	pictureFile: string;
}

const ProfileSchema = new mongoose.Schema<IProfile>(
	{
		pictureFile: String,
	},
	{
		timestamps: true,
	},
);

ProfileSchema.methods.toJSON = function () {
	return {
		pictureFile: this.pictureFile,
	};
};

export { IProfile, ProfileSchema };
