package com.hotel;

import com.hotel.model.Room;
import com.hotel.server.HotelServer;
import com.hotel.service.Hotel;
import com.hotel.util.AppLogger;
import com.hotel.util.EnvConfig;

import java.io.File;
import java.util.List;

/**
 * Main application entry point for the Hotel Reservation System backend.
 * Integrates Supabase PostgreSQL, Supabase Auth, RBAC, and Enterprise Logging.
 * Developed by: Adhwaith AS, Arjun B, Martin Job, Naveen S.
 */
public class Main {
    public static void main(String[] args) {
        // 1. Initialize environment variables & logger
        EnvConfig.load();
        AppLogger.configure();

        System.out.println("==================================================================");
        System.out.println("          HOTEL RESERVATION SYSTEM - JAVA ENTERPRISE BACKEND      ");
        System.out.println("    Supabase PostgreSQL + GoTrue Auth + RBAC + Enterprise Logging ");
        System.out.println("  Students: Adhwaith AS (5), Arjun B (16), Martin (35), Naveen (38) ");
        System.out.println("==================================================================");

        // Determine data directory (backend/data or data relative to cwd)
        String dataDir = "data";
        File dirCheck = new File(dataDir);
        if (!dirCheck.exists() && new File("backend/data").exists()) {
            dataDir = "backend/data";
        }

        AppLogger.info("[Init] Local CSV Storage Path: " + new File(dataDir).getAbsolutePath());
        AppLogger.info("[Init] Log file destination: " + EnvConfig.get("LOG_FILE", "logs/hotel-server.log"));

        // Initialize core Hotel service
        Hotel hotel = new Hotel("The Oasis", dataDir);

        List<Room> rooms = hotel.getAllRooms();
        AppLogger.info("[Init] Active inventory: " + rooms.size() + " hotel rooms.");
        for (Room r : rooms) {
            AppLogger.info("       * Room " + r.getRoomNumber() + " [" + r.getRoomType() + "] - Rate: $" + r.getBasePricePerNight() + "/night (Available: " + r.isAvailable() + ")");
        }

        // Port configuration
        int port = EnvConfig.getInt("PORT", 8080);

        HotelServer server = new HotelServer(port, hotel);
        try {
            server.start();
            System.out.println("==================================================================");
            System.out.println("  Backend is LIVE and ready to receive frontend Next.js requests! ");
            System.out.println("  Health check:     http://localhost:" + port + "/api/health");
            System.out.println("  Dashboard stats:  http://localhost:" + port + "/api/stats");
            System.out.println("  Reservations API: http://localhost:" + port + "/api/reservations");
            System.out.println("  Supabase Status:  " + (hotel.getSupabaseClient().isConfigured() ? "CONNECTED (" + hotel.getSupabaseClient().getSupabaseUrl() + ")" : "LOCAL PERSISTENCE MODE (Configure .env)"));
            System.out.println("==================================================================");

            // Add clean shutdown hook
            final int finalPort = port;
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                AppLogger.info("\n[Shutdown] Stopping Hotel Reservation server on port " + finalPort + "...");
                server.stop();
                AppLogger.info("[Shutdown] Server stopped gracefully.");
            }));

        } catch (Exception e) {
            AppLogger.error("Fatal error starting Hotel server: " + e.getMessage(), e);
            System.exit(1);
        }
    }
}
