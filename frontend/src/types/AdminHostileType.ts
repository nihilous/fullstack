interface HostileUserInformation {
    id: number;
    ip_address: string;
    attack_count: number;
    is_banned: boolean;
    is_whitelist: boolean;
    log: string;
    created_at: string;
    updated_at: string;
}

export default HostileUserInformation;