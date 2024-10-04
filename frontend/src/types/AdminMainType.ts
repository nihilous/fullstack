interface JoinOnlyProperty {
    id: number;
    email: string;
    nickname: string;
    is_active: number;
    last_login: string;
    created_at: string;
    post_count: number;
    reply_count: number;
}

interface RegularProperty {
    id: number;
    email: string;
    nickname: string;
    is_active: number;
    last_login: string;
    created_at: string;
    post_count: number;
    reply_count: number;
    children: {
        detail_id: number;
        name: string;
        description: string;
        gender: number;
        birthdate: string;
        nationality: number;
        name_original: string;
    }[];
}

interface AdminMainUserInformation {
    joinonly: JoinOnlyProperty[];
    regular: RegularProperty[];
}

export type {JoinOnlyProperty, RegularProperty, AdminMainUserInformation}