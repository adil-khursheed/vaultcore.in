import { z } from "zod";

export const CredentialTypeSchema = z.enum([
  "login",
  "card",
  "identity",
  "note",
  "ssh_key",
]);

export const BaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: CredentialTypeSchema,
  note: z.string().optional(),
  isFavorite: z.boolean(),
});

export const LoginSchema = BaseSchema.extend({
  type: z.literal("login"),
  username: z.string().optional(),
  password: z.string().optional(),
  url: z.string().optional(),
  otp: z.string().optional(),
});

export const CardSchema = BaseSchema.extend({
  type: z.literal("card"),
  cardNumber: z.string().optional(),
  brand: z
    .enum([
      "visa",
      "mastercard",
      "amex",
      "discover",
      "rupay",
      "maestro",
      "diners_club",
      "jcb",
      "other",
    ])
    .optional(),
  cvv: z.string().optional(),
  expiryMonth: z
    .enum([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ])
    .optional(),
  expiryYear: z.string().optional(),
  cardholderName: z.string().optional(),
});

export const IdentitySchema = BaseSchema.extend({
  type: z.literal("identity"),
  identityTitle: z.enum(["mr", "mrs", "ms", "dr", "mx"]).optional(),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  company: z.string().optional(),
  socialSecurityNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address_1: z.string().optional(),
  address_2: z.string().optional(),
  address_3: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  addressCountry: z.string().optional(),
});

export const NoteSchema = BaseSchema.extend({
  type: z.literal("note"),
});

export const SshKeySchema = BaseSchema.extend({
  type: z.literal("ssh_key"),
  privateKey: z.string().optional(),
  publicKey: z.string().optional(),
  fingerprint: z.string().optional(),
});

export const ItemSchema = z.discriminatedUnion("type", [
  LoginSchema,
  CardSchema,
  IdentitySchema,
  NoteSchema,
  SshKeySchema,
]);
