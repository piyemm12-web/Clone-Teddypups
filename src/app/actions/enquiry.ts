"use server";

/**
 * Enquiry server action shared by the puppy detail EnquiryForm and the
 * contact page LetterForm. There is no backend, so a valid enquiry is
 * validated, logged and accepted.
 */

export type EnquiryField =
  | "name"
  | "phone"
  | "email"
  | "area"
  | "puppyId"
  | "message"
  | "website";

export type EnquiryState = {
  status: "idle" | "error" | "success";
  errors?: Partial<Record<EnquiryField, string>>;
  message?: string;
};

// Note: a "use server" module may only export async functions (types are
// erased), so callers pass `{ status: "idle" }` as the initial state.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

function field(formData: FormData, key: EnquiryField): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function sendEnquiry(
  _prevState: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const data = {
    name: field(formData, "name"),
    phone: field(formData, "phone"),
    email: field(formData, "email"),
    area: field(formData, "area"),
    puppyId: field(formData, "puppyId"),
    message: field(formData, "message"),
    website: field(formData, "website"),
  };

  // Honeypot: bots fill every field. Pretend it worked and drop it.
  if (data.website) return { status: "success" };

  const errors: Partial<Record<EnquiryField, string>> = {};
  if (data.name.length < 2) errors.name = "Please tell us your name.";
  else if (data.name.length > 80) errors.name = "Please keep your name under 80 characters.";

  const digits = data.phone.replace(/\D/g, "");
  if (!data.phone) errors.phone = "Please add a phone or WhatsApp number.";
  else if (!PHONE_RE.test(data.phone) || digits.length < 7 || digits.length > 15)
    errors.phone = "Please enter a valid phone number, including the country code.";

  if (data.email && (data.email.length > 254 || !EMAIL_RE.test(data.email)))
    errors.email = "Please enter a valid email address.";

  if (data.area.length > 80) errors.area = "Please keep your area under 80 characters.";
  if (data.puppyId.length > 64) errors.puppyId = "Please choose a puppy from the list.";
  if (data.message.length > 2000)
    errors.message = "Please keep your message under 2000 characters.";

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      errors,
      message: "Please check the highlighted fields and try again.",
    };
  }

  // No backend: log the accepted enquiry on the server.
  console.info("[enquiry] received", {
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    area: data.area || undefined,
    puppyId: data.puppyId || undefined,
    messageLength: data.message.length,
  });

  return { status: "success" };
}
