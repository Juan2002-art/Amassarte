
import { google } from "googleapis";
import 'dotenv/config';

async function testSheet() {
    console.log("Checking connection...");
    try {
        if (!process.env.GOOGLE_CREDENTIALS) throw new Error("No creds");
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const sheets = google.sheets({ version: "v4", auth });
        const id = process.env.GOOGLE_SHEETS_ID;

        console.log(`Spreadsheet ID: ${id}`);

        const meta = await sheets.spreadsheets.get({ spreadsheetId: id });
        console.log("Spreadsheet Title:", meta.data.properties?.title);
        console.log("Available Sheets (Tabs):");
        meta.data.sheets?.forEach(s => {
            console.log(` - Title: "${s.properties?.title}", ID: ${s.properties?.sheetId}`);
        });

        // Try reading A1
        const read = await sheets.spreadsheets.values.get({
            spreadsheetId: id,
            range: "A1:M1"
        });
        console.log("Row 1 Content:", read.data.values);

        // Try writing a Test Row to the FIRST sheet found
        const firstSheetName = meta.data.sheets?.[0].properties?.title;
        if (firstSheetName) {
            console.log(`Attempting to write test row to '${firstSheetName}'...`);
            await sheets.spreadsheets.values.append({
                spreadsheetId: id,
                range: `'${firstSheetName}'!A:M`,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: [["TEST_ID", "TEST_DATE", "TEST_TIME", "SYSTEM CHECK", "N/A", "N/A", "N/A", "N/A", "N/A", "If you see this, it works", "Test Note", "0", "Pendiente"]]
                }
            });
            console.log("Write SUCCESS! Check your sheet.");
        }

    } catch (error: any) {
        console.error("ERROR:", error.message);
        if (error.response) {
            console.error("API Error Details:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

testSheet();
