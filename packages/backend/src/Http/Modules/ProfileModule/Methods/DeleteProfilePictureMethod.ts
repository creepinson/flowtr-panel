import {
	DataType,
	IParameter,
	Middleware,
	ModuleMethod,
	ModuleRequest,
	RequestType,
} from "paper-wrapper";
import { AuthorizationMiddleware } from "../../../Middleware/AuthorizationMiddleware";
import { handleMongoError } from "../../../../Database/MongoError";
import { MongoError } from "mongodb";
import { IUser } from "../../../../Database/Models/User";

class DeleteProfilePictureMethod implements ModuleMethod {
	public request: string = "delete-profile-picture";
	public requestType: RequestType = RequestType.DELETE;
	public optionalParameters: IParameter[] = [];
	public requiredParameters: IParameter[] = [];
	public middleware: Middleware[] = [new AuthorizationMiddleware()];

	handle(request: ModuleRequest) {
		const user: IUser = request.request.user as IUser;

		// Set the profile picture to null, so it will be deleted
		user.setProfilePicture(null)
			.then(async () => {
				await user.save();

				request.respond(null);
			})
			.catch((err: MongoError) => {
				request.error(handleMongoError(err));
			});
	}
}

export { DeleteProfilePictureMethod };
