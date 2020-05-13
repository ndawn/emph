export type Friend = {
    id: number;
    first_name: string;
    last_name: string;
    city: {
        id: number;
        title: string;
    };
    photo_100: string;
}

export type VkFriendResponse = {
    response: {
        count: number;
        items: Friend[];
    }
}
