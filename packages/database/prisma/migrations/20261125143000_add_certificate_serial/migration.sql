-- AlterTable
ALTER TABLE `certificates` ADD COLUMN `serial` INTEGER NULL;

UPDATE `certificates` AS c
JOIN (
    SELECT `id`, ROW_NUMBER() OVER (ORDER BY `issuedAt`, `id`) AS `n`
    FROM `certificates`
) AS ranked ON ranked.`id` = c.`id`
SET c.`serial` = ranked.`n`;

ALTER TABLE `certificates` MODIFY `serial` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `certificates_serial_key` ON `certificates`(`serial`);
