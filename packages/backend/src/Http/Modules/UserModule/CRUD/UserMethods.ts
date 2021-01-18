import User from "../../../../Database/Models/User";
import { handleMongoError } from "../../../../Database/MongoError";
import CRUDMethods, { ICRUDMethodData } from "../../../CRUDMethods";
import ResultError from "../../../HttpError";
import { DataType, ModuleRequest } from "paper-wrapper";
import { AuthorizationMiddleware } from "../../../Middleware/AuthorizationMiddleware";
import { MongoError } from "mongodb";

class UserMethods extends CRUDMethods {
	public read?: ICRUDMethodData;
	public update?: ICRUDMethodData;
	public readMethod?: any;
	public updateMethod?: any;

	public create: ICRUDMethodData = {
		request: "users",
		middleware: [new AuthorizationMiddleware()],
		optionalParameters: [],
		requiredParameters: [
			{ name: "username", type: DataType.STRING },
			{ name: "email", type: DataType.STRING },
			{ name: "password", type: DataType.STRING },
		],
	};

	public delete?: ICRUDMethodData = {
		request: "users",
		middleware: [new AuthorizationMiddleware()],
		optionalParameters: [],
		requiredParameters: [{ name: "id", type: DataType.STRING }],
	};

	/**
	 * Creates a user in the database
	 * @param request
	 */
	public createMethod = (request: ModuleRequest) => {
		const user = new User({
			username: request.parameters.username,
			email: request.parameters.email,
		});
		user.setPassword(request.parameters.password);

		// Insert a new user into the collection
		user.save((err) => {
			if (err) {
				return request.error(
					handleMongoError(err, {
						duplicateKey: "USER_EXISTS",
					}),
				);
			}
			return request.respond(user.toJSON());
		});
	};

	/**
	 * Deletes a user in the database
	 * @param request
	 */
	public deleteMethod = (request: ModuleRequest) => {
		const { id } = request.parameters;
		User.findOne({ _id: id })
			.exec()
			.then(async (user) => {
				if (!user)
					return request.error(
						ResultError("DOCUMENT_NOT_FOUND", null, {
							variables: [
								{ name: "FIELD", variable: "id" },
								{ name: "VALUE", variable: id },
							],
						}),
					);

				// TODO: Remove access to account

				// Disable the account
				user.disabled = true;

				// Save the updated model
				await user.save();

				request.respond(null);
			})
			.catch((err: MongoError) => {
				// TODO: Create global Error handler?????
				request.error(handleMongoError(err));
			});
	};
}

export { UserMethods };
