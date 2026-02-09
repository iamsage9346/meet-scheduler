import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull().default('availability'), // 'availability' | 'booking'
  dates: text('dates').array().notNull(),
  timeStart: integer('time_start').notNull(),
  timeEnd: integer('time_end').notNull(),
  hostSlots: jsonb('host_slots').$type<string[]>(), // For booking type: available slots set by host
  hostName: text('host_name'), // Host's display name
  hostEmail: text('host_email'), // Host's email for notifications
  meetLink: text('meet_link'), // Google Meet or other video call link
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const participants = pgTable('participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  email: text('email'), // Optional email for booking type
  availableSlots: jsonb('available_slots').$type<string[]>().notNull(), // For booking: single slot array
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
