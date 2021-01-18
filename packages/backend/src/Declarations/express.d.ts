import { IUser } from "../Database/Models/User";
import { Multer } from "multer";

declare module "express" {
	interface Request {
		user?: IUser;
		files: {
			files: Array<Multer.File>;
		};
	}
}
