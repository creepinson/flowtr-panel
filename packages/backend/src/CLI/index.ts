import CommandLineModule from "./CommandLineModule";

new CommandLineModule().register().read(process.argv.slice(2));
