const { getPopularChannels, readChat, getEmotes } = require("../services/twitch.service");

export const handleGetPopularChannels = async (req: any, res: any) => {
	try {
		const popularChannels = await getPopularChannels();

		return res.json(popularChannels);
	} catch (error: any) {
        console.log(error);
        
    }
};

export const handleGetEmotes = async (req: any, res: any) => {
	getEmotes(req.query.channelId);
}

export const handleReadChat = async (req: any, res: any) => {
	try {
		
		// loadEmotes(req.query.channelId)
		const chat = await readChat(req.query.channelName);
		

		return res.json(chat)
	} catch (error: any) {
		console.log(error);
	}
}