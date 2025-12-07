import { google } from "googleapis";

export async function getGoogleSheetsClient() {
    if (!process.env.GOOGLE_CREDENTIALS) {
        throw new Error("GOOGLE_CREDENTIALS environment variable is missing.");
    }

    try {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive.file",
            ],
        });
        return google.sheets({ version: "v4", auth });
    } catch (error) {
        console.error("Failed to initialize Google Sheets client:", error);
        throw error;
    }
}
