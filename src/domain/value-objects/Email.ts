import { ValidationError } from "../../shared/errors/ValidationError";

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(email: string): Email {
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  if (normalized.length > 254 || !emailRegex.test(normalized)) {
    throw new ValidationError("Invalid email format");
  }

    return new Email(normalized);
  }

  public getValue(): string {
    return this.value;
  }
}
