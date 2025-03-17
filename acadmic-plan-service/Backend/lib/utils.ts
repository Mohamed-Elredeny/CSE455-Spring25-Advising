import { NextResponse } from 'next/server';

export function handleError(error: any, message: string) {
    console.error(message, error);
    return NextResponse.json({ error: message }, { status: 500 });
}

export function validateRequestBody(body: any, requiredFields: string[]) {
    for (const field of requiredFields) {
        if (!body[field]) {
            return `Missing ${field}`;
        }
    }
    return null;
}