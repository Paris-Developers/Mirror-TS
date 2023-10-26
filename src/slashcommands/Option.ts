import { ApplicationCommandOptionType } from 'discord.js';

type Choices = {
	name: string;
	value: string | boolean | number;
};

type JsonOption = {
	name: string;
	description: string;
	type: number;
	required: boolean;
	choices: Array<Choices> | undefined;
};

export class Option {
	//Name of the option
	_name: string;
	//Description of the option
	_description: string;
	//type of the option, you can use the ApplicationCommandOptionType class to make code more readable.
	_type: number;
	//whether or not it's a required option
	_required: boolean;
	//Array of valid choices
	_choices: Array<Choices> | undefined;
	//Placeholder value, will be used eventually for automated testing.
	public _placeholder: string | boolean | number | undefined;

	constructor(
		name: string,
		description: string,
		type: number,
		required: boolean,
		placeholder?: string | boolean | number,
		choices?: Array<Choices>
	) {
		this._name = name;
		this._description = description;
		this._type = type;
		this._required = required;
		this._choices = choices;
		this._placeholder = placeholder;
	}

	toJson(): JsonOption {
		return {
			name: this._name,
			description: this._description,
			type: this._type,
			required: this._required,
			choices: this._choices,
		};
	}
}

type JsonSubcommand = {
	name: string;
	description: string;
	type: number;
	options: Array<JsonOption>;
};

export class Subcommand {
	_name: string;
	_description: string;
	_options: Array<Option> | undefined;
	_type: number = ApplicationCommandOptionType.Subcommand;

	constructor(name: string, description: string, options?: Array<Option>) {
		this._name = name;
		this._description = description;
		if (options === undefined) options = [];
		this._options = options;
	}

	toJson(): JsonSubcommand {
		let jsonOptions = [];
		for (let option of this._options!) {
			jsonOptions.push(option.toJson());
		}
		return {
			name: this._name,
			description: this._description,
			options: jsonOptions,
			type: this._type,
		};
	}
}
