export interface GenericResponse<T> {
    message?: string;
    data?: T;
    page?: number;
    limit?: number;
    totalPages?: number;
    totalDocs?: number;
    error?: string;
}

export interface FetchState<T> {
    isLoading: boolean;
    error: string | object | null;
    data: GenericResponse<T> | null;
}

export interface ErrorFnCallback {
    (error: string): void;
}

export interface LoginPayload {
    userName: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    userName: string;
    name: string;
    role: string;
    id: string;
}

interface Timestamps {
    createdAt: string;
    updatedAt: string;
}

export interface User extends Timestamps {
    name?: string,
    mobile: string,
    isMobileVerified: boolean,
    lastOTP: string,
    firstName?: string,
    lastName?: string,
    gender?: "male" | "female" | "other",
    email?: string,
    registerNo?: string,
    neetRegNo?: string,
    TNEAApplicationNo?: string,
    AIR?: number,
    emailVerified: boolean,
    category?: string,
    group?: string,
    boardOfStudy?: string,
    district?: string,
    pincode?: string,
    dob?: Date,
    imageURL?: string,
    cutoff: [
        {
            physics: number,
            chemistry: number,
            maths: number,
        },
    ],
    NEETScore: [
        {
            score: number,
            minRank: number,
            maxRank: number,
        },
    ],
    userPlan: "default" | "basic-mentorship" | "premium",
}

export interface Announcement extends Timestamps {
    title: string,
    description: string,
    image: string,
    link: string,
    type: "engg" | "medical" | "josaa",
    startDate: string,
    endDate: string,
}