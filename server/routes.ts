import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getGoogleSheetsClient } from "./services/google-sheets";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    authenticated: boolean;
  }
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Amassarte18122025";

const OrderSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  direccion: z.string(),
  zona: z.string().optional(),
  costoDomicilio: z.union([z.string(), z.number()]).optional(),
  tipoEntrega: z.enum(['domicilio', 'recoger', 'comeraqui']),
  formaPago: z.enum(['efectivo', 'tarjeta', 'transferencia']),
  detallesAdicionales: z.string().optional(),
  items: z.string().min(1, "El pedido debe contener items"),
  total: z.string(),
});

type Order = z.infer<typeof OrderSchema>;

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PED-${timestamp}-${random}`;
}

function mapTipoEntrega(value: string): string {
  const tipoEntregaMap: Record<string, string> = {
    'domicilio': 'Envío a Domicilio',
    'recoger': 'Recoger en Tienda',
    'comeraqui': 'Comer Aquí',
  };
  return tipoEntregaMap[value] || value;
}

function mapFormaPago(value: string): string {
  const formaPagoMap: Record<string, string> = {
    'efectivo': 'Efectivo',
    'tarjeta': 'Tarjeta',
    'transferencia': 'Transferencia',
  };
  return formaPagoMap[value] || value;
}

// Helper to find the correct sheet name (prefer 'Pedidos', else first one)
async function getTargetSheetName(client: any, spreadsheetId: string): Promise<string> {
  try {
    const meta = await client.spreadsheets.get({ spreadsheetId });
    const sheets = meta.data.sheets || [];
    const pedidosSheet = sheets.find((s: any) => s.properties?.title === 'Pedidos');
    if (pedidosSheet) return 'Pedidos';
    // Fallback to the first sheet found
    return sheets[0]?.properties?.title || 'Sheet1';
  } catch (error) {
    console.error("Error fetching sheet metadata:", error);
    return 'Pedidos'; // Default fallback
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.session && req.session.authenticated) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  // Auth Routes
  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      req.session.authenticated = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Contraseña incorrecta" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Error logging out" });
      res.json({ success: true });
    });
  });

  app.get("/api/check-auth", (req, res) => {
    res.json({ authenticated: !!req.session.authenticated });
  });

  // Config API routes

  app.get("/api/config", async (_req, res) => {
    try {
      const config = await storage.getConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to load config" });
    }
  });

  app.post("/api/config", requireAuth, async (req, res) => {
    try {
      await storage.updateConfig(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  // Orders Management API
  app.get("/api/orders", requireAuth, async (_req, res) => {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
      if (!spreadsheetId) {
        return res.json([]); // return empty if no sheets configured logic for ease of dev
      }
      const sheetsClient = await getGoogleSheetsClient();
      const sheetName = await getTargetSheetName(sheetsClient, spreadsheetId);

      const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!A2:M`, // Use dynamic sheet name
      });

      const rows = response.data.values || [];
      const orders = rows.map((row, index) => ({
        localId: index + 2,
        id: row[0],
        fecha: row[1],
        hora: row[2],
        nombre: row[3],
        telefono: row[4],
        zona: row[5],
        direccion: row[6],
        tipoEntrega: row[7],
        formaPago: row[8],
        items: row[9],
        detalles: row[10],
        total: row[11],
        estado: row[12] || "Pendiente"
      })).reverse();

      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;
      const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
      if (!spreadsheetId) return res.status(500).json({ error: "No Sheet ID" });

      const sheetsClient = await getGoogleSheetsClient();
      const sheetName = await getTargetSheetName(sheetsClient, spreadsheetId);

      // Find row
      const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!A:A`, // IDs are in Col A
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === id);

      if (rowIndex === -1) {
        return res.status(404).json({ error: "Order not found" });
      }

      const exactRow = rowIndex + 1; // 1-based index

      // Update Status Column (Current M -> Index 12 -> Col M)
      // A=0, ... L=11, M=12.
      // Range M{row}

      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!M${exactRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[status]]
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // Order API route
  app.post("/api/order", async (req, res) => {
    try {
      const validatedData = OrderSchema.parse(req.body);

      // Get the spreadsheet ID from environment variable
      const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
      if (!spreadsheetId) {
        // Fallback for local dev without sheets
        console.warn("GOOGLE_SHEETS_ID missing, returning success mock");
        return res.json({ success: true, orderId: "MOCK-" + Date.now(), message: "Pedido creado (Mock)" });
      }

      const sheetsClient = await getGoogleSheetsClient();

      const orderId = generateOrderId();
      const now = new Date();

      // Convert to Colombia timezone (America/Bogota)
      const colombiaFormatter = new Intl.DateTimeFormat("es-CO", {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const parts = colombiaFormatter.formatToParts(now);
      const partsMap = Object.fromEntries(parts.map(p => [p.type, p.value]));

      const fecha = `${partsMap.day}/${partsMap.month}/${partsMap.year}`;
      const hora = `${partsMap.hour}:${partsMap.minute}:${partsMap.second}`;

      const domicilioInfo = validatedData.zona ? `${validatedData.zona} ($${validatedData.costoDomicilio})` : "N/A";

      const rowData = [
        orderId,
        fecha,
        hora,
        validatedData.nombre,
        validatedData.telefono,
        domicilioInfo, // Zona
        validatedData.direccion,
        mapTipoEntrega(validatedData.tipoEntrega),
        mapFormaPago(validatedData.formaPago),
        validatedData.items,
        validatedData.detallesAdicionales || "",
        validatedData.total,
        "Pendiente", // Estado
      ];

      const sheetName = await getTargetSheetName(sheetsClient, spreadsheetId);

      // Get the next available row after the headers (check column A)
      const sheetResp = await sheetsClient.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!A:A`,
      });

      const existingRows = sheetResp.data.values?.length || 1;
      const nextRow = Math.max(existingRows + 1, 2); // At least row 2

      // Insert data starting from row 2 (skipping header row), column A
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A${nextRow}:M${nextRow}`, // Extend to M for Status
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [rowData],
        },
      });

      res.json({ success: true, orderId, message: "Pedido creado exitosamente" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      console.error("Order error:", error);
      res.status(500).json({ error: error.message || "Error al crear el pedido" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
