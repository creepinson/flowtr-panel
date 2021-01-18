import mongoose, { LeanDocument } from "mongoose";
import crypto, { BinaryLike } from "crypto";
import * as jwt from "jsonwebtoken";
import File, { IFile } from "./File";
import { IProfile, ProfileSchema } from "./Profile";
import Configuration from "../../Core/Configuration";
import FileModule from "../../File/FileModule";

const hashPassword = (password: BinaryLike, salt: BinaryLike) => {
	const config = Configuration.getInstance();
	return crypto
		.pbkdf2Sync(
			password,
			salt,
			config.values.password_iterations,
			config.values.password_key_length,
			"sha512",
		)
		.toString("hex");
};

interface IUser extends mongoose.Document {
	username: string;
	email: string;
	hash: string;
	salt: string;
	profile: IProfile;
	disabled: boolean;

	setPassword(password: BinaryLike): Function;
	validPassword(password: BinaryLike): Function;
	generateJWT(): string;
	setProfilePicture(id?: string): Promise<unknown>;
	/*
    {
		username: this.username,
		email: this.email,
		token: this.generateJWT(),
	};
    */
	toAuthJSON(): () => Pick<LeanDocument<IUser>, "email" | "username"> & {
		token: string;
	};
}

const UserSchema = new mongoose.Schema<IUser>(
	{
		username: {
			type: String,
			unique: true,
			required: [true, "Username is required"],
			index: true,
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
			unique: true,
			required: [true, "Email address is required"],
			index: true,
		},
		hash: String,
		salt: String,
		profile: ProfileSchema,
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

UserSchema.methods.setPassword = function (password: BinaryLike) {
	this.salt = crypto.randomBytes(16).toString("hex");
	this.hash = hashPassword(password, this.salt);
};

UserSchema.methods.validPassword = function (password: BinaryLike) {
	const hash = hashPassword(password, this.salt);
	return this.hash === hash;
};

UserSchema.methods.generateJWT = function () {
	const config = Configuration.getInstance();

	const today = new Date();
	const exp = new Date(today);
	exp.setDate(today.getDate() + config.values.jwt_lifetime_days);

	return jwt.sign(
		{
			id: this._id,
			exp: parseInt(String(exp.getTime() / 1000)),
		},
		config.values.jwt_secret,
	);
};

UserSchema.methods.setProfilePicture = function (fileId: number) {
	return new Promise<void>((resolve, reject) => {
		if (fileId) {
			File.findOne({
				_id: fileId,
				// Make sure the file is an image
				mimeTypes: FileModule.IMAGE_MIME_TYPES,
			})
				.then((file: IFile) => {
					this.profile = {
						pictureFile: file.downloadUrl,
					} as IProfile;

					resolve();
				})
				.catch(reject);
		} else {
			this.profile = {
				pictureFile: undefined,
			} as IProfile;
			resolve();
		}
	});
};

UserSchema.methods.toJSON = function () {
	return {
		id: this._id,
		username: this.username,
		email: this.email,
		profile: this.profile ? this.profile.toJSON() : undefined,
	};
};

UserSchema.methods.toAuthJSON = function () {
	return {
		username: this.username,
		email: this.email,
		token: this.generateJWT(),
	};
};

const User: mongoose.Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
export { IUser, UserSchema };
