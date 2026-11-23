-- Normalize empty phones to NULL so UNIQUE allows multiple phone-less users
UPDATE `users` SET `phoneNumber` = NULL WHERE `phoneNumber` = '';

-- Allow email-only OR phone-only accounts
ALTER TABLE `users` MODIFY `email` VARCHAR(191) NULL;

-- Enforce unique phone numbers when present
CREATE UNIQUE INDEX `users_phoneNumber_key` ON `users`(`phoneNumber`);
CREATE INDEX `users_phoneNumber_idx` ON `users`(`phoneNumber`);
