import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

const { Server } = require("socket.io")

const tmi = require('tmi.js');
// const server = http.createServer(app);
const io = new Server(8001, {});

let http: AxiosInstance = axios.create({
    baseURL: "https://api.twitch.tv/",
    headers: {"Authorization": process.env.TWITCH_AUTHORIZATION_TOKEN, "Client-Id": process.env.TWITCH_CLIENT_ID}
});

const generateAuthorizationToken = async (http: AxiosInstance) => {
    const res: AxiosResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`);
    http.defaults.headers.Authorization = `Bearer ${res.data.access_token}`;
    console.log(http.defaults.headers.Authorization);
    
}

const checkAuthorizationToken = async (http: AxiosInstance) => {
    if (http.defaults.headers.Authorization === undefined) {
        await generateAuthorizationToken(http);
    }
}

export const getPopularChannels = async () => {
    try {
        await checkAuthorizationToken(http);
        
        const res = await http.get(`helix/streams?"first=100`);
        parsePopularChannels(res.data)
        return res.data

    } catch (error: any) {
        console.log(error);
        
    }
}

const parsePopularChannels = (data: object) => {
    console.log(data);
    
}

export const readChat = (channelName: string) => {
    console.log(channelName);
    
    // io.emit('message', { user: tags['display-name'], message });

    const client = new tmi.Client({
        channels: [ "mizkif" ]
    });

    client.connect();

    client.on('message', (channel: any, tags: any, message: any, self: any) => {
        // "Alca: Hello, World!"
        // console.log(`${tags['display-name']}: ${message}`);
        if (tags["subscriber"] == true) {
            console.log(`${tags['display-name']}: ${message}`);
            io.emit('message', { user: tags['display-name'], message });

            return `${tags['display-name']}: ${message}`

        }
    });
}