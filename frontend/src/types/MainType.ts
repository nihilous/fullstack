interface UserDetailProperty {
    id: number;
    name: string | null;
    description: string | null;
    gender: number | null;
    birthdate: string | null;
    nationality: number | null;
    nickname: string;
    name_original: string;
}

interface UserDetailWithDetails {
    user_detail: true;
    record: { [key: string]: UserDetailProperty };
}

interface UserBasicProperty {
    id: number;
    email: string | null;
    nickname: string;
}

interface UserDetailWithoutDetails {
    user_detail: false;
    record: { [key: string]: UserBasicProperty };
}

type UserDetailResponse = UserDetailWithDetails | UserDetailWithoutDetails;

export type {UserDetailProperty, UserDetailResponse}