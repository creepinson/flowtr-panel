import AbstractModule from "../Core/Modules/AbstractModule";
import User, { IUser } from "../Database/Models/User";
import yargs from "yargs";

class CommandLineModule extends AbstractModule {
	public name: string = "CommandLine";
	public registerOnTest: boolean = false;
	protected command: yargs.Argv;

	public register() {
		return this;
	}

	read(argv: string[]) {
		try {
			this.command = yargs(argv).command(
				"db",
				"Database utilities",
				(yargs) => {
					return yargs.command(
						"init",
						"Initialize database tables",
						(yargs) => {
							return yargs(argv).command(
								"user",
								"Create a user in the database.",
								(yargs) => {
									return yargs;
								},
								(_args: yargs.Arguments) => {
									const user = new User({
										email: "demo@example.com",
										username: "demo",
									} as IUser);
									user.setPassword("1234");
									user.save()
										.then(() =>
											console.info(
												"Created a demo user with a password of 1234 succesfully. Please change its password as soon as possible.",
											),
										)
										.catch((err) => {
											console.error(
												"Could not create a demo user - Stack Trace: ",
											);
											console.debug(err);
										});
								},
							);
						},
					);
				},
			);
			this.command.demandCommand(1).argv;
		} catch (err) {
			console.error(err);
		}
	}
}

export default CommandLineModule;
