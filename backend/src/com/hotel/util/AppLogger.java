package com.hotel.util;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Production-ready structured logger with ANSI color terminal output and persistent file logging.
 * Logs HTTP requests, RBAC security events, and Supabase database interactions.
 */
public class AppLogger {
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    // ANSI Escape Codes for aesthetic terminal logging
    private static final String RESET = "\u001B[0m";
    private static final String BOLD = "\u001B[1m";
    private static final String DIM = "\u001B[2m";
    private static final String RED = "\u001B[31m";
    private static final String GREEN = "\u001B[32m";
    private static final String YELLOW = "\u001B[33m";
    private static final String BLUE = "\u001B[34m";
    private static final String PURPLE = "\u001B[35m";
    private static final String CYAN = "\u001B[36m";
    private static final String WHITE = "\u001B[37m";

    private static String logFilePath = "logs/hotel-server.log";
    private static String logLevel = "INFO";
    private static boolean fileLoggingEnabled = true;

    static {
        configure();
    }

    public static synchronized void configure() {
        String level = EnvConfig.get("LOG_LEVEL", "INFO").toUpperCase();
        logLevel = level;
        String path = EnvConfig.get("LOG_FILE", "logs/hotel-server.log");
        logFilePath = path;

        // Ensure logs directory exists
        try {
            File f = new File(logFilePath);
            File dir = f.getParentFile();
            if (dir != null && !dir.exists()) {
                dir.mkdirs();
            }
        } catch (Exception e) {
            System.err.println("[Logger] Warning: Could not initialize log file directory: " + e.getMessage());
        }
    }

    private static void logToFile(String formattedMessage) {
        if (!fileLoggingEnabled) return;
        try (FileWriter fw = new FileWriter(logFilePath, true);
             PrintWriter pw = new PrintWriter(fw)) {
            // Strip ANSI codes for clean file writing
            String plainMessage = formattedMessage.replaceAll("\u001B\\[[;\\d]*m", "");
            pw.println(plainMessage);
        } catch (IOException ignored) {
            // Avoid recursion on log file error
        }
    }

    private static boolean shouldLog(String level) {
        int currentLevelOrder = getLevelOrder(logLevel);
        int messageLevelOrder = getLevelOrder(level);
        return messageLevelOrder >= currentLevelOrder;
    }

    private static int getLevelOrder(String level) {
        switch (level) {
            case "DEBUG": return 1;
            case "INFO": return 2;
            case "WARN": return 3;
            case "ERROR": return 4;
            default: return 2;
        }
    }

    public static void info(String message) {
        if (!shouldLog("INFO")) return;
        String time = LocalDateTime.now().format(TIME_FORMAT);
        String msg = String.format("%s%s%s [%sINFO%s]  %s", DIM, time, RESET, CYAN, RESET, message);
        System.out.println(msg);
        logToFile(msg);
    }

    public static void debug(String message) {
        if (!shouldLog("DEBUG")) return;
        String time = LocalDateTime.now().format(TIME_FORMAT);
        String msg = String.format("%s%s%s [%sDEBUG%s] %s", DIM, time, RESET, BLUE, RESET, message);
        System.out.println(msg);
        logToFile(msg);
    }

    public static void warn(String message) {
        if (!shouldLog("WARN")) return;
        String time = LocalDateTime.now().format(TIME_FORMAT);
        String msg = String.format("%s%s%s [%sWARN%s]  %s%s%s", DIM, time, RESET, YELLOW, RESET, YELLOW, message, RESET);
        System.out.println(msg);
        logToFile(msg);
    }

    public static void error(String message) {
        error(message, null);
    }

    public static void error(String message, Throwable throwable) {
        if (!shouldLog("ERROR")) return;
        String time = LocalDateTime.now().format(TIME_FORMAT);
        String msg = String.format("%s%s%s [%sERROR%s] %s%s%s", DIM, time, RESET, RED, RESET, RED, message, RESET);
        System.err.println(msg);
        logToFile(msg);
        if (throwable != null) {
            throwable.printStackTrace(System.err);
            try (FileWriter fw = new FileWriter(logFilePath, true);
                 PrintWriter pw = new PrintWriter(fw)) {
                throwable.printStackTrace(pw);
            } catch (IOException ignored) {}
        }
    }

    /**
     * Specialized HTTP Request Logger:
     * Outputs method, path, response code, latency, caller identity and role.
     */
    public static void http(String method, String path, int statusCode, long durationMs, String user, String role, String ip) {
        String time = LocalDateTime.now().format(TIME_FORMAT);
        String statusColor = statusCode >= 500 ? RED : statusCode >= 400 ? YELLOW : statusCode >= 300 ? CYAN : GREEN;
        String methodColor = "GET".equalsIgnoreCase(method) ? BLUE :
                             "POST".equalsIgnoreCase(method) ? GREEN :
                             "PUT".equalsIgnoreCase(method) ? YELLOW :
                             "DELETE".equalsIgnoreCase(method) ? RED : WHITE;

        String userInfo = (user != null && !user.isEmpty())
                ? String.format(" | %s (%s)", user, (role != null ? role : "ANON"))
                : " | Anonymous";

        String consoleMsg = String.format("%s%s%s [%sHTTP%s] %s%-6s%s %-32s -> %s%d%s %s(%dms)%s%s [ip: %s]",
                DIM, time, RESET,
                PURPLE, RESET,
                methodColor, method, RESET,
                path,
                statusColor, statusCode, RESET,
                DIM, durationMs, RESET,
                userInfo,
                ip != null ? ip : "unknown");

        System.out.println(consoleMsg);
        logToFile(consoleMsg);
    }

    /**
     * Specialized Supabase Database Operation Logger.
     */
    public static void supabase(String operation, String table, int statusCode, String details) {
        String time = LocalDateTime.now().format(TIME_FORMAT);
        String statusColor = statusCode >= 400 ? RED : GREEN;
        String consoleMsg = String.format("%s%s%s [%sSUPABASE%s] %-6s on table '%s' -> %s%d%s %s",
                DIM, time, RESET,
                GREEN, RESET,
                operation, table,
                statusColor, statusCode, RESET,
                details != null ? "(" + details + ")" : "");

        System.out.println(consoleMsg);
        logToFile(consoleMsg);
    }

    /**
     * Specialized RBAC Security Audit Logger.
     */
    public static void security(String event, String actor, String role, boolean permitted, String details) {
        String time = LocalDateTime.now().format(TIME_FORMAT);
        String outcomeColor = permitted ? GREEN : RED;
        String outcome = permitted ? "GRANTED" : "DENIED";

        String consoleMsg = String.format("%s%s%s [%sRBAC-AUDIT%s] %s | Actor: %s | Role: %s -> %s%s%s | %s",
                DIM, time, RESET,
                YELLOW, RESET,
                event,
                actor != null ? actor : "Anonymous",
                role != null ? role : "None",
                outcomeColor, outcome, RESET,
                details != null ? details : "");

        System.out.println(consoleMsg);
        logToFile(consoleMsg);
    }
}
