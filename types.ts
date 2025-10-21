export interface User {
  uniqueId: string;
  nickname: string;
  profilePictureUrl: string;
}

export interface ChatMessage extends User {
  comment: string;
}

export interface GiftMessage extends User {
  giftId: number;
  giftName: string;
  repeatCount: number;
  diamondCount: number;
  giftPictureUrl: string;
  describe: string;
  repeatEnd: boolean;
  giftType: number;
  userId: string;
}

export interface LikeMessage extends User {
  likeCount: number;
  totalLikeCount: number;
  label: string;
}

export interface SocialMessage extends User {
  displayType: string;
  label: string;
}

export interface RoomUserMessage {
  viewerCount: number;
  totalLikeCount: number;
}

export interface ConnectionState {
  roomId: string;
  upgradedToWebsocket: boolean;
}

export type TileStatus = 'absent' | 'present' | 'correct' | 'empty' | 'pending';

export interface TileData {
  letter: string;
  status: TileStatus;
}

export interface GuessData {
  guess: string;
  user: User;
  statuses: TileStatus[];
}

export interface LeaderboardEntry {
  user: User;
  wins: number;
}

export type Kamus = {
  [key: string]: {
    kata: string;
    submakna: string[];
    contoh?: string[];
    bahasa?: string;
  };
};