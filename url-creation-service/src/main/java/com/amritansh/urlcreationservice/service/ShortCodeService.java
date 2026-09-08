package com.amritansh.urlcreationservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;

@Service
public class ShortCodeService {

    private static final String BASE62 =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    // 62^3 = 238,328
    private static final long HALF_SPACE =
            62L * 62 * 62;

    private static final int ROUNDS = 10;

    private final SecretKeySpec secretKey;

    public ShortCodeService(
            @Value("${shortcode.secret}") String secret) {

        if (secret.getBytes().length != 16) {
            throw new IllegalArgumentException(
                    "shortcode.secret must be exactly 16 bytes"
            );
        }

        this.secretKey =
                new SecretKeySpec(
                        secret.getBytes(),
                        "HmacSHA256"
                );
    }

    // =========================================================
    // ENCODE
    // =========================================================

    public String encode(long counter) {

        // 62^6 possible 6-character codes
        long codeSpace =
                HALF_SPACE * HALF_SPACE;

        if (counter < 0 || counter >= codeSpace) {
            throw new IllegalArgumentException(
                    "Counter exceeds 6-character code capacity"
            );
        }

        long left =
                counter / HALF_SPACE;

        long right =
                counter % HALF_SPACE;

        /*
         * Feistel permutation.
         *
         * This transforms the Redis counter into another
         * value without collisions.
         */
        for (int round = 0; round < ROUNDS; round++) {

            long functionValue =
                    roundFunction(right, round);

            long newRight =
                    (left + functionValue) % HALF_SPACE;

            left = right;
            right = newRight;
        }

        long result =
                left * HALF_SPACE + right;

        return toBase62(result);
    }

    // =========================================================
    // DECODE
    // =========================================================

    public long decode(String shortCode) {

        if (shortCode == null || shortCode.length() != 6) {
            throw new IllegalArgumentException(
                    "Short code must be exactly 6 characters"
            );
        }

        long value =
                fromBase62(shortCode);

        long left =
                value / HALF_SPACE;

        long right =
                value % HALF_SPACE;

        /*
         * Reverse the Feistel rounds.
         */
        for (int round = ROUNDS - 1; round >= 0; round--) {

            long oldRight =
                    left;

            long oldLeft =
                    Math.floorMod(
                            right - roundFunction(oldRight, round),
                            HALF_SPACE
                    );

            left = oldLeft;
            right = oldRight;
        }

        return left * HALF_SPACE + right;
    }

    // =========================================================
    // FEISTEL ROUND FUNCTION
    // =========================================================

    private long roundFunction(
            long value,
            int round) {

        try {

            Mac mac =
                    Mac.getInstance("HmacSHA256");

            mac.init(secretKey);

            ByteBuffer buffer =
                    ByteBuffer.allocate(16);

            buffer.putLong(value);
            buffer.putLong(round);

            byte[] hash =
                    mac.doFinal(buffer.array());

            long number = 0;

            for (int i = 0; i < 8; i++) {

                number =
                        (number << 8)
                                | (hash[i] & 0xFFL);
            }

            return Math.floorMod(
                    number,
                    HALF_SPACE
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate short code",
                    e
            );
        }
    }

    // =========================================================
    // BASE62 ENCODE
    // =========================================================

    private String toBase62(long value) {

        StringBuilder result =
                new StringBuilder(6);

        for (int i = 0; i < 6; i++) {

            int remainder =
                    (int) (value % 62);

            result.append(
                    BASE62.charAt(remainder)
            );

            value /= 62;
        }

        return result.reverse().toString();
    }

    // =========================================================
    // BASE62 DECODE
    // =========================================================

    private long fromBase62(String value) {

        long result = 0;

        for (int i = 0; i < value.length(); i++) {

            int index =
                    BASE62.indexOf(
                            value.charAt(i)
                    );

            if (index == -1) {
                throw new IllegalArgumentException(
                        "Invalid Base62 character"
                );
            }

            result =
                    result * 62 + index;
        }

        return result;
    }
}