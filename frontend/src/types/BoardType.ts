interface post_for_bbs {
    id: number
    user_id: number
    title: string
    nickname: string
    is_admin: boolean
    updated_at: string
}

interface post_with_replies  {
    id: number
    user_id: number
    title: string
    text: string
    nickname: string
    is_admin: boolean
    updated_at: string
    replies: {
        reply_id: number
        reply_user_id: number
        reply_user_nickname: string
        reply_text: string
        reply_is_admin: boolean
        reply_updated_at: string
    }[] | null
}

export type {post_for_bbs, post_with_replies}