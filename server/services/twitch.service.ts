import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

const tmi = require("tmi.js");
// const server = http.createServer(app);
const socketIo = require("socket.io");

let io: any;
let http: AxiosInstance = axios.create({
	baseURL: "https://api.twitch.tv/",
	headers: {
		Authorization: process.env.TWITCH_AUTHORIZATION_TOKEN,
		"Client-Id": process.env.TWITCH_CLIENT_ID,
	},
});

const generateAuthorizationToken = async (http: AxiosInstance) => {
	const res: AxiosResponse = await axios.post(
		`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
	);
	http.defaults.headers.Authorization = `Bearer ${res.data.access_token}`;
	console.log(http.defaults.headers.Authorization);
};

const checkAuthorizationToken = async (http: AxiosInstance) => {
	if (http.defaults.headers.Authorization === undefined) {
		await generateAuthorizationToken(http);
	}
};

export const getPopularChannels = async () => {
	try {
		await checkAuthorizationToken(http);

		const res = await http.get(`helix/streams?"first=100`);
		parsePopularChannels(res.data);
		return res.data;
	} catch (error: any) {
		console.log(error);
	}
};

const parsePopularChannels = (data: object) => {
	console.log(data);
};

const getChannelId = async (channelName: string) => {
	try {
		await checkAuthorizationToken(http);
		const res = await http.get(`/helix/users?login=${channelName}`)
		console.log(res.data);
		return res.data
		
		return res.data;
	} catch (error: any) {
		console.log(error);
		
	}
}

export const readChat = (channelName: string) => {
    const io = require('../config/socket.config').getio();
	const client = new tmi.Client({
		channels: [channelName],
	});
	getChannelId(channelName);

	// ping 7tv api for its emotes
	client.connect();

	let words: any = {};

    setInterval(() => {
        words = {}
    }, 10000)

	client.on("message", (channel: any, tags: any, message: any, self: any) => {
		// Emit message to connected clients
        const strippedMsg: string = message.split(" ")
		for (let i: number = 0; i < strippedMsg.length; i++) {
			// words.push(message.split(" ")[word]);
            if (!words[strippedMsg[i]]) {
                words[strippedMsg[i]] = 1;
            } else {
                words[strippedMsg[i]] = words[strippedMsg[i]] += 1;
            }
		}
        const entries: any[] = Object.entries(words);

        // Sort the array based on the values in descending order
        entries.sort((a, b) => b[1] - a[1]);
      
        // Slice the array to get the top 10 elements
        const top10 = entries.slice(0, 5);
      
        // Convert the sliced array back into an object
        const result = Object.fromEntries(top10);

        io.emit("words", result);

	});
};