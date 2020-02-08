export interface IProfile { 
    displayName: string,
    username: string,
    bio: string,
    image: string,
    photos: IPhoto[],
    following: boolean,
    followersCount: number,
    followingCount: number
}

export interface IUserActivity { 
    id: string;
    title: string;
    category: string;
    date: Date;
}

export interface IPhoto {
    id: string,
    url: string,
    isMain: boolean
}