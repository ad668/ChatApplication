export interface Message {
    id: number;
    // The backend serializes "SenderID"/"ReceiverID" as "senderID"/"receiverID".
    senderID: string | null;
    // Some parts of the client may access the camelCase variant.
    senderId?: string | null;
    receiverID: string | null;
    receiverId?: string | null;
    content: string | null;
    createDate: string;
    isRead: boolean;
}