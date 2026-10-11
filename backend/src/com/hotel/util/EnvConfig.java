package com.hotel.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Lightweight .env file loader and environment configuration manager.
 * Loads variables from .env files with fallback to System environment variables.
 */
public class EnvConfig {
    private static final Map<String, String> ENV_VARS = new HashMap<>();
    private static boolean initialized = false;

    static {
        load();
    }

    public static synchronized void load() {
        if (initialized) return;

        // Search for .env file in multiple likely locations
        String[] possiblePaths = {
            ".env",
            "../.env",
            "backend/.env",
            System.getProperty("user.dir") + "/.env",
            System.getProperty("user.dir") + "/../.env"
        };

        File envFile = null;
        for (String path : possiblePaths) {
            File f = new File(path);
            if (f.exists() && f.isFile()) {
                envFile = f;
                break;
            }
        }

        if (envFile != null) {
            try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) continue;

                    // Handle export prefix if present: "export KEY=VAL"
                    if (line.startsWith("export ")) {
                        line = line.substring(7).trim();
                    }

                    int equalsIdx = line.indexOf('=');
                    if (equalsIdx > 0) {
                        String key = line.substring(0, equalsIdx).trim();
                        String val = line.substring(equalsIdx + 1).trim();

                        // Strip quotes if present
                        if ((val.startsWith("\"") && val.endsWith("\"")) ||
                            (val.startsWith("'") && val.endsWith("'"))) {
                            if (val.length() >= 2) {
                                val = val.substring(1, val.length() - 1);
                            }
                        }
                        ENV_VARS.put(key, val);
                    }
                }
            } catch (IOException e) {
                System.err.println("[EnvConfig] Warning: Could not read .env file: " + e.getMessage());
            }
        }

        initialized = true;
    }

    /**
     * Retrieves an environment variable. Checks:
     * 1. System.getenv(key)
     * 2. Loaded .env map
     * 3. System.getProperty(key)
     * 4. defaultValue
     */
    public static String get(String key, String defaultValue) {
        String sysEnv = System.getenv(key);
        if (sysEnv != null && !sysEnv.trim().isEmpty()) {
            return sysEnv.trim();
        }

        String envVal = ENV_VARS.get(key);
        if (envVal != null && !envVal.trim().isEmpty()) {
            return envVal.trim();
        }

        String sysProp = System.getProperty(key);
        if (sysProp != null && !sysProp.trim().isEmpty()) {
            return sysProp.trim();
        }

        return defaultValue;
    }

    public static String get(String key) {
        return get(key, "");
    }

    public static int getInt(String key, int defaultValue) {
        String val = get(key, null);
        if (val == null) return defaultValue;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public static boolean getBoolean(String key, boolean defaultValue) {
        String val = get(key, null);
        if (val == null) return defaultValue;
        return "true".equalsIgnoreCase(val.trim()) || "1".equals(val.trim());
    }

    public static boolean has(String key) {
        String val = get(key, null);
        return val != null && !val.trim().isEmpty();
    }

    public static Map<String, String> getAll() {
        return Collections.unmodifiableMap(ENV_VARS);
    }
}
