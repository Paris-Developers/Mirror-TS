import { ApplicationCommandOptionType, ChannelType } from 'discord.js';

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
	channel_types?: Array<ChannelType>;
	max_length?: number;
	min_value?: number;
	max_value?: number;
};

export class Option {
	//Name of the option
	_name: string;
	//Description of the option
	_description: string;
	//type of the option, you can use the ApplicationCommandOptionTypes class to make code more readable.
	_type: number;
	//whether or not it's a required option
	_required: boolean;
	//Array of valid choices
	_choices: Array<Choices> | undefined;
	//Placeholder value, will be used eventually for automated testing.
	public _placeholder: string | boolean | number | undefined;
	//for a channel option, the kinds of channel Discord offers in its picker. all of them when unset
	_channelTypes: Array<ChannelType> | undefined;
	//for a text option, the most characters Discord lets anyone type. no limit when unset
	_maxLength: number | undefined;
	//for a number option, the smallest and largest numbers Discord accepts. no limit when unset
	_minValue: number | undefined;
	_maxValue: number | undefined;

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

	//limits a channel option's picker to these kinds of channel, so a wrong one can't be chosen.
	//nothing calls this since /defaultvc went away, but /birthdayconfig and /update both take a
	//channel people are meant to pick a text channel for, so it is kept for them
	onlyChannels(...types: Array<ChannelType>): this {
		this._channelTypes = types;
		return this;
	}

	//caps how much can be typed into a text option. Discord turns longer text away itself, before
	//Mirror ever sees it
	maxLength(length: number): this {
		this._maxLength = length;
		return this;
	}

	//keeps a number option between these two numbers; leave either out for no limit on that side.
	//nothing calls this yet, it's here so a number option can be limited the same way as text
	between(min?: number, max?: number): this {
		this._minValue = min;
		this._maxValue = max;
		return this;
	}

	toJson(): JsonOption {
		return {
			name: this._name,
			description: this._description,
			type: this._type,
			required: this._required,
			choices: this._choices,
			...(this._channelTypes ? { channel_types: this._channelTypes } : {}),
			//each limit is only sent when it's set, like the channel kinds above
			...(this._maxLength !== undefined ? { max_length: this._maxLength } : {}),
			...(this._minValue !== undefined ? { min_value: this._minValue } : {}),
			...(this._maxValue !== undefined ? { max_value: this._maxValue } : {}),
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
