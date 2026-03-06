import { ValidationError } from "../../shared/errors/ValidationError";

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(email: string): Email {
  const normalized = email.trim().toLowerCase();

  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

    if (normalized.length > 254 || !emailRegex.test(normalized)) {
    throw new ValidationError("Invalid email format");
  }

    return new Email(normalized);
  }

  public getValue(): string {
    return this.value;
  }
}
